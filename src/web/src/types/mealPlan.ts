import type { HealthProfile } from "./health";

export interface MealPlan {
  id: string;
  userId: string;
  duration: "weekly" | "monthly";
  startDate: Date;
  endDate: Date;
  totalCalories: number;
  dailyPlans: DailyMealPlan[];
  groceryList: GroceryItem[];
  preferences: UserPreferences;
  constraints: NutritionConstraints;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyMealPlan {
  date: Date;
  dayOfWeek: string;
  meals: Meal[];
  totalCalories: number;
  macros: MacroNutrients;
  micros: MicroNutrients;
}

export interface Meal {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  macros: MacroNutrients;
  ingredients: Ingredient[];
  instructions: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  cuisine: string;
  tags: string[];
  substitutions?: string[];
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category:
    | "protein"
    | "carbohydrate"
    | "vegetable"
    | "fruit"
    | "dairy"
    | "fat"
    | "spice"
    | "other";
  calories: number;
  macros: MacroNutrients;
  allergens: string[];
}

export interface MacroNutrients {
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar: number; // grams
}

export interface MicroNutrients {
  sodium: number; // mg
  potassium: number; // mg
  calcium: number; // mg
  iron: number; // mg
  vitaminA: number; // IU
  vitaminC: number; // mg
  vitaminD: number; // IU
  vitaminE: number; // mg
  vitaminK: number; // mcg
  thiamine: number; // mg
  riboflavin: number; // mg
  niacin: number; // mg
  folate: number; // mcg
  vitaminB12: number; // mcg
  magnesium: number; // mg
  zinc: number; // mg
}

export interface GroceryItem {
  name: string;
  category: string;
  amount: number;
  unit: string;
  estimatedCost: number;
  isChecked: boolean;
  notes?: string;
}

export interface UserPreferences {
  likedFoods: string[];
  dislikedFoods: string[];
  favoriteCuisines: string[];
  dietaryRestrictions: string[];
  cookingSkill: "beginner" | "intermediate" | "advanced";
  availableTime: number; // minutes per day
  budget: "low" | "medium" | "high";
}

export interface NutritionConstraints {
  maxCalories: number;
  minCalories: number;
  maxProtein: number;
  minProtein: number;
  maxCarbs: number;
  minCarbs: number;
  maxFat: number;
  minFat: number;
  maxSodium: number;
  maxSugar: number;
  allergies: string[];
  conditions: string[];
  restrictions: string[];
}

export interface MealPlanGenerationRequest {
  duration: "weekly" | "monthly";
  preferences: UserPreferences;
  constraints: NutritionConstraints;
  healthProfile: HealthProfile;
}

export interface MealPlanGenerationResponse {
  success: boolean;
  mealPlan?: MealPlan;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
}

export interface SubstitutionRequest {
  originalIngredient: string;
  reason: "allergy" | "preference" | "availability" | "cost";
  mealId: string;
  mealType: string;
}

export interface SubstitutionSuggestion {
  original: string;
  alternatives: {
    name: string;
    amount: number;
    unit: string;
    nutritionalDifference: MacroNutrients;
    reason: string;
    absolute?: {
      calories: number;
      macros: Pick<MacroNutrients, "protein" | "carbohydrates" | "fat">;
    };
  }[];
  backendUpdated?: {
    dayIndex: number;
    mealSlot: string;
    dayTotals: {
      calories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
    };
    scaleApplied?: number;
    groceryListItems?: Array<{
      name: string;
      amount: number;
      unit: string;
      category: string;
    }>;
  };
}

export interface MealPlanAuditLog {
  id: string;
  mealPlanId: string;
  action: "generated" | "modified" | "substituted" | "saved" | "deleted";
  changes: Record<string, string | number | boolean | object>;
  timestamp: Date;
  userId: string;
  source: "llm" | "manual" | "system";
}
