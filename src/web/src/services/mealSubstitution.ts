import { requestAuth } from "../utils/api";

export interface DishToReplace {
  name: string;
  calories: number;
}

export interface SubstitutionPreferences {
  cuisine?: string;
  max_cook_time?: number;
  dietary_requirements?: string[];
}

export interface MealSubstitutionRequest {
  meal_plan_id: string;
  day_index: number;
  meal_slot: string;
  dish_to_replace: DishToReplace;
  preferences: SubstitutionPreferences;
  reason: string;
}

export interface SubstituteDish {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  cooking_time: string;
  ingredients: string[];
  cooking_instructions: string;
  why_substitute: string;
}

export interface NutritionComparison {
  original: {
    name: string;
    calories: number;
  };
  substitute: {
    name: string;
    calories: number;
  };
  calorie_difference: number;
}

export interface MealSubstitutionData {
  substitution: {
    timestamp: string;
    day_index: number;
    meal_slot: string;
    original_dish: DishToReplace;
    substitute_dish: SubstituteDish;
    reason: string;
  };
  nutrition_comparison: NutritionComparison;
  updated?: {
    day_index: number;
    meal_slot: string;
    day_totals: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    scale_applied?: number;
    grocery_list?: any;
    grocery_list_items?: Array<{
      name: string;
      amount: number;
      unit: string;
      category: string;
    }>;
  };
}

export interface MealSubstitutionResponse {
  success: boolean;
  message: string;
  data: MealSubstitutionData;
}

export const substituteMeal = async (
  mealPlanId: string,
  request: MealSubstitutionRequest
): Promise<MealSubstitutionResponse> => {
  try {
    const response = await requestAuth<
      MealSubstitutionResponse,
      MealSubstitutionRequest
    >("POST", `/api/meal-plans/${mealPlanId}/substitute`, request);

    return response;
  } catch (error) {
    console.error("Error substituting meal:", error);
    throw error;
  }
};
