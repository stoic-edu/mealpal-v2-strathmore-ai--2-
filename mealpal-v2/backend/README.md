# Meal Buddy AI Model Server

A small FastAPI service that loads the four trained models and exposes them as REST
endpoints for the Next.js app (`../src/pages/api/ai/*.ts` calls this).

| Model file                          | Type                  | Endpoint                    | Predicts                                   |
|--------------------------------------|-----------------------|------------------------------|---------------------------------------------|
| `meal_buddy_recommendation_model.pkl`   | RandomForestClassifier| `POST /predict/recommend`, `/predict/recommend/batch` | Whether a meal is a good match for a student |
| `meal_buddy_forecast_model.pkl`         | XGBRegressor          | `POST /predict/forecast`     | Expected order volume for a meal            |
| `meal_buddy_queue_model.pkl`            | XGBClassifier (3-class)| `POST /predict/queue`       | Cafeteria congestion: Low / Medium / High   |
| `meal_buddy_waste_model.pkl`            | XGBClassifier (3-class)| `POST /predict/waste`       | Food waste risk: Low / Medium / High        |

## Setup

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Check it's alive:

```bash
curl http://localhost:8000/health
# {"status":"ok","models_loaded":["recommend","forecast","queue","waste"]}
```

## Wiring it to the Next.js app

The frontend calls its own API routes (`/api/ai/recommend`, `/api/ai/forecast`,
`/api/ai/queue`, `/api/ai/waste`, `/api/ai/recommend-batch`), which proxy to this
server. Point them at a different host/port by setting `AI_BACKEND_URL` in
`mealpal-v2/.env.local` (see `.env.local.example`), then:

```bash
npm run dev   # from the mealpal-v2 root, in a separate terminal
```

Both processes need to be running for the AI features to work — the recommendation
strip on the home page, the live queue-congestion badges, and the Kitchen → AI
Insights tab (demand forecast + waste risk) will otherwise show a
"model server unreachable" message.

## Notes on feature encoding

- The recommendation model was trained with `Goal` and `DietTag` label-encoded
  alphabetically. `src/lib/ai-encoding.ts` reproduces that mapping and also maps the
  app's free-text dietary preference tags onto the nearest trained category, since
  the app doesn't store the exact same fields the training data used (age, a single
  per-meal "Budget" figure, etc.). Sensible defaults are used where the app has no
  equivalent field — see the comments in that file.
- `Produced`, `Orders`, `Popularity`, and `ExamWeek` (used by the waste and queue
  models) aren't tracked live by this demo app, so they're estimated from the
  forecast model's own output and each item's review count — see
  `src/components/KitchenAIInsights.tsx` and `src/lib/ai-client.ts` for exactly how.
