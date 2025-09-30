import type { HealthProfile, HealthIndices, ActivityLevel } from '../types/health';
import { ACTIVITY_FACTORS } from '../types/health';

/**
 * Calculate BMI (Body Mass Index)
 * BMI = weight (kg) / height² (m²)
 */
export function calculateBMI(weight: number, height: number): { value: number; category: 'underweight' | 'normal' | 'overweight' | 'obese' } {
  const heightInMeters = height / 100; // Convert cm to meters
  const bmi = weight / (heightInMeters * heightInMeters);
  
  let category: 'underweight' | 'normal' | 'overweight' | 'obese';
  if (bmi < 18.5) {
    category = 'underweight';
  } else if (bmi < 25) {
    category = 'normal';
  } else if (bmi < 30) {
    category = 'overweight';
  } else {
    category = 'obese';
  }
  
  return { value: Math.round(bmi * 10) / 10, category };
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * Male: BMR = 10W + 6.25H – 5A + 5
 * Female: BMR = 10W + 6.25H – 5A – 161
 */
export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  const genderAdjustment = gender === 'male' ? 5 : -161;
  return Math.round(baseBMR + genderAdjustment);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × Activity Factor
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTORS[activityLevel]);
}

/**
 * Calculate recommended daily calories based on goal
 */
export function calculateRecommendedCalories(tdee: number, goal: 'lose' | 'maintain' | 'gain'): number {
  switch (goal) {
    case 'lose':
      return Math.round(tdee * 0.8); // 20% deficit
    case 'gain':
      return Math.round(tdee * 1.2); // 20% surplus
    case 'maintain':
    default:
      return tdee;
  }
}

/**
 * Calculate all health indices for a profile
 */
export function calculateHealthIndices(profile: HealthProfile): HealthIndices {
  const { personalInfo, goals, activityLevel } = profile;
  const { weight, height, age, gender } = personalInfo;
  
  const bmi = calculateBMI(weight, height);
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const recommendedCalories = calculateRecommendedCalories(tdee, goals.primary);
  
  return {
    bmi,
    bmr,
    tdee,
    recommendedCalories,
  };
}

/**
 * Convert weight between kg and lb
 */
export function convertWeight(value: number, from: 'kg' | 'lb', to: 'kg' | 'lb'): number {
  if (from === to) return value;
  
  if (from === 'kg' && to === 'lb') {
    return Math.round(value * 2.20462 * 10) / 10;
  } else if (from === 'lb' && to === 'kg') {
    return Math.round(value / 2.20462 * 10) / 10;
  }
  
  return value;
}

/**
 * Convert height between cm and inches
 */
export function convertHeight(value: number, from: 'cm' | 'in', to: 'cm' | 'in'): number {
  if (from === to) return value;
  
  if (from === 'cm' && to === 'in') {
    return Math.round(value / 2.54 * 10) / 10;
  } else if (from === 'in' && to === 'cm') {
    return Math.round(value * 2.54 * 10) / 10;
  }
  
  return value;
}

/**
 * Validate health profile data
 */
export function validateHealthProfile(profile: Partial<HealthProfile>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!profile.personalInfo) {
    errors.push('Personal information is required');
    return { isValid: false, errors };
  }
  
  const { age, height, weight } = profile.personalInfo;
  
  if (age < 1 || age > 120) {
    errors.push('Age must be between 1 and 120 years');
  }
  
  if (height < 50 || height > 250) {
    errors.push('Height must be between 50 and 250 cm');
  }
  
  if (weight < 10 || weight > 300) {
    errors.push('Weight must be between 10 and 300 kg');
  }
  
  if (!profile.goals?.primary) {
    errors.push('Health goal is required');
  }
  
  if (!profile.activityLevel) {
    errors.push('Activity level is required');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Get BMI category description
 */
export function getBMICategoryDescription(category: 'underweight' | 'normal' | 'overweight' | 'obese'): string {
  const descriptions = {
    underweight: 'Underweight - Consider consulting a healthcare provider',
    normal: 'Normal weight - Good health range',
    overweight: 'Overweight - Consider lifestyle changes',
    obese: 'Obese - Strongly recommend consulting a healthcare provider'
  };
  
  return descriptions[category];
}

/**
 * Get activity level description
 */
export function getActivityLevelDescription(level: ActivityLevel): string {
  const descriptions = {
    sedentary: 'Little to no exercise, desk job',
    light: 'Light exercise 1-3 days/week',
    moderate: 'Moderate exercise 3-5 days/week',
    active: 'Heavy exercise 6-7 days/week',
    very_active: 'Very heavy exercise, physical job'
  };
  
  return descriptions[level];
}
