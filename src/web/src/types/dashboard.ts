export interface DashboardData {
  healthSnapshot: HealthSnapshot;
  todayProgress: TodayProgress;
  todayMeals: TodayMeal[];
  quickActions: QuickAction[];
  trends: TrendsData;
  lastUpdated: Date;
}

export interface HealthSnapshot {
  bmi: number;
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
  goal: 'lose' | 'maintain' | 'gain';
  targetWeight?: number;
  currentWeight: number;
  weightChange: number; // kg change from last week
  streak: number; // days of logging
}

export interface TodayProgress {
  calories: {
    consumed: number;
    target: number;
    remaining: number;
    percentage: number;
  };
  macros: {
    protein: MacroProgress;
    carbohydrates: MacroProgress;
    fat: MacroProgress;
    fiber: MacroProgress;
  };
  water: {
    consumed: number; // ml
    target: number; // ml
    percentage: number;
  };
  exercise: {
    minutes: number;
    caloriesBurned: number;
  };
}

export interface MacroProgress {
  consumed: number; // grams
  target: number; // grams
  percentage: number;
}

export interface TodayMeal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  time: Date;
  imageUrl?: string;
  source: 'manual' | 'scan' | 'meal_plan';
  isLogged: boolean;
}

export interface QuickAction {
  id: string;
  type: 'scan' | 'edit_profile';
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

export interface TrendsData {
  period: 'week' | 'month';
  calories: TrendPoint[];
  weight: TrendPoint[];
  macros: {
    protein: TrendPoint[];
    carbohydrates: TrendPoint[];
    fat: TrendPoint[];
  };
  water: TrendPoint[];
  exercise: TrendPoint[];
}

export interface TrendPoint {
  date: Date;
  value: number;
  target?: number;
}

export interface ScanResult {
  foodName: string;
  confidence: number;
  nutrition: {
    calories: number;
    macros: {
      protein: number;
      carbohydrates: number;
      fat: number;
      fiber: number;
    };
    servingSize: string;
    servingUnit: string;
  };
  imageUrl: string;
  timestamp: Date;
}

export interface WaterLog {
  id: string;
  amount: number; // ml
  timestamp: Date;
  type: 'water' | 'coffee' | 'tea' | 'juice' | 'other';
}

export interface WeightLog {
  id: string;
  weight: number; // kg
  timestamp: Date;
  notes?: string;
  bodyFat?: number; // percentage
  muscleMass?: number; // kg
}

export interface ExerciseLog {
  id: string;
  type: string;
  duration: number; // minutes
  caloriesBurned: number;
  timestamp: Date;
  intensity: 'low' | 'moderate' | 'high';
  notes?: string;
}

export interface DashboardSettings {
  showWaterTracking: boolean;
  showExerciseTracking: boolean;
  showWeightTracking: boolean;
  defaultMealTypes: string[];
  calorieGoal: number;
  waterGoal: number; // ml
  macroGoals: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

export interface DashboardStats {
  totalDaysLogged: number;
  averageCalories: number;
  averageWater: number;
  weightChange: number;
  goalProgress: number; // percentage
  streak: number;
  lastActivity: Date;
}
