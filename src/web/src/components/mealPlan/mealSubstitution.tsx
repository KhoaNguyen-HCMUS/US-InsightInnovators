import { useState } from "react";
import type { SubstitutionSuggestion } from "../../types/mealPlan";
import {
  FaExchangeAlt,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaUtensils,
  FaDrumstickBite,
  FaLeaf,
  FaSpinner,
} from "react-icons/fa";
import {
  substituteMeal,
  type MealSubstitutionRequest,
} from "../../services/mealSubstitution";

interface MealSubstitutionProps {
  mealId: string;
  mealPlanId: string;
  mealType: string;
  originalMeal: string;
  dayIndex: number;
  onSubstitute: (substitution: SubstitutionSuggestion) => void;
  onClose: () => void;
}

export default function MealSubstitution({
  mealId,
  mealPlanId,
  mealType,
  originalMeal,
  dayIndex,
  onSubstitute,
  onClose,
}: MealSubstitutionProps) {
  const [customReason, setCustomReason] = useState<string>("");
  const [cuisinePreference, setCuisinePreference] =
    useState<string>("Vietnamese");
  const [maxCookTime, setMaxCookTime] = useState<number>(30);
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([]);
  const [selectedAlternative, setSelectedAlternative] = useState<string>("");
  const [substitutionData, setSubstitutionData] =
    useState<SubstitutionSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case "breakfast":
        return <FaUtensils className="text-orange-500" />;
      case "lunch":
        return <FaUtensils className="text-blue-500" />;
      case "dinner":
        return <FaDrumstickBite className="text-purple-500" />;
      case "snack":
        return <FaLeaf className="text-green-500" />;
      default:
        return <FaUtensils className="text-text-body" />;
    }
  };

  console.log("Rendering MealSubstitution with props:", {
    mealId,
    mealPlanId,
    mealType,
    originalMeal,
    dayIndex,
  });
  const fetchSubstitution = async () => {
    setIsLoading(true);

    try {
      const request: MealSubstitutionRequest = {
        meal_plan_id: mealPlanId, // Use mealPlanId for the request
        day_index: dayIndex,
        meal_slot: mealType,
        dish_to_replace: {
          name: originalMeal,
          calories: 1000,
        },
        preferences: {
          cuisine: cuisinePreference,
          max_cook_time: maxCookTime,
          dietary_requirements: dietaryRequirements,
        },
        reason: customReason || "Looking for a healthier alternative",
      };

      const response = await substituteMeal(mealPlanId, request); // Use mealPlanId for the API call

      if (response.success) {
        // Convert the API response to our internal SubstitutionSuggestion format
        const newSubstitutionData: SubstitutionSuggestion = {
          original: response.data.substitution.original_dish.name,
          alternatives: [
            {
              name: response.data.substitution.substitute_dish.name,
              amount: 1,
              unit: "serving",
              nutritionalDifference: {
                protein:
                  response.data.substitution.substitute_dish.protein || 0,
                carbohydrates:
                  response.data.substitution.substitute_dish.carbs || 0,
                fat: response.data.substitution.substitute_dish.fat || 0,
                fiber: 0,
                sugar: 0,
              },
              reason: response.data.substitution.substitute_dish.why_substitute,
              absolute: {
                calories:
                  response.data.substitution.substitute_dish.calories || 0,
                macros: {
                  protein:
                    response.data.substitution.substitute_dish.protein || 0,
                  carbohydrates:
                    response.data.substitution.substitute_dish.carbs || 0,
                  fat: response.data.substitution.substitute_dish.fat || 0,
                  fiber: undefined as any,
                  sugar: undefined as any,
                } as any,
              },
            },
          ],
          backendUpdated: response.data.updated
            ? {
                dayIndex: response.data.updated.day_index,
                mealSlot: response.data.updated.meal_slot,
                dayTotals: {
                  calories: response.data.updated.day_totals.calories,
                  protein: response.data.updated.day_totals.protein,
                  carbohydrates: response.data.updated.day_totals.carbs,
                  fat: response.data.updated.day_totals.fat,
                },
                scaleApplied: response.data.updated.scale_applied,
                groceryListItems: response.data.updated.grocery_list_items,
              }
            : undefined,
        };

        setSubstitutionData(newSubstitutionData);
        setSelectedAlternative(response.data.substitution.substitute_dish.name);
      } else {
        console.error("Failed to get substitution:", response.message);
      }
    } catch (error) {
      console.error("Error fetching substitution:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubstitute = () => {
    if (!substitutionData) return;
    // Pass the substitution data to the parent component
    onSubstitute(substitutionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ">
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
          <h3 className="text-lg font-medium text-text-header mb-3">
            Current Meal
          </h3>
          <div className="flex items-center p-4 bg-bg-muted rounded-lg">
            <div className="mr-3">{getMealTypeIcon(mealType)}</div>
            <div>
              <h4 className="font-semibold text-text-header">{originalMeal}</h4>
              <p className="text-sm text-text-body capitalize">{mealType}</p>
            </div>
          </div>
        </div>

        {/* Reason Selection */}
        <div className="p-6 border-b border-border-light">
          <h3 className="text-lg font-medium text-text-header mb-3">
            Why are you substituting?
          </h3>

          {/* Custom reason */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-body mb-2">
              Specific requirements
            </label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-4 py-2.5 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body"
              placeholder="e.g., Want to reduce carbs from 120g to under 50g"
            />
          </div>

          {/* Preference fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-body mb-2">
                Cuisine Preference
              </label>
              <select
                value={cuisinePreference}
                onChange={(e) => setCuisinePreference(e.target.value)}
                className="w-full px-4 py-2.5 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body"
                aria-label="Cuisine Preference"
              >
                <option value="Vietnamese">Vietnamese</option>
                <option value="Asian">Asian</option>
                <option value="European">European</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="American">American</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-body mb-2">
                Max Cook Time (minutes)
              </label>
              <input
                type="number"
                value={maxCookTime}
                onChange={(e) => setMaxCookTime(parseInt(e.target.value) || 30)}
                className="w-full px-4 py-2.5 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body"
                placeholder="30"
                min="5"
                max="120"
              />
            </div>
          </div>

          {/* Dietary Requirements */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-body mb-2">
              Dietary Requirements
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "low-carb", label: "Low Carb" },
                { id: "high-protein", label: "High Protein" },
                { id: "low-fat", label: "Low Fat" },
                { id: "high-fiber", label: "High Fiber" },
                { id: "vegetarian", label: "Vegetarian" },
                { id: "gluten-free", label: "Gluten Free" },
              ].map((diet) => (
                <label
                  key={diet.id}
                  className="flex items-center space-x-2 p-2 border border-border-light rounded-lg hover:bg-bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={dietaryRequirements.includes(diet.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDietaryRequirements([
                          ...dietaryRequirements,
                          diet.id,
                        ]);
                      } else {
                        setDietaryRequirements(
                          dietaryRequirements.filter((d) => d !== diet.id)
                        );
                      }
                    }}
                    className="rounded border-border-light text-primary focus:ring-ring h-4 w-4"
                  />
                  <span className="text-sm text-text-body">{diet.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Substitution Results */}
        {substitutionData && (
          <div className="p-6 border-b border-border-light">
            <h3 className="text-lg font-medium text-text-header mb-3">
              Recommended Alternative
            </h3>
            <div className="bg-bg-muted rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-text-header">
                  {substitutionData.alternatives[0].name}
                </h4>
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-text-body mb-3">
                {substitutionData.alternatives[0].reason}
              </p>

              <h5 className="text-sm font-medium text-text-body mt-4 mb-2">
                Nutritional Difference
              </h5>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Protein:</span>
                  <span
                    className={
                      substitutionData.alternatives[0].nutritionalDifference
                        .protein > 0
                        ? "text-green-500"
                        : substitutionData.alternatives[0].nutritionalDifference
                            .protein < 0
                        ? "text-red-500"
                        : "text-text-body"
                    }
                  >
                    {substitutionData.alternatives[0].nutritionalDifference
                      .protein > 0
                      ? "+"
                      : ""}
                    {
                      substitutionData.alternatives[0].nutritionalDifference
                        .protein
                    }
                    g
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Carbs:</span>
                  <span
                    className={
                      substitutionData.alternatives[0].nutritionalDifference
                        .carbohydrates > 0
                        ? "text-red-500"
                        : substitutionData.alternatives[0].nutritionalDifference
                            .carbohydrates < 0
                        ? "text-green-500"
                        : "text-text-body"
                    }
                  >
                    {substitutionData.alternatives[0].nutritionalDifference
                      .carbohydrates > 0
                      ? "+"
                      : ""}
                    {
                      substitutionData.alternatives[0].nutritionalDifference
                        .carbohydrates
                    }
                    g
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fat:</span>
                  <span
                    className={
                      substitutionData.alternatives[0].nutritionalDifference
                        .fat > 0
                        ? "text-red-500"
                        : substitutionData.alternatives[0].nutritionalDifference
                            .fat < 0
                        ? "text-green-500"
                        : "text-text-body"
                    }
                  >
                    {substitutionData.alternatives[0].nutritionalDifference
                      .fat > 0
                      ? "+"
                      : ""}
                    {substitutionData.alternatives[0].nutritionalDifference.fat}
                    g
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="p-6 bg-info-bg border-t border-info-border">
          <div className="flex items-start">
            <FaInfoCircle className="text-info mr-3 mt-0.5" />
            <div className="text-sm text-info-foreground">
              <p className="font-medium mb-1">Nutritional Balance</p>
              <p>
                All alternatives are designed to maintain your daily nutritional
                targets. The changes shown are relative to your current meal
                selection.
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
          {isLoading ? (
            <button
              type="button"
              disabled
              className="px-6 py-2 rounded-lg font-medium bg-bg-muted text-text-muted"
            >
              <FaSpinner className="inline mr-2 animate-spin" />
              Searching...
            </button>
          ) : selectedAlternative ? (
            <button
              type="button"
              onClick={handleSubstitute}
              className="px-6 py-2 rounded-lg font-medium transition-colors bg-primary hover:bg-primary/90 text-primary-contrast"
            >
              <FaCheck className="inline mr-2" />
              Substitute Meal
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fetchSubstitution()}
              className="px-6 py-2 rounded-lg font-medium transition-colors bg-primary hover:bg-primary/90 text-primary-contrast"
            >
              Find Alternatives
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
