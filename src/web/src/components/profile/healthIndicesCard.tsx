import type { HealthIndices } from '../../types/health';
import { getBMICategoryDescription, getActivityLevelDescription } from '../../utils/healthCalculations';
import { FaHeartbeat, FaWeight, FaFire, FaUtensils } from 'react-icons/fa';

import type { ActivityLevel } from '../../types/health';

interface HealthIndicesCardProps {
  indices: HealthIndices | null;
  activityLevel: ActivityLevel;
  goal: 'lose' | 'maintain' | 'gain';
  consentGranted: boolean;
}

export default function HealthIndicesCard({ 
  indices, 
  activityLevel, 
  goal, 
  consentGranted 
}: HealthIndicesCardProps) {
  console.log('Rendering HealthIndicesCard with indices:', indices, 'consentGranted:', consentGranted);
  if (!consentGranted) {
    return (
      <div className="bg-bg-card rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-text-header mb-4">
          Health Indices
        </h2>
        <div className="text-center py-8">
          <div className="text-text-muted mb-2">
            <FaHeartbeat className="mx-auto text-4xl" />
          </div>
          <p className="text-text-body">
            Grant consent to view your health indices
          </p>
        </div>
      </div>
    );
  }
  if (!indices) {
    return (
      <div className="bg-bg-card rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-text-header mb-4">
          Health Indices
        </h2>
        <div className="text-center py-8">
          <div className="text-text-muted mb-2">
            <FaHeartbeat className="mx-auto text-4xl" />
          </div>
          <p className="text-text-body">
            Complete your profile to see health indices
          </p>
        </div>
      </div>
    );
  }

  const getBMIColor = (category: string) => {
    switch (category) {
      case 'underweight':
        return 'text-info bg-info-bg';
      case 'normal':
        return 'text-success bg-success-bg';
      case 'overweight':
        return 'text-warning bg-warning-bg';
      case 'obese':
        return 'text-error bg-error-bg';
      default:
        return 'text-text-body bg-bg-muted';
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case 'lose':
        return 'text-error bg-error-bg';
      case 'maintain':
        return 'text-success bg-success-bg';
      case 'gain':
        return 'text-info bg-info-bg';
      default:
        return 'text-text-body bg-bg-muted';
    }
  };

  return (
    <div className="bg-bg-card rounded-lg shadow-md p-6 mb-6 border-l-4 border-accent">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-accent rounded-lg mr-3">
          <FaHeartbeat className="text-primary-contrast text-xl" />
        </div>
        <h2 className="text-xl font-semibold text-text-header">
          Health Indices
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* BMI Card */}
        <div className="bg-bg rounded-lg p-4 border border-border-light hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-primary rounded-lg shadow-md">
              <FaWeight className="text-primary-contrast text-lg" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBMIColor(indices.bmi.category)}`}>
              {indices.bmi.category.charAt(0).toUpperCase() + indices.bmi.category.slice(1)}
            </span>
          </div>
          <h3 className="text-3xl font-bold text-text-header mb-1">
            {indices.bmi.value}
          </h3>
          <p className="text-sm font-medium text-text-body mb-2">BMI</p>
          <p className="text-xs text-text-muted leading-relaxed">
            {getBMICategoryDescription(indices.bmi.category)}
          </p>
        </div>

        {/* BMR Card */}
        <div className="bg-bg rounded-lg p-4 border border-border-light hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-success rounded-lg shadow-md">
              <FaHeartbeat className="text-success-foreground text-lg" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-text-header mb-1">
            {indices.bmr.toLocaleString()}
          </h3>
          <p className="text-sm font-medium text-text-body mb-2">BMR (kcal/day)</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Basal Metabolic Rate
          </p>
        </div>

        {/* TDEE Card */}
        <div className="bg-bg rounded-lg p-4 border border-border-light hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-warning rounded-lg shadow-md">
              <FaFire className="text-warning-foreground text-lg" />
            </div>
            <span className="text-xs text-text-body bg-bg-muted px-2 py-1 rounded-full">
              {activityLevel.charAt(0).toUpperCase() + activityLevel.slice(1)}
            </span>
          </div>
          <h3 className="text-3xl font-bold text-text-header mb-1">
            {indices.tdee.toLocaleString()}
          </h3>
          <p className="text-sm font-medium text-text-body mb-2">TDEE (kcal/day)</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Total Daily Energy Expenditure
          </p>
        </div>

        {/* Recommended Calories Card */}
        <div className="bg-bg rounded-lg p-4 border border-border-light hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-secondary rounded-lg shadow-md">
              <FaUtensils className="text-secondary-contrast text-lg" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGoalColor(goal)}`}>
              {goal.charAt(0).toUpperCase() + goal.slice(1)}
            </span>
          </div>
          <h3 className="text-3xl font-bold text-text-header mb-1">
            {indices.recommendedCalories.toLocaleString()}
          </h3>
          <p className="text-sm font-medium text-text-body mb-2">Recommended (kcal/day)</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Based on your goal
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-bg-muted rounded-lg p-6 border border-border-light">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-primary rounded-lg mr-3">
            <FaHeartbeat className="text-primary-contrast text-lg" />
          </div>
          <h4 className="font-semibold text-text-header">Health Summary</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-body">
          <div className="space-y-2">
            <p className="flex items-start">
              <span className="font-semibold text-text-header mr-2">BMI:</span>
              <span>{indices.bmi.value} ({indices.bmi.category}) - {getBMICategoryDescription(indices.bmi.category)}</span>
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-text-header mr-2">BMR:</span>
              <span>{indices.bmr.toLocaleString()} kcal/day - Calories needed at rest</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="flex items-start">
              <span className="font-semibold text-text-header mr-2">TDEE:</span>
              <span>{indices.tdee.toLocaleString()} kcal/day - Total daily energy needs ({getActivityLevelDescription(activityLevel)})</span>
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-text-header mr-2">Goal:</span>
              <span>{goal.charAt(0).toUpperCase() + goal.slice(1)} weight → Recommended {indices.recommendedCalories.toLocaleString()} kcal/day</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
