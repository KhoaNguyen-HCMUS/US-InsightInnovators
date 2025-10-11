import { requestAuth } from '../utils/api';

export interface MealPlanPreferences {
  focus: 'weight_loss' | 'muscle_gain' | 'maintenance';
  exclude_ingredients?: string[];
  preferred_cuisines?: string[];
  cooking_time?: 'quick' | 'moderate' | 'elaborate';
  meal_frequency?: number;
}

export interface MealPlanRequestBody {
  duration: 'weekly' | 'monthly';
  title?: string;
  preferences: MealPlanPreferences;
}

export interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  cooking_time: string;
  cooking_instructions: string;
  cuisine: string;
}

export interface DayPlanData {
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
  [key: string]: MealData; // For additional meals like snacks
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface GroceryItemDetail {
  quantity: number;
  unit: string;
  category: string;
}

export interface GroceryList {
  vegetables: Array<[string, GroceryItemDetail]>;
  proteins: Array<[string, GroceryItemDetail]>;
  grains: Array<[string, GroceryItemDetail]>;
  other: Array<[string, GroceryItemDetail]>;
  generated_at: string;
}

export interface PlanNutritionSummary {
  daily_targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  plan_overview?: {
    total_days?: number;
    meals_per_day?: number;
    total_meals?: number;
  };
}

export interface MealPlanDetail {
  id: string;
  title: string;
  duration: 'weekly' | 'monthly';
  created_at: object; // The API returns an object for created_at, might need to adjust based on actual data
  plan_data: {
    [key: string]: DayPlanData;
  };
  nutrition_targets: NutritionTargets;
  grocery_list: GroceryList;
}

export interface MealPlanResponseData {
  meal_plan: MealPlanDetail;
  nutrition_summary?: PlanNutritionSummary;
  performance?: {
    total_time_ms: number;
    ai_generation_ms: number;
  };
}

export interface MealPlanResponse {
  success: boolean;
  message: string;
  data: MealPlanResponseData;
}

export const generateMealPlan = async (mealPlanRequest: MealPlanRequestBody): Promise<MealPlanResponse> => {
  try {
    const response = await requestAuth<MealPlanResponse, MealPlanRequestBody>(
      'POST',
      '/api/meal-plans',
      mealPlanRequest
    );
    return response;
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw error;
  }
};

export const fetchMealPlanDetails = async (mealPlanId: string): Promise<MealPlanResponse> => {
  try {
    const response = await requestAuth<MealPlanResponse>('GET', `/api/meal-plans/${mealPlanId}`);
    return response;
  } catch (error) {
    console.error('Error fetching meal plan details:', error);
    throw error;
  }
};

interface GroceryListResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    meal_plan_id: string;
    items: Array<{
      name: string;
      amount: number;
      unit: string;
      category: string;
    }>;
  };
}

export const fetchMealPlanGroceryList = async (mealPlanId: string): Promise<GroceryListResponse> => {
  try {
    const response = await requestAuth<GroceryListResponse>('GET', `/api/meal-plans/${mealPlanId}/grocery-list`);

    return response;
  } catch (error) {
    console.error('Error fetching grocery list:', error);
    throw error;
  }
};
