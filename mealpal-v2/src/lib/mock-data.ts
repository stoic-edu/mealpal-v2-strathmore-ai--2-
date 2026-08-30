export interface StudentProfile {
  id: string;
  name: string;
  studentId: string;
  bmi: number;
  weight: number;
  height: number;
  budget: number;
  dailyBudget: number;
  allergies: string[];
  dietaryPreferences: string[];
  calorieGoal: number;
  caloriesToday: number;
}

// A food item is ALWAYS a single dish (rice, ugali, a stew, a drink, a snack — never
// a pre-built "combo meal"). Students build their own plate by combining items.
export type FoodCategory = "Staple" | "Stew" | "Vegetable" | "Side" | "Drink" | "Snack";

// Staples, stews & vegetables are served from a serving line and sold as a Half or
// Full scoop. Sides/drinks/snacks are sold as a fixed single unit (a bottle, a piece,
// a cup) so they don't have portion sizes.
export interface NutritionInfo {
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type Portion = "half" | "full";

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  image: string;
  category: FoodCategory;
  cafeteria: string;
  allergens: string[];
  tags: string[];
  healthScore: number;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  hasPortions: boolean;
  portions?: Record<Portion, NutritionInfo>;
  fixedPrice?: NutritionInfo;
}

export function getServingsFor(food: FoodItem, portion?: Portion | null): NutritionInfo {
  if (food.hasPortions && food.portions) {
    return food.portions[portion ?? "full"];
  }
  return food.fixedPrice!;
}

export function formatPortionLabel(food: FoodItem, portion?: Portion | null): string {
  if (!food.hasPortions) return food.name;
  return `${portion === "half" ? "Half" : "Full"} ${food.name}`;
}

export interface PlateLine {
  lineId: string;
  food: FoodItem;
  portion: Portion | null;
  quantity: number;
}

export interface OrderItem {
  name: string;
  portion: Portion | null;
  quantity: number;
  price: number;
  calories: number;
  allergens: string[];
}

export type OrderStatus = "queued" | "on_the_way" | "ready" | "completed" | "cancelled";

export interface Order {
  id: string;
  referenceCode: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  cafeteria: string;
  peopleAhead: number;
  startingPeopleAhead: number;
  onTheWaySince?: string;
  notified3Ahead?: boolean;
  pickupEta: string;
  createdAt: string;
  paymentMethod: string;
}

export interface Cafeteria {
  id: string;
  name: string;
  image: string;
  queueLength: number;
  waitTime: number;
  isOpen: boolean;
  hours: string;
}

export interface CulturalSpecial {
  id: string;
  day: string;
  cuisine: string;
  description: string;
  image: string;
  items: string[];
}

export interface HealthRecommendation {
  caloriesToday: number;
  caloriesRemaining: number;
  mealsRecommended: number;
  spendingRecommendation: number;
  foodsToAvoid: string[];
  topRecommendations: string[];
}

export const currentStudent: StudentProfile = {
  id: "stu-001",
  name: "Aisyah Rahman",
  studentId: "S2024-38721",
  bmi: 22.4,
  weight: 58,
  height: 165,
  budget: 36000,
  dailyBudget: 750,
  allergies: ["Shellfish", "Peanuts"],
  dietaryPreferences: ["Halal", "High Protein"],
  calorieGoal: 2000,
  caloriesToday: 650,
};

export const healthRecs: HealthRecommendation = {
  caloriesToday: 650,
  caloriesRemaining: 1350,
  mealsRecommended: 2,
  spendingRecommendation: 280,
  foodsToAvoid: ["Mandazi", "Soda"],
  topRecommendations: ["Full Rice + Half Kamande", "Half Ugali + Half Beef Stew", "Full Githeri"],
};

export const cafeterias: Cafeteria[] = [
  {
    id: "cf-1",
    name: "Main Cafeteria",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
    queueLength: 12,
    waitTime: 8,
    isOpen: true,
    hours: "7:00 AM - 9:00 PM",
  },
  {
    id: "cf-2",
    name: "Upesi",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    queueLength: 5,
    waitTime: 3,
    isOpen: true,
    hours: "8:00 AM - 7:00 PM",
  },
  {
    id: "cf-3",
    name: "Pate Cafe",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400",
    queueLength: 3,
    waitTime: 2,
    isOpen: true,
    hours: "9:00 AM - 6:00 PM",
  },
  {
    id: "cf-4",
    name: "Springs of Olives",
    image: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Veritas%20University.Cafeteria.jpg&width=400",
    queueLength: 18,
    waitTime: 14,
    isOpen: true,
    hours: "7:30 AM - 8:00 PM",
  },
];

// Realistic single-dish campus cafeteria menu. Staples/Stews/Vegetables are scoop-served
// (Half or Full); Sides/Drinks/Snacks are fixed single units.
export const foods: FoodItem[] = [
  // ---------- Main Cafeteria ----------
  {
    id: "f-rice",
    name: "White Rice",
    description: "Steamed white rice, served fresh from the line",
    image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400",
    category: "Staple",
    cafeteria: "Main Cafeteria",
    allergens: [],
    tags: ["Halal", "Vegetarian", "Budget"],
    healthScore: 70,
    rating: 4.5,
    reviewCount: 412,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 60, calories: 260, protein: 4, carbs: 58, fat: 1 },
      full: { price: 100, calories: 420, protein: 7, carbs: 92, fat: 2 },
    },
  },
  {
    id: "f-ugali",
    name: "Ugali",
    description: "Maize meal cooked firm, the everyday campus staple",
    image: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/African%20Dish%20Ugali%20with%20Tilapia.jpg&width=400",
    category: "Staple",
    cafeteria: "Main Cafeteria",
    allergens: [],
    tags: ["Halal", "Vegetarian", "Budget", "Local Favorite"],
    healthScore: 65,
    rating: 4.6,
    reviewCount: 530,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 40, calories: 230, protein: 4, carbs: 50, fat: 1 },
      full: { price: 70, calories: 380, protein: 7, carbs: 84, fat: 2 },
    },
  },
  {
    id: "f-kamande",
    name: "Kamande",
    description: "Slow-cooked beans stew in a rich tomato base — the campus classic",
    image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400",
    category: "Stew",
    cafeteria: "Main Cafeteria",
    allergens: [],
    tags: ["Halal", "Vegetarian", "High Protein", "Budget", "Local Favorite"],
    healthScore: 88,
    rating: 4.7,
    reviewCount: 689,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 50, calories: 180, protein: 10, carbs: 24, fat: 4 },
      full: { price: 90, calories: 310, protein: 17, carbs: 42, fat: 7 },
    },
  },
  {
    id: "f-beefstew",
    name: "Beef Stew",
    description: "Slow-braised beef chunks in a spiced tomato and onion gravy",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    category: "Stew",
    cafeteria: "Main Cafeteria",
    allergens: [],
    tags: ["Halal", "High Protein", "Local Favorite"],
    healthScore: 72,
    rating: 4.6,
    reviewCount: 401,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 120, calories: 260, protein: 18, carbs: 8, fat: 17 },
      full: { price: 200, calories: 440, protein: 32, carbs: 14, fat: 29 },
    },
  },
  {
    id: "f-sukuma-main",
    name: "Sukuma Wiki",
    description: "Sautéed collard greens with onion and tomato",
    image: "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400",
    category: "Vegetable",
    cafeteria: "Main Cafeteria",
    allergens: [],
    tags: ["Vegetarian", "Healthy", "Budget"],
    healthScore: 95,
    rating: 4.3,
    reviewCount: 210,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 30, calories: 45, protein: 2, carbs: 5, fat: 2 },
      full: { price: 50, calories: 80, protein: 4, carbs: 9, fat: 3 },
    },
  },
  {
    id: "f-chapati",
    name: "Chapati",
    description: "Soft, layered wholewheat flatbread — sold per piece",
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400",
    category: "Side",
    cafeteria: "Main Cafeteria",
    allergens: ["Gluten"],
    tags: ["Side", "Local Favorite"],
    healthScore: 60,
    rating: 4.4,
    reviewCount: 312,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 20, calories: 150, protein: 3, carbs: 26, fat: 4 },
  },
  {
    id: "f-samosa",
    name: "Beef Samosa",
    description: "Crispy pastry filled with spiced minced beef — sold per piece",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    category: "Snack",
    cafeteria: "Main Cafeteria",
    allergens: ["Gluten"],
    tags: ["Snack", "Local Favorite", "Spicy"],
    healthScore: 55,
    rating: 4.5,
    reviewCount: 298,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 40, calories: 160, protein: 5, carbs: 18, fat: 8 },
  },
  {
    id: "f-lemontea",
    name: "Iced Lemon Tea",
    description: "Chilled lemon tea, lightly sweetened",
    image: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400",
    category: "Drink",
    cafeteria: "Main Cafeteria",
    allergens: [],
    tags: ["Drink", "Vegetarian"],
    healthScore: 75,
    rating: 4.3,
    reviewCount: 189,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 50, calories: 80, protein: 0, carbs: 20, fat: 0 },
  },
  {
    id: "f-water-main",
    name: "Mineral Water",
    description: "500ml bottled water",
    image: "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400",
    category: "Drink",
    cafeteria: "Main Cafeteria",
    allergens: [],
    tags: ["Drink"],
    healthScore: 100,
    rating: 4.8,
    reviewCount: 412,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 30, calories: 0, protein: 0, carbs: 0, fat: 0 },
  },

  // ---------- Upesi ----------
  {
    id: "f-pilau",
    name: "Pilau Rice",
    description: "Spiced pilau rice cooked with cardamom, cloves and cinnamon",
    image: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Pilau%20lovers%20here%20we%20go.jpg&width=400",
    category: "Staple",
    cafeteria: "Upesi",
    allergens: [],
    tags: ["Halal", "Local Favorite", "Spicy"],
    healthScore: 65,
    rating: 4.7,
    reviewCount: 567,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 70, calories: 320, protein: 6, carbs: 60, fat: 6 },
      full: { price: 120, calories: 540, protein: 10, carbs: 100, fat: 10 },
    },
  },
  {
    id: "f-chickenstew",
    name: "Chicken Stew",
    description: "Free-range chicken pieces simmered in a light tomato stew",
    image: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Ugali%2C%20Traditional%20Greens%20and%20Kienyeji%20Chicken%20%28Kisii%29.JPG&width=400",
    category: "Stew",
    cafeteria: "Upesi",
    allergens: [],
    tags: ["Halal", "High Protein", "Local Favorite"],
    healthScore: 78,
    rating: 4.6,
    reviewCount: 278,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 130, calories: 280, protein: 22, carbs: 6, fat: 18 },
      full: { price: 220, calories: 470, protein: 38, carbs: 10, fat: 30 },
    },
  },
  {
    id: "f-nyamachoma",
    name: "Nyama Choma",
    description: "Char-grilled beef, roasted slow over open coals",
    image: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Jay%20nyama%20Choma.jpg&width=400",
    category: "Stew",
    cafeteria: "Upesi",
    allergens: [],
    tags: ["Halal", "Local Favorite", "High Protein"],
    healthScore: 70,
    rating: 4.8,
    reviewCount: 512,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 150, calories: 320, protein: 26, carbs: 2, fat: 22 },
      full: { price: 260, calories: 540, protein: 44, carbs: 3, fat: 37 },
    },
  },
  {
    id: "f-kachumbari",
    name: "Kachumbari",
    description: "Fresh tomato, onion and coriander salad",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400",
    category: "Side",
    cafeteria: "Upesi",
    allergens: [],
    tags: ["Side", "Vegetarian", "Healthy"],
    healthScore: 92,
    rating: 4.4,
    reviewCount: 145,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 20, calories: 35, protein: 1, carbs: 7, fat: 0 },
  },
  {
    id: "f-fries",
    name: "Sweet Potato Fries",
    description: "Crispy baked sweet potato fries",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
    category: "Side",
    cafeteria: "Upesi",
    allergens: [],
    tags: ["Side", "Vegetarian"],
    healthScore: 68,
    rating: 4.5,
    reviewCount: 176,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 80, calories: 220, protein: 3, carbs: 35, fat: 9 },
  },
  {
    id: "f-mahamri",
    name: "Mahamri",
    description: "Coconut-spiced fried dough, sold as a pair",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    category: "Snack",
    cafeteria: "Upesi",
    allergens: ["Gluten"],
    tags: ["Snack", "Local Favorite"],
    healthScore: 50,
    rating: 4.5,
    reviewCount: 220,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 30, calories: 210, protein: 4, carbs: 30, fat: 8 },
  },
  {
    id: "f-passion",
    name: "Passion Juice",
    description: "Freshly blended passion fruit juice, no added sugar",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
    category: "Drink",
    cafeteria: "Upesi",
    allergens: [],
    tags: ["Drink", "Vegetarian", "Healthy"],
    healthScore: 82,
    rating: 4.6,
    reviewCount: 198,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 60, calories: 110, protein: 1, carbs: 27, fat: 0 },
  },

  // ---------- Pate Cafe ----------
  {
    id: "f-coconutrice",
    name: "Coconut Rice",
    description: "White rice simmered in fresh coconut milk, coastal style",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",
    category: "Staple",
    cafeteria: "Pate Cafe",
    allergens: [],
    tags: ["Halal", "Vegetarian", "Local Favorite"],
    healthScore: 68,
    rating: 4.6,
    reviewCount: 240,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 80, calories: 340, protein: 5, carbs: 60, fat: 8 },
      full: { price: 140, calories: 570, protein: 8, carbs: 100, fat: 14 },
    },
  },
  {
    id: "f-fishcurry",
    name: "Fish Coconut Curry",
    description: "Fresh tilapia simmered in a mild coconut curry sauce",
    image: "https://images.unsplash.com/photo-1626777553635-be05d6dc35d1?w=400",
    category: "Stew",
    cafeteria: "Pate Cafe",
    allergens: ["Fish"],
    tags: ["Halal", "High Protein", "Omega-3"],
    healthScore: 85,
    rating: 4.6,
    reviewCount: 189,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 150, calories: 300, protein: 24, carbs: 6, fat: 20 },
      full: { price: 260, calories: 510, protein: 40, carbs: 10, fat: 33 },
    },
  },
  {
    id: "f-managu",
    name: "Managu",
    description: "African nightshade greens, simmered with a touch of milk",
    image: "https://images.unsplash.com/photo-1466629008779-e3ee2020cd06?w=400",
    category: "Vegetable",
    cafeteria: "Pate Cafe",
    allergens: [],
    tags: ["Vegetarian", "Healthy", "Local Favorite"],
    healthScore: 93,
    rating: 4.3,
    reviewCount: 112,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 40, calories: 55, protein: 3, carbs: 6, fat: 2 },
      full: { price: 70, calories: 95, protein: 5, carbs: 10, fat: 3 },
    },
  },
  {
    id: "f-fruitcup",
    name: "Fresh Fruit Cup",
    description: "Seasonal fruit medley — watermelon, pineapple and pawpaw",
    image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400",
    category: "Snack",
    cafeteria: "Pate Cafe",
    allergens: [],
    tags: ["Snack", "Vegetarian", "Healthy"],
    healthScore: 96,
    rating: 4.7,
    reviewCount: 210,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 80, calories: 95, protein: 1, carbs: 23, fat: 0 },
  },
  {
    id: "f-smoothie",
    name: "Mango Smoothie",
    description: "Blended mango, yoghurt and a hint of honey",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
    category: "Drink",
    cafeteria: "Pate Cafe",
    allergens: ["Dairy"],
    tags: ["Drink", "Vegetarian", "Healthy"],
    healthScore: 78,
    rating: 4.5,
    reviewCount: 203,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 100, calories: 240, protein: 6, carbs: 42, fat: 5 },
  },
  {
    id: "f-viazikarai",
    name: "Viazi Karai",
    description: "Spiced potatoes deep-fried in a turmeric batter",
    image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400",
    category: "Side",
    cafeteria: "Pate Cafe",
    allergens: [],
    tags: ["Side", "Vegetarian", "Spicy"],
    healthScore: 58,
    rating: 4.4,
    reviewCount: 132,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 50, calories: 210, protein: 3, carbs: 32, fat: 8 },
  },

  // ---------- Springs of Olives ----------
  {
    id: "f-mukimo",
    name: "Mukimo",
    description: "Mashed potatoes, maize, beans and pumpkin leaves",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
    category: "Staple",
    cafeteria: "Springs of Olives",
    allergens: [],
    tags: ["Vegetarian", "Halal", "Local Favorite"],
    healthScore: 80,
    rating: 4.5,
    reviewCount: 187,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 70, calories: 300, protein: 7, carbs: 58, fat: 4 },
      full: { price: 120, calories: 500, protein: 12, carbs: 96, fat: 7 },
    },
  },
  {
    id: "f-tilapia",
    name: "Grilled Tilapia",
    description: "Whole grilled tilapia, lightly seasoned with lemon and spice",
    image: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/African%20Dish%20Ugali%20with%20Tilapia.jpg&width=400",
    category: "Stew",
    cafeteria: "Springs of Olives",
    allergens: ["Fish"],
    tags: ["Local Favorite", "High Protein", "Omega-3"],
    healthScore: 85,
    rating: 4.7,
    reviewCount: 421,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 180, calories: 320, protein: 30, carbs: 2, fat: 20 },
      full: { price: 300, calories: 540, protein: 50, carbs: 3, fat: 34 },
    },
  },
  {
    id: "f-sukuma-springs",
    name: "Sukuma Wiki",
    description: "Sautéed collard greens with onion and tomato",
    image: "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400",
    category: "Vegetable",
    cafeteria: "Springs of Olives",
    allergens: [],
    tags: ["Vegetarian", "Healthy", "Budget"],
    healthScore: 95,
    rating: 4.3,
    reviewCount: 158,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 30, calories: 45, protein: 2, carbs: 5, fat: 2 },
      full: { price: 50, calories: 80, protein: 4, carbs: 9, fat: 3 },
    },
  },
  {
    id: "f-githeri",
    name: "Githeri",
    description: "Boiled maize and beans, the ultimate campus comfort staple",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    category: "Staple",
    cafeteria: "Springs of Olives",
    allergens: [],
    tags: ["Vegetarian", "Halal", "Budget", "High Protein"],
    healthScore: 84,
    rating: 4.4,
    reviewCount: 267,
    isAvailable: true,
    hasPortions: true,
    portions: {
      half: { price: 50, calories: 220, protein: 9, carbs: 40, fat: 3 },
      full: { price: 90, calories: 380, protein: 16, carbs: 68, fat: 5 },
    },
  },
  {
    id: "f-avocado",
    name: "Avocado Slices",
    description: "Fresh sliced avocado, a light and creamy side",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400",
    category: "Side",
    cafeteria: "Springs of Olives",
    allergens: [],
    tags: ["Side", "Vegetarian", "Healthy"],
    healthScore: 90,
    rating: 4.5,
    reviewCount: 98,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 30, calories: 160, protein: 2, carbs: 8, fat: 15 },
  },
  {
    id: "f-water-springs",
    name: "Mineral Water",
    description: "500ml bottled water",
    image: "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400",
    category: "Drink",
    cafeteria: "Springs of Olives",
    allergens: [],
    tags: ["Drink"],
    healthScore: 100,
    rating: 4.8,
    reviewCount: 340,
    isAvailable: true,
    hasPortions: false,
    fixedPrice: { price: 30, calories: 0, protein: 0, carbs: 0, fat: 0 },
  },
];

export function getFoodsByCafeteria(cafeteriaName: string): FoodItem[] {
  return foods.filter((f) => f.cafeteria === cafeteriaName);
}

// A realistic campus "plate" pairs a Staple with a Stew (protein). This is used both
// for home-screen recommendations and the "goes well with" suggestion when a student
// adds a food item to their plate.
export interface PairingSuggestion {
  staple: FoodItem;
  staplePortion: Portion;
  stew: FoodItem;
  stewPortion: Portion;
  label: string;
  totalPrice: number;
}

/**
 * `scoreMap` optionally supplies a per-food score (e.g. the AI recommendation
 * model's match probability, keyed by food id) to rank pairings by instead of
 * the static healthScore fallback. This is how the home screen's "Recommended
 * for You" section gets guided by the trained recommendation model.
 */
export function getPairingSuggestions(
  cafeteriaName: string,
  limit = 3,
  scoreMap?: Record<string, number>
): PairingSuggestion[] {
  const items = getFoodsByCafeteria(cafeteriaName);
  const staples = items.filter((f) => f.category === "Staple");
  const stews = items.filter((f) => f.category === "Stew");
  const scoreOf = (f: FoodItem) => scoreMap?.[f.id] ?? f.healthScore / 100;

  const pairs: PairingSuggestion[] = [];
  for (const staple of staples) {
    for (const stew of stews) {
      const staplePortion: Portion = "full";
      const stewPortion: Portion = "half";
      const stapleInfo = staple.portions![staplePortion];
      const stewInfo = stew.portions![stewPortion];
      pairs.push({
        staple,
        staplePortion,
        stew,
        stewPortion,
        label: `${formatPortionLabel(staple, staplePortion)} + ${formatPortionLabel(stew, stewPortion)}`,
        totalPrice: stapleInfo.price + stewInfo.price,
      });
    }
  }
  return pairs
    .sort((a, b) => (scoreOf(b.stew) + scoreOf(b.staple)) - (scoreOf(a.stew) + scoreOf(a.staple)))
    .slice(0, limit);
}

// Given one chosen item, suggest the single best complementary item (used inside the
// "Add to plate" sheet) — a Staple gets paired with a Stew and vice-versa, never just
// a drink.
export function getComplementaryItem(food: FoodItem): { item: FoodItem; portion: Portion } | null {
  const siblings = getFoodsByCafeteria(food.cafeteria);
  if (food.category === "Staple") {
    const stew = siblings.filter((f) => f.category === "Stew").sort((a, b) => b.healthScore - a.healthScore)[0];
    return stew ? { item: stew, portion: "half" } : null;
  }
  if (food.category === "Stew") {
    const staple = siblings.filter((f) => f.category === "Staple").sort((a, b) => b.healthScore - a.healthScore)[0];
    return staple ? { item: staple, portion: "full" } : null;
  }
  if (food.category === "Vegetable") {
    const staple = siblings.filter((f) => f.category === "Staple")[0];
    return staple ? { item: staple, portion: "half" } : null;
  }
  return null;
}

export const culturalSpecials: CulturalSpecial[] = [
  {
    id: "cs-mon",
    day: "Monday",
    cuisine: "Coastal Kenya Day",
    description: "Swahili coastal flavours — coconut, spice, and fresh seafood.",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80",
    items: ["Coconut Rice", "Fish Coconut Curry", "Mahamri"],
  },
  {
    id: "cs-tue",
    day: "Tuesday",
    cuisine: "Congo Cuisine Day",
    description: "Central African classics, rich and comforting.",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80",
    items: ["Moambe Chicken", "Fufu", "Pondu (Cassava Leaves)"],
  },
  {
    id: "cs-wed",
    day: "Wednesday",
    cuisine: "Ethiopian Day",
    description: "Injera, berbere spice, and slow-simmered stews.",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
    items: ["Doro Wat", "Injera", "Shiro"],
  },
  {
    id: "cs-thu",
    day: "Thursday",
    cuisine: "West African Day",
    description: "Bold, smoky flavours from Nigeria and Ghana.",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80",
    items: ["Jollof Rice", "Suya Skewers", "Puff Puff"],
  },
  {
    id: "cs-fri",
    day: "Friday",
    cuisine: "Nyama Choma Friday",
    description: "A Kenyan campus classic to close out the week.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    items: ["Nyama Choma", "Ugali", "Kachumbari"],
  },
];
