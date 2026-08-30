// Client-side helpers that call the /api/ai/* proxy routes, which in turn call the
// Python model server (backend/app.py). Each function builds the exact feature
// payload a given model was trained on.
import type { FoodItem } from "@/lib/mock-data";
import {
  DEFAULT_AGE,
  DEFAULT_BMI,
  DEFAULT_EXAM_WEEK,
  DEFAULT_MEAL_BUDGET_KES,
  encodeDietTag,
  encodeGoal,
  inferDietTag,
  inferGoal,
} from "@/lib/ai-encoding";

export interface RecommendProfile {
  age?: number;
  bmi?: number;
  budget?: number;
  dietaryPreferences?: string[];
  calorieGoal?: number;
}

export interface MealMatch {
  id: string;
  match_probability: number;
  is_recommended: boolean;
}

/** Ranks a list of foods for a given student profile using the recommendation model.
 *  Returns the raw model output keyed by food id — highest match first. */
export async function rankFoodsForStudent(
  profile: RecommendProfile,
  foodItems: FoodItem[]
): Promise<MealMatch[]> {
  if (foodItems.length === 0) return [];
  const goal = inferGoal({ dietaryPreferences: profile.dietaryPreferences, calorieGoal: profile.calorieGoal });

  const meals = foodItems.map((f) => {
    const info = f.hasPortions && f.portions ? f.portions.full : f.fixedPrice!;
    return {
      id: f.id,
      diet_encoded: encodeDietTag(inferDietTag(f.tags)),
      calories: info.calories,
      protein: info.protein,
      carbs: info.carbs,
      fat: info.fat,
      price_kes: info.price,
      health_score: f.healthScore,
    };
  });

  const res = await fetch("/api/ai/recommend-batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      age: profile.age ?? DEFAULT_AGE,
      bmi: profile.bmi ?? DEFAULT_BMI,
      budget: profile.budget ?? DEFAULT_MEAL_BUDGET_KES,
      goal_encoded: encodeGoal(goal),
      meals,
    }),
  });
  if (!res.ok) throw new Error(`recommend-batch failed: ${res.status}`);
  const data = await res.json();
  return data.results as MealMatch[];
}

export interface QueuePrediction {
  congestion_class: number;
  congestion_label: "Low" | "Medium" | "High";
  probabilities: Record<string, number>;
}

/** Predicts current queue congestion for a cafeteria using the queue model.
 *  `ordersLast15Min` and `servers` are the live signals kitchens would track;
 *  in this demo app we derive a stand-in from the cafeteria's current queueLength. */
export async function predictQueue(opts: {
  hour: number;
  ordersLast15Min: number;
  servers: number;
  examWeek?: boolean;
}): Promise<QueuePrediction> {
  const res = await fetch("/api/ai/queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hour: opts.hour,
      orders_last_15_min: opts.ordersLast15Min,
      servers: opts.servers,
      exam_week: opts.examWeek ?? DEFAULT_EXAM_WEEK,
    }),
  });
  if (!res.ok) throw new Error(`queue prediction failed: ${res.status}`);
  return res.json();
}

export interface ForecastPrediction {
  predicted_orders: number;
}

/** Predicts expected order volume for a food item using the forecast model. */
export async function predictForecast(food: FoodItem): Promise<ForecastPrediction> {
  const info = food.hasPortions && food.portions ? food.portions.full : food.fixedPrice!;
  const res = await fetch("/api/ai/forecast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rating: food.rating,
      calories: info.calories,
      protein: info.protein,
      carbs: info.carbs,
      fat: info.fat,
      price_kes: info.price,
    }),
  });
  if (!res.ok) throw new Error(`forecast prediction failed: ${res.status}`);
  return res.json();
}

export interface WastePrediction {
  waste_risk_class: number;
  waste_risk_label: "Low" | "Medium" | "High";
  probabilities: Record<string, number>;
}

/** Predicts waste risk for a food item using the waste model. `produced` and
 *  `orders` are the day's production/order counts — in this demo they're
 *  estimated from the forecasted demand since there's no live kitchen tally. */
export async function predictWaste(
  food: FoodItem,
  opts: { produced: number; orders: number; dayOfWeek: number; examWeek?: boolean; popularity: number }
): Promise<WastePrediction> {
  const info = food.hasPortions && food.portions ? food.portions.full : food.fixedPrice!;
  const res = await fetch("/api/ai/waste", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      produced: opts.produced,
      orders: opts.orders,
      rating: food.rating,
      calories: info.calories,
      protein: info.protein,
      price_kes: info.price,
      day_of_week: opts.dayOfWeek,
      exam_week: opts.examWeek ?? DEFAULT_EXAM_WEEK,
      popularity: opts.popularity,
    }),
  });
  if (!res.ok) throw new Error(`waste prediction failed: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Kitchen walk-in simulation weighting — the kitchen dashboard simulates the
// occasional walk-in order from a fixed list of common dish names (it has no
// live point-of-sale feed to draw from). Rather than picking one uniformly at
// random, we ask the forecast and waste models to weight that choice, so the
// simulation is guided by the trained models without changing what's on screen.
// ---------------------------------------------------------------------------
interface WalkInMealFeatures {
  name: string;
  rating: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price_kes: number;
}

// Approximate nutrition for the walk-in dish names shown on the kitchen display
// (these are generic display names, not tied 1:1 to a FoodItem in mock-data).
const WALK_IN_MEALS: WalkInMealFeatures[] = [
  { name: "Full Rice", rating: 4.5, calories: 420, protein: 7, carbs: 92, fat: 2, price_kes: 100 },
  { name: "Half Kamande", rating: 4.7, calories: 180, protein: 10, carbs: 24, fat: 4, price_kes: 50 },
  { name: "Ugali", rating: 4.6, calories: 380, protein: 7, carbs: 84, fat: 2, price_kes: 70 },
  { name: "Nyama Choma", rating: 4.8, calories: 550, protein: 45, carbs: 5, fat: 35, price_kes: 250 },
  { name: "Pilau Rice", rating: 4.5, calories: 480, protein: 10, carbs: 95, fat: 8, price_kes: 150 },
  { name: "Chicken Stew", rating: 4.6, calories: 350, protein: 28, carbs: 10, fat: 18, price_kes: 200 },
  { name: "Grilled Tilapia", rating: 4.7, calories: 540, protein: 50, carbs: 3, fat: 34, price_kes: 300 },
  { name: "Githeri", rating: 4.4, calories: 380, protein: 16, carbs: 68, fat: 5, price_kes: 90 },
];

export interface WalkInWeight {
  name: string;
  /** Relative likelihood this dish is the next simulated walk-in order (from the forecast model). */
  weight: number;
  /** Highest quantity the waste model says is safe to simulate for this dish today. */
  maxQuantity: 1 | 2;
}

/** Runs the forecast + waste models once for the kitchen display's fixed walk-in
 *  dish list. Falls back to uniform weights if the AI backend is unreachable. */
export async function getSimulatedWalkInWeights(): Promise<WalkInWeight[]> {
  const dayOfWeek = new Date().getDay();
  try {
    const results = await Promise.all(
      WALK_IN_MEALS.map(async (m) => {
        const forecastRes = await fetch("/api/ai/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: m.rating,
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fat: m.fat,
            price_kes: m.price_kes,
          }),
        });
        if (!forecastRes.ok) throw new Error("forecast failed");
        const { predicted_orders } = (await forecastRes.json()) as ForecastPrediction;

        const wasteRes = await fetch("/api/ai/waste", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            produced: Math.round(predicted_orders * 1.15),
            orders: Math.round(predicted_orders),
            rating: m.rating,
            calories: m.calories,
            protein: m.protein,
            price_kes: m.price_kes,
            day_of_week: dayOfWeek,
            exam_week: DEFAULT_EXAM_WEEK,
            popularity: Math.min(1, predicted_orders / 200),
          }),
        });
        if (!wasteRes.ok) throw new Error("waste failed");
        const { waste_risk_label } = (await wasteRes.json()) as WastePrediction;

        return {
          name: m.name,
          weight: Math.max(1, predicted_orders),
          maxQuantity: (waste_risk_label === "High" ? 1 : 2) as 1 | 2,
        };
      })
    );
    return results;
  } catch {
    return WALK_IN_MEALS.map((m) => ({ name: m.name, weight: 1, maxQuantity: 2 as const }));
  }
}
