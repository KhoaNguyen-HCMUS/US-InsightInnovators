export interface HealthProfile {
  id?: string;
  userId: string;
  personalInfo: PersonalInfo;
  goals: HealthGoals;
  activityLevel: ActivityLevel;
  medicalInfo: MedicalInfo;
  units: MeasurementUnits;
  consent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
}

export interface PersonalInfo {
  age: number;
  gender: 'male' | 'female';
  height: number; 
  weight: number; 
  location: string; 
}

export interface HealthGoals {
  primary: 'lose' | 'maintain' | 'gain';
  targetWeight?: number; 
  targetDate?: Date;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface MedicalInfo {
  conditions: string; 
  allergies: string; 
  medications: string;
  preferences?: string; 
}

export interface MeasurementUnits {
  weight: string; 
  height: string; 
  temperature: string; 
}

export interface HealthIndices {
  bmi: {
    value: number;
    category: 'underweight' | 'normal' | 'overweight' | 'obese';
  };
  bmr: number; 
  tdee: number; 
  recommendedCalories: number; 
}

export interface ActivityFactor {
  sedentary: 1.2;
  light: 1.375;
  moderate: 1.55;
  active: 1.725;
  very_active: 1.9;
}

export const ACTIVITY_FACTORS: ActivityFactor = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export interface ProfileAuditLog {
  id: string;
  profileId: string;
  action: 'created' | 'updated' | 'deleted';
  changes: Record<string, any>;
  timestamp: Date;
  userId: string;
}
