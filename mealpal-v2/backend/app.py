"""
Meal Buddy AI Model Server
========================
Serves the four trained models (recommendation, forecast, queue, waste) behind a
small FastAPI REST API so the Next.js app can call them for live predictions.

Run:
    pip install -r requirements.txt
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload

The Next.js app talks to this service through its own API routes
(src/pages/api/ai/*.ts), which default to http://localhost:8000 via the
AI_BACKEND_URL environment variable — see mealpal-v2/.env.local.example.
"""
import os
import warnings
from pathlib import Path
from typing import Literal

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

warnings.filterwarnings("ignore")  # silence sklearn/xgboost version-mismatch warnings

MODELS_DIR = Path(os.environ.get("MODELS_DIR", Path(__file__).parent / "models"))

app = FastAPI(title="Meal Buddy AI Model Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # the Next.js server (not the browser) is the caller
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Model loading — done once at startup, kept in memory for the life of the process
# ---------------------------------------------------------------------------
_MODEL_FILES = {
    "recommend": "meal_buddy_recommendation_model.pkl",
    "forecast": "meal_buddy_forecast_model.pkl",
    "queue": "meal_buddy_queue_model.pkl",
    "waste": "meal_buddy_waste_model.pkl",
}

models: dict[str, object] = {}


@app.on_event("startup")
def load_models() -> None:
    for key, filename in _MODEL_FILES.items():
        path = MODELS_DIR / filename
        if not path.exists():
            print(f"[WARN] model file missing: {path} — /predict/{key} will 503 until it's added")
            continue
        models[key] = joblib.load(path)
        print(f"[OK] loaded {key} model from {path.name} "
              f"({type(models[key]).__name__})")


def _get_model(key: str):
    model = models.get(key)
    if model is None:
        raise HTTPException(status_code=503, detail=f"'{key}' model is not loaded on the server")
    return model


# ---------------------------------------------------------------------------
# /predict/recommend — RandomForestClassifier, binary "is this a good match" model
# Trained features: Age, BMI, Budget, GoalEncoded, DietEncoded, Calories, Protein,
#                    Carbs, Fat, PriceKES, HealthScore
# ---------------------------------------------------------------------------
RECOMMEND_FEATURES = [
    "Age", "BMI", "Budget", "GoalEncoded", "DietEncoded",
    "Calories", "Protein", "Carbs", "Fat", "PriceKES", "HealthScore",
]


class RecommendRequest(BaseModel):
    age: float
    bmi: float
    budget: float
    goal_encoded: int = Field(ge=0, le=3)
    diet_encoded: int = Field(ge=0, le=5)
    calories: float
    protein: float
    carbs: float
    fat: float
    price_kes: float
    health_score: float


class RecommendResponse(BaseModel):
    match_probability: float
    is_recommended: bool


@app.post("/predict/recommend", response_model=RecommendResponse)
def predict_recommend(req: RecommendRequest) -> RecommendResponse:
    model = _get_model("recommend")
    row = pd.DataFrame([[
        req.age, req.bmi, req.budget, req.goal_encoded, req.diet_encoded,
        req.calories, req.protein, req.carbs, req.fat, req.price_kes, req.health_score,
    ]], columns=RECOMMEND_FEATURES)
    proba = float(model.predict_proba(row)[0][1])
    return RecommendResponse(match_probability=proba, is_recommended=proba >= 0.5)


class RecommendBatchRequest(BaseModel):
    age: float
    bmi: float
    budget: float
    goal_encoded: int = Field(ge=0, le=3)
    meals: list[dict] = Field(
        description="Each item needs: id, diet_encoded, calories, protein, carbs, fat, price_kes, health_score"
    )


@app.post("/predict/recommend/batch")
def predict_recommend_batch(req: RecommendBatchRequest) -> dict:
    model = _get_model("recommend")
    if not req.meals:
        return {"results": []}
    rows = []
    for m in req.meals:
        rows.append([
            req.age, req.bmi, req.budget, req.goal_encoded, m["diet_encoded"],
            m["calories"], m["protein"], m["carbs"], m["fat"], m["price_kes"], m["health_score"],
        ])
    df = pd.DataFrame(rows, columns=RECOMMEND_FEATURES)
    probs = model.predict_proba(df)[:, 1]
    results = [
        {"id": m["id"], "match_probability": float(p), "is_recommended": bool(p >= 0.5)}
        for m, p in zip(req.meals, probs)
    ]
    results.sort(key=lambda r: r["match_probability"], reverse=True)
    return {"results": results}


# ---------------------------------------------------------------------------
# /predict/forecast — XGBRegressor, predicts expected order volume for a meal
# Trained features: Rating, Calories, Protein, Carbs, Fat, PriceKES
# ---------------------------------------------------------------------------
FORECAST_FEATURES = ["Rating", "Calories", "Protein", "Carbs", "Fat", "PriceKES"]


class ForecastRequest(BaseModel):
    rating: float
    calories: float
    protein: float
    carbs: float
    fat: float
    price_kes: float


class ForecastResponse(BaseModel):
    predicted_orders: float


@app.post("/predict/forecast", response_model=ForecastResponse)
def predict_forecast(req: ForecastRequest) -> ForecastResponse:
    model = _get_model("forecast")
    row = pd.DataFrame([[
        req.rating, req.calories, req.protein, req.carbs, req.fat, req.price_kes,
    ]], columns=FORECAST_FEATURES)
    pred = float(model.predict(row)[0])
    return ForecastResponse(predicted_orders=max(0.0, pred))


# ---------------------------------------------------------------------------
# /predict/queue — XGBClassifier, 3-class queue congestion (0=Low, 1=Medium, 2=High)
# Trained features: Hour, OrdersLast15Min, Servers, ExamWeek
# ---------------------------------------------------------------------------
QUEUE_FEATURES = ["Hour", "OrdersLast15Min", "Servers", "ExamWeek"]
QUEUE_LABELS = {0: "Low", 1: "Medium", 2: "High"}


class QueueRequest(BaseModel):
    hour: int = Field(ge=0, le=23)
    orders_last_15_min: int = Field(ge=0)
    servers: int = Field(ge=1)
    exam_week: bool = False


class QueueResponse(BaseModel):
    congestion_class: int
    congestion_label: Literal["Low", "Medium", "High"]
    probabilities: dict[str, float]


@app.post("/predict/queue", response_model=QueueResponse)
def predict_queue(req: QueueRequest) -> QueueResponse:
    model = _get_model("queue")
    row = pd.DataFrame([[
        req.hour, req.orders_last_15_min, req.servers, int(req.exam_week),
    ]], columns=QUEUE_FEATURES)
    pred_class = int(model.predict(row)[0])
    proba = model.predict_proba(row)[0]
    return QueueResponse(
        congestion_class=pred_class,
        congestion_label=QUEUE_LABELS[pred_class],
        probabilities={QUEUE_LABELS[i]: float(p) for i, p in enumerate(proba)},
    )


# ---------------------------------------------------------------------------
# /predict/waste — XGBClassifier, 3-class waste risk (0=Low, 1=Medium, 2=High)
# Trained features: Produced, Orders, Rating, Calories, Protein, PriceKES,
#                    DayOfWeek, ExamWeek, Popularity
# ---------------------------------------------------------------------------
WASTE_FEATURES = [
    "Produced", "Orders", "Rating", "Calories", "Protein",
    "PriceKES", "DayOfWeek", "ExamWeek", "Popularity",
]
WASTE_LABELS = {0: "Low", 1: "Medium", 2: "High"}


class WasteRequest(BaseModel):
    produced: float
    orders: float
    rating: float
    calories: float
    protein: float
    price_kes: float
    day_of_week: int = Field(ge=0, le=6)
    exam_week: bool = False
    popularity: float


class WasteResponse(BaseModel):
    waste_risk_class: int
    waste_risk_label: Literal["Low", "Medium", "High"]
    probabilities: dict[str, float]


@app.post("/predict/waste", response_model=WasteResponse)
def predict_waste(req: WasteRequest) -> WasteResponse:
    model = _get_model("waste")
    row = pd.DataFrame([[
        req.produced, req.orders, req.rating, req.calories, req.protein,
        req.price_kes, req.day_of_week, int(req.exam_week), req.popularity,
    ]], columns=WASTE_FEATURES)
    pred_class = int(model.predict(row)[0])
    proba = model.predict_proba(row)[0]
    return WasteResponse(
        waste_risk_class=pred_class,
        waste_risk_label=WASTE_LABELS[pred_class],
        probabilities={WASTE_LABELS[i]: float(p) for i, p in enumerate(proba)},
    )


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "models_loaded": list(models.keys())}
