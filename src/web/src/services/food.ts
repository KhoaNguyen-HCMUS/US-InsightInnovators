import { requestAuth } from '../utils/api';

export interface FoodPredictionResponse {
  success: boolean;
  predictions: Record<string, number>;
  top_prediction: string;
  nutrition: NutritionItem[];
  user?: {
    isAuthenticated: boolean;
    message: string;
  };
}

export interface NutritionItem {
  fdcId: number;
  description: string;
  category: string;
  portions?: FoodPortion[];
  nutrients?: Nutrient[];
}

export interface FoodPortion {
  id: number;
  description: string;
  gramWeight: number;
  nutrition?: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Nutrient {
  name: string;
  unit: string;
  value: number;
}

export interface SelectedFood {
  fdcId: number;
  description: string;
  category?: string;
  nutrients: Nutrient[];
}

export interface FoodDetailRequest {
  fdcId: number;
}

export interface NutritionDetailsResponse {
  success: boolean;
  data: {
    fdcId: number;
    name: string;
    category: string;
    portions: FoodPortion[];
  };
}

export interface FoodLogRequest {
  fdcId: number;
  portionId: number;
  confirmConsumption: boolean;
}

export interface FoodLogResponse {
  success: boolean;
  message: string;
  data: {
    food: {
      id: string;
      name: string;
      fdcId: number;
      kcal_100g: number;
      protein_100g: number;
      carbs_100g: number;
      fat_100g: number;
    };
    log: {
      id: string;
      portionGrams: number;
      portionDescription: string;
      loggedAt: string;
    };
    nutrition: {
      kcal: number;
      protein: number;
      carbs: number;
      fat: number;
      portion_grams: number;
      portion_description: string;
    };
  };
}

export const predictFood = async (imageFile: File, keywords?: string): Promise<FoodPredictionResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    let url = '/api/food/predict';
    if (keywords) {
      url += `?keywords=${encodeURIComponent(keywords)}`;
    }
    
    // Using fetch directly since we need to handle FormData
    const API_BASE = (import.meta).env?.VITE_API_URL || "";
    const token = localStorage.getItem('authToken');
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    const data = await response.json();
    return data as FoodPredictionResponse;
  } catch (error) {
    console.error('Error predicting food:', error);
    throw error;
  }
};

export const getFoodDetails = async (request: FoodDetailRequest): Promise<NutritionDetailsResponse> => {
  try {
    const response = await requestAuth<NutritionDetailsResponse, FoodDetailRequest>(
      'POST',
      '/api/food/detail',
      request
    );
    return response;
  } catch (error) {
    console.error('Error getting food details:', error);
    throw error;
  }
};

export const logFoodConsumption = async (request: FoodLogRequest): Promise<FoodLogResponse> => {
  try {
    const response = await requestAuth<FoodLogResponse, FoodLogRequest>(
      'POST',
      '/api/food/log',
      request
    );
    return response;
  } catch (error) {
    console.error('Error logging food consumption:', error);
    throw error;
  }
};