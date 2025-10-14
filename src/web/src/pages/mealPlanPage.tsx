import { useState } from "react";
import { toast } from "react-toastify";
import type {
  MealPlan,
  SubstitutionSuggestion,
  GroceryItem,
} from "../types/mealPlan";
import type { HealthProfile } from "../types/health";
import type { MealPlanResponseData } from "../services/mealPlan";
import { mapApiResponseToMealPlan } from "../utils/mealPlanMapper";
import MealPlanGenerator from "../components/mealPlan/mealPlanGenerator";
import MealPlanDisplay from "../components/mealPlan/mealPlanDisplay";
import MealSubstitution from "../components/mealPlan/mealSubstitution";
import GroceryList from "../components/mealPlan/groceryList";
import { FaUtensils, FaInfoCircle } from "react-icons/fa";

export default function MealPlanPage() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isSubstituting, setIsSubstituting] = useState(false);
  const [isViewingGroceryList, setIsViewingGroceryList] = useState(false);
  const [substitutionData, setSubstitutionData] = useState<{
    mealId: string;
    mealType: string;
    originalMeal: string;
    dayIndex?: number;
    mealPlanId: string;
  } | null>(null);

  const [healthProfile] = useState<Partial<HealthProfile>>({
    personalInfo: {
      age: 30,
      gender: "male",
      height: 175,
      weight: 70,
      location: "Ho Chi Minh City, Vietnam",
    },
    goals: {
      primary: "maintain",
    },
    activityLevel: "moderate",
    medicalInfo: {
      conditions: "None",
      allergies: "None",
      medications: "None",
    },
    units: {
      weight: "kg",
      height: "cm",
      temperature: "celsius",
    },
    consent: true,
  });

  const handleMealPlanGenerated = (responseData: MealPlanResponseData) => {
    const newMealPlan = mapApiResponseToMealPlan(responseData);
    setMealPlan(newMealPlan);
    toast.success(
      `${
        newMealPlan.duration === "weekly" ? "Weekly" : "Monthly"
      } meal plan generated successfully!`
    );
  };

  const handleMealSubstitute = (mealId: string, mealType: string) => {
    // Find the day index and original meal
    let dayIndex = -1;
    let originalMeal = "Unknown Meal";

    console.log("Handling meal substitution for:", { mealId, mealType });

    if (mealPlan) {
      for (let i = 0; i < mealPlan.dailyPlans.length; i++) {
        const foundMeal = mealPlan.dailyPlans[i].meals.find(
          (meal) => meal.id === mealId
        );
        if (foundMeal) {
          dayIndex = i;
          originalMeal = foundMeal.name;
          break;
        }
      }
    }

    // We need to include the meal plan ID in the substitution data
    setSubstitutionData({
      mealId,
      mealType,
      originalMeal,
      dayIndex,
      mealPlanId: mealPlan?.id || "", // Add the meal plan ID
    });
    setIsSubstituting(true);
  };

  const handleSubstitution = (substitution: SubstitutionSuggestion) => {
    if (!mealPlan || !substitutionData) return;

    // Update the meal plan with the substitution using backend-provided values if available
    const updatedMealPlan = { ...mealPlan };
    const alternative = substitution.alternatives[0];

    updatedMealPlan.dailyPlans = updatedMealPlan.dailyPlans.map((day) => {
      const meals = day.meals.map((meal) => {
        if (meal.id !== substitutionData.mealId) return meal;

        // Prefer absolute macros/calories from backend if provided
        const updatedMacros = alternative.absolute
          ? {
              protein: alternative.absolute.macros.protein,
              carbohydrates: alternative.absolute.macros.carbohydrates,
              fat: alternative.absolute.macros.fat,
              fiber: meal.macros.fiber,
              sugar: meal.macros.sugar,
            }
          : {
              protein: Math.max(
                0,
                meal.macros.protein + alternative.nutritionalDifference.protein
              ),
              carbohydrates: Math.max(
                0,
                meal.macros.carbohydrates +
                  alternative.nutritionalDifference.carbohydrates
              ),
              fat: Math.max(
                0,
                meal.macros.fat + alternative.nutritionalDifference.fat
              ),
              fiber: Math.max(
                0,
                meal.macros.fiber + alternative.nutritionalDifference.fiber
              ),
              sugar: Math.max(
                0,
                meal.macros.sugar + alternative.nutritionalDifference.sugar
              ),
            };

        const updatedCalories = alternative.absolute
          ? Math.max(0, Math.round(alternative.absolute.calories))
          : Math.max(
              0,
              Math.round(
                meal.calories +
                  alternative.nutritionalDifference.protein * 4 +
                  alternative.nutritionalDifference.carbohydrates * 4 +
                  alternative.nutritionalDifference.fat * 9
              )
            );

        return {
          ...meal,
          name: alternative.name,
          calories: updatedCalories,
          macros: updatedMacros,
          ingredients: [
            {
              name: alternative.name,
              amount: alternative.amount,
              unit: alternative.unit,
              category: "protein" as const,
              calories: 0,
              macros: {
                protein: 0,
                carbohydrates: 0,
                fat: 0,
                fiber: 0,
                sugar: 0,
              },
              allergens: [],
            },
          ],
          instructions: `Prepare ${alternative.name} according to standard recipe. ${alternative.reason}`,
          substitutions: meal.substitutions
            ? [
                ...meal.substitutions,
                `Substituted for ${substitution.original}: ${alternative.reason}`,
              ]
            : [
                `Substituted for ${substitution.original}: ${alternative.reason}`,
              ],
        };
      });

      // Recompute day's total calories and macros after substitution
      const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
      const macros = {
        protein: meals.reduce((sum, m) => sum + m.macros.protein, 0),
        carbohydrates: meals.reduce(
          (sum, m) => sum + m.macros.carbohydrates,
          0
        ),
        fat: meals.reduce((sum, m) => sum + m.macros.fat, 0),
        fiber: meals.reduce((sum, m) => sum + m.macros.fiber, 0),
        sugar: meals.reduce((sum, m) => sum + m.macros.sugar, 0),
      };

      return { ...day, meals, totalCalories, macros };
    });

    // If backend returned flattened grocery items, merge to grocery list
    if (substitution.backendUpdated?.groceryListItems) {
      updatedMealPlan.groceryList =
        substitution.backendUpdated.groceryListItems.map((item) => ({
          name: item.name,
          category: item.category,
          amount: item.amount,
          unit: item.unit,
          estimatedCost: 0,
          isChecked: false,
        }));
    }

    setMealPlan(updatedMealPlan);
    setIsSubstituting(false);
    setSubstitutionData(null);
    toast.success(`Meal substituted successfully!`);
  };

  const handleGroceryListUpdate = (index: number, item: GroceryItem) => {
    if (!mealPlan) return;

    const updatedGroceryList = [...mealPlan.groceryList];
    updatedGroceryList[index] = item;

    setMealPlan({
      ...mealPlan,
      groceryList: updatedGroceryList,
    });
  };

  const handleGroceryListDelete = (index: number) => {
    if (!mealPlan) return;

    const updatedGroceryList = mealPlan.groceryList.filter(
      (_, i) => i !== index
    );

    setMealPlan({
      ...mealPlan,
      groceryList: updatedGroceryList,
    });
  };

  const handleGroceryListAdd = (item: GroceryItem) => {
    if (!mealPlan) return;

    setMealPlan({
      ...mealPlan,
      groceryList: [...mealPlan.groceryList, item],
    });
  };

  return (
    <div className="min-h-screen bg-linear-(--gradient-primary) py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-primary rounded-lg mr-4">
              <FaUtensils className="text-primary-contrast text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-header">
                Meal Planning
              </h1>
              <p className="mt-2 text-text-body">
                AI-powered meal plans tailored to your health goals and
                preferences
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-info-bg border border-info-border rounded-lg p-4">
          <div className="flex items-start">
            <FaInfoCircle className="text-info mr-3 mt-0.5" />
            <div className="text-sm text-info-foreground">
              <p className="font-medium mb-1 text-text-header">How it works:</p>
              <ul className="space-y-1 text-text-body">
                <li>• Select your preferred duration (weekly or monthly)</li>
                <li>• Our AI analyzes your health profile and preferences</li>
                <li>• Get a personalized meal plan with nutritional balance</li>
                <li>
                  • Customize meals with substitutions and view your grocery
                  list
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Meal Plan Generator */}
        <MealPlanGenerator
          healthProfile={healthProfile}
          onMealPlanGenerated={handleMealPlanGenerated}
        />

        {/* Meal Plan Display */}
        {mealPlan && (
          <MealPlanDisplay
            mealPlan={mealPlan}
            onMealSubstitute={handleMealSubstitute}
            onViewGroceryList={() => setIsViewingGroceryList(true)}
          />
        )}

        {/* Meal Substitution Modal */}
        {isSubstituting && substitutionData && (
          <MealSubstitution
            mealId={substitutionData.mealId}
            mealPlanId={substitutionData.mealPlanId}
            mealType={substitutionData.mealType}
            originalMeal={substitutionData.originalMeal}
            dayIndex={substitutionData.dayIndex || 0}
            onSubstitute={handleSubstitution}
            onClose={() => {
              setIsSubstituting(false);
              setSubstitutionData(null);
            }}
          />
        )}

        {/* Grocery List Modal */}
        {isViewingGroceryList && mealPlan && (
          <GroceryList
            groceryList={mealPlan.groceryList}
            onClose={() => setIsViewingGroceryList(false)}
            onUpdateItem={handleGroceryListUpdate}
            onDeleteItem={handleGroceryListDelete}
            onAddItem={handleGroceryListAdd}
          />
        )}

        {/* No Meal Plan State */}
        {!mealPlan && (
          <div className="bg-bg-card rounded-lg shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-bg-muted rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaUtensils className="text-2xl text-text-muted" />
              </div>
              <h3 className="text-xl font-semibold text-text-header mb-2">
                No Meal Plan Yet
              </h3>
              <p className="text-text-body mb-6">
                Generate your first personalized meal plan based on your health
                profile and preferences.
              </p>
              <div className="text-sm text-text-body">
                <p className="mb-2">Your meal plan will include:</p>
                <ul className="space-y-1 text-left">
                  <li>• Daily meal suggestions with nutritional info</li>
                  <li>• Ingredient lists and cooking instructions</li>
                  <li>• Automatic grocery list generation</li>
                  <li>• Meal substitution options</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
