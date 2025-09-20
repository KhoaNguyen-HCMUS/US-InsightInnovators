import { useState } from 'react';
import type { SubstitutionSuggestion } from '../../types/mealPlan';
import { FaExchangeAlt, FaCheck, FaTimes, FaInfoCircle, FaUtensils, FaDrumstickBite, FaLeaf } from 'react-icons/fa';

interface MealSubstitutionProps {
  mealId: string;
  mealType: string;
  originalMeal: string;
  onSubstitute: (substitution: SubstitutionSuggestion) => void;
  onClose: () => void;
}

export default function MealSubstitution({  mealType, originalMeal, onSubstitute, onClose }: MealSubstitutionProps) {
  const [selectedReason, setSelectedReason] = useState<'allergy' | 'preference' | 'availability' | 'cost'>('preference');
  const [selectedAlternative, setSelectedAlternative] = useState<string>('');

  // Mock substitution suggestions
  const mockSubstitutions: SubstitutionSuggestion = {
    original: originalMeal,
    alternatives: [
      {
        name: 'Grilled Salmon with Quinoa',
        amount: 1,
        unit: 'serving',
        nutritionalDifference: {
          protein: 5,
          carbohydrates: -10,
          fat: 3,
          fiber: 2,
          sugar: -2
        },
        reason: 'Higher protein, lower carbs, rich in omega-3'
      },
      {
        name: 'Baked Cod with Sweet Potato',
        amount: 1,
        unit: 'serving',
        nutritionalDifference: {
          protein: 2,
          carbohydrates: 5,
          fat: -2,
          fiber: 3,
          sugar: 1
        },
        reason: 'Lower fat, higher fiber, good for heart health'
      },
      {
        name: 'Turkey Meatballs with Zoodles',
        amount: 1,
        unit: 'serving',
        nutritionalDifference: {
          protein: 3,
          carbohydrates: -15,
          fat: -1,
          fiber: 4,
          sugar: -3
        },
        reason: 'Low carb, high protein, gluten-free option'
      },
      {
        name: 'Mediterranean Chickpea Bowl',
        amount: 1,
        unit: 'serving',
        nutritionalDifference: {
          protein: -2,
          carbohydrates: 8,
          fat: 4,
          fiber: 6,
          sugar: 2
        },
        reason: 'Plant-based, high fiber, rich in antioxidants'
      }
    ]
  };

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return <FaUtensils className="text-orange-500" />;
      case 'lunch': return <FaUtensils className="text-blue-500" />;
      case 'dinner': return <FaDrumstickBite className="text-purple-500" />;
      case 'snack': return <FaLeaf className="text-green-500" />;
      default: return <FaUtensils className="text-text-body" />;
    }
  };

  const getNutritionChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-text-body';
  };

  const getNutritionChangeIcon = (value: number) => {
    if (value > 0) return '↗';
    if (value < 0) return '↘';
    return '→';
  };

  const handleSubstitute = () => {
    if (selectedAlternative) {
      const alternative = mockSubstitutions.alternatives.find(alt => alt.name === selectedAlternative);
      if (alternative) {
        onSubstitute({
          original: mockSubstitutions.original,
          alternatives: [alternative]
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <div className="flex items-center">
            <div className="p-2 bg-primary rounded-lg mr-3">
              <FaExchangeAlt className="text-primary-contrast text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-header">
                Substitute Meal
              </h2>
              <p className="text-sm text-text-body">
                Find a better alternative for your meal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-body hover:text-text-header hover:bg-bg-muted rounded-lg transition-colors"
            aria-label="Close substitution dialog"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Current Meal */}
        <div className="p-6 border-b border-border-light">
          <h3 className="text-lg font-medium text-text-header mb-3">Current Meal</h3>
          <div className="flex items-center p-4 bg-bg-muted rounded-lg">
            <div className="mr-3">
              {getMealTypeIcon(mealType)}
            </div>
            <div>
              <h4 className="font-semibold text-text-header">{originalMeal}</h4>
              <p className="text-sm text-text-body capitalize">{mealType}</p>
            </div>
          </div>
        </div>

        {/* Reason Selection */}
        <div className="p-6 border-b border-border-light">
          <h3 className="text-lg font-medium text-text-header mb-3">Why are you substituting?</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'allergy', label: 'Allergy/Intolerance', icon: '⚠️' },
              { value: 'preference', label: 'Personal Preference', icon: '❤️' },
              { value: 'availability', label: 'Not Available', icon: '📦' },
              { value: 'cost', label: 'Budget Concern', icon: '💰' }
            ].map(reason => (
              <button
                key={reason.value}
                onClick={() => setSelectedReason(reason.value as 'allergy' | 'preference' | 'availability' | 'cost')}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedReason === reason.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-light bg-bg text-text-body hover:border-primary/50'
                }`}
                type='button'
              >
                <div className="flex items-center">
                  <span className="text-lg mr-2">{reason.icon}</span>
                  <span className="font-medium">{reason.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Alternative Options */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-text-header mb-3">Alternative Options</h3>
          <div className="space-y-4">
            {mockSubstitutions.alternatives.map((alternative, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedAlternative === alternative.name
                    ? 'border-primary bg-primary/10'
                    : 'border-border-light bg-bg hover:border-primary/50'
                }`}
                onClick={() => setSelectedAlternative(alternative.name)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-header mb-1">
                      {alternative.name}
                    </h4>
                    <p className="text-sm text-text-body">
                      {alternative.reason}
                    </p>
                  </div>
                  <div className="ml-4">
                    {selectedAlternative === alternative.name ? (
                      <FaCheck className="text-primary text-lg" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-border-light rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* Nutritional Changes */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className={`font-semibold ${getNutritionChangeColor(alternative.nutritionalDifference.protein)}`}>
                      {getNutritionChangeIcon(alternative.nutritionalDifference.protein)}
                      {Math.abs(alternative.nutritionalDifference.protein)}g
                    </div>
                    <div className="text-text-body">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${getNutritionChangeColor(alternative.nutritionalDifference.carbohydrates)}`}>
                      {getNutritionChangeIcon(alternative.nutritionalDifference.carbohydrates)}
                      {Math.abs(alternative.nutritionalDifference.carbohydrates)}g
                    </div>
                    <div className="text-text-body">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${getNutritionChangeColor(alternative.nutritionalDifference.fat)}`}>
                      {getNutritionChangeIcon(alternative.nutritionalDifference.fat)}
                      {Math.abs(alternative.nutritionalDifference.fat)}g
                    </div>
                    <div className="text-text-body">Fat</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className="p-6 bg-info-bg border-t border-info-border">
          <div className="flex items-start">
            <FaInfoCircle className="text-info mr-3 mt-0.5" />
            <div className="text-sm text-info-foreground">
              <p className="font-medium mb-1">Nutritional Balance</p>
              <p>
                All alternatives are designed to maintain your daily nutritional targets. 
                The changes shown are relative to your current meal selection.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-text-body hover:text-text-header transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubstitute}
            disabled={!selectedAlternative}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedAlternative
                ? 'bg-primary hover:bg-primary/90 text-primary-contrast'
                : 'bg-bg-muted text-text-muted cursor-not-allowed'
            }`}
          >
            <FaCheck className="inline mr-2" />
            Substitute Meal
          </button>
        </div>
      </div>
    </div>
  );
}
