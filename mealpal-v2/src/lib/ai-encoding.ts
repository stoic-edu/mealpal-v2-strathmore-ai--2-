// Shared helpers for turning app domain objects (FoodItem, AuthUser, StudentProfile)
// into the exact numeric feature encodings the trained models expect.
//
// The recommendation model was trained with sklearn LabelEncoder on two categorical
// columns. LabelEncoder assigns codes in sorted alphabetical order, so we reproduce
// that mapping here from the training data's distinct values:
//   Goal    (students.csv): Balanced Diet, Budget Friendly, Muscle Gain, Weight Loss
//   DietTag (meals.csv):    Balanced, Budget Friendly, High Protein, Muscle Gain,
//                           Vegetarian, Weight Loss

export const GOAL_ENCODING: Record<string, number> = {
  "Balanced Diet": 0,
  "Budget Friendly": 1,
  "Muscle Gain": 2,
  "Weight Loss": 3,
};

export const DIET_TAG_ENCODING: Record<string, number> = {
  "Balanced": 0,
  "Budget Friendly": 1,
  "High Protein": 2,
  "Muscle Gain": 3,
  "Vegetarian": 4,
  "Weight Loss": 5,
};

/**
 * The app's student profile doesn't store a single "Goal" enum the way the
 * training data did — it stores calorie goals + free-text dietary preference tags.
 * We map from what the app actually has onto the nearest trained Goal category.
 */
export function inferGoal(opts: {
  dietaryPreferences?: string[];
  calorieGoal?: number;
  goalHint?: "lose" | "maintain" | "gain"; // from the calculator page, if available
}): keyof typeof GOAL_ENCODING {
  const prefs = (opts.dietaryPreferences ?? []).map((p) => p.toLowerCase());
  if (opts.goalHint === "lose" || prefs.some((p) => p.includes("weight loss") || p.includes("weightloss"))) {
    return "Weight Loss";
  }
  if (opts.goalHint === "gain" || prefs.some((p) => p.includes("muscle") || p.includes("high protein"))) {
    return "Muscle Gain";
  }
  if (prefs.some((p) => p.includes("budget"))) {
    return "Budget Friendly";
  }
  return "Balanced Diet";
}

/**
 * A FoodItem's `tags` array is free-form (e.g. ["Halal", "Vegetarian", "Budget"]),
 * unlike the training data's single DietTag column. We pick the closest match.
 */
export function inferDietTag(tags: string[]): keyof typeof DIET_TAG_ENCODING {
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.some((t) => t.includes("muscle"))) return "Muscle Gain";
  if (lower.some((t) => t.includes("high protein"))) return "High Protein";
  if (lower.some((t) => t.includes("weight loss"))) return "Weight Loss";
  if (lower.some((t) => t.includes("vegetarian"))) return "Vegetarian";
  if (lower.some((t) => t.includes("budget"))) return "Budget Friendly";
  return "Balanced";
}

export function encodeGoal(goal: string): number {
  return GOAL_ENCODING[goal] ?? GOAL_ENCODING["Balanced Diet"];
}

export function encodeDietTag(dietTag: string): number {
  return DIET_TAG_ENCODING[dietTag] ?? DIET_TAG_ENCODING["Balanced"];
}

/** Sensible fallback per-meal budget (KES) when we don't have one on the profile. */
export const DEFAULT_MEAL_BUDGET_KES = 250;
export const DEFAULT_AGE = 21;
export const DEFAULT_BMI = 22.4;

/** Is it currently exam week? No calendar data in this app, so it's a manual flag
 *  the kitchen/staff can flip; defaults to false. Centralized here so every model
 *  call agrees on the same value. */
export const DEFAULT_EXAM_WEEK = false;

/**
 * Converts the queue model's Low/Medium/High congestion prediction back into the
 * same `queueLength` / `waitTime` numbers the existing cafeteria cards already
 * display, so the UI's shape never changes — only the numbers become model-driven.
 */
export function congestionToQueueStats(
  label: "Low" | "Medium" | "High"
): { queueLength: number; waitTime: number } {
  switch (label) {
    case "Low":
      return { queueLength: 4, waitTime: 3 };
    case "Medium":
      return { queueLength: 12, waitTime: 8 };
    case "High":
      return { queueLength: 22, waitTime: 15 };
  }
}
