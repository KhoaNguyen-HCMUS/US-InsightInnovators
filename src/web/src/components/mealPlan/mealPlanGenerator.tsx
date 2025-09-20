import { useState } from 'react';
import type { MealPlan, UserPreferences, NutritionConstraints, Meal, Ingredient, DailyMealPlan, GroceryItem } from '../../types/mealPlan';
import type { HealthProfile } from '../../types/health';
import { calculateHealthIndices } from '../../utils/healthCalculations';
import { FaCalendarAlt, FaUtensils, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

interface MealPlanGeneratorProps {
  healthProfile: Partial<HealthProfile>;
  onMealPlanGenerated: (mealPlan: MealPlan) => void;
}

export default function MealPlanGenerator({ healthProfile, onMealPlanGenerated }: MealPlanGeneratorProps) {
  const [duration, setDuration] = useState<'weekly' | 'monthly'>('weekly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Mock user preferences - in real app, this would come from user settings
  const [preferences] = useState<UserPreferences>({
    likedFoods: ['chicken', 'salmon', 'rice', 'vegetables'],
    dislikedFoods: ['liver', 'anchovies'],
    favoriteCuisines: ['italian', 'asian', 'mediterranean'],
    dietaryRestrictions: [],
    cookingSkill: 'intermediate',
    availableTime: 60,
    budget: 'medium'
  });

  const validateHealthProfile = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!healthProfile.personalInfo?.age || healthProfile.personalInfo.age < 1) {
      errors.push('Age is required and must be valid');
    }
    
    if (!healthProfile.personalInfo?.height || healthProfile.personalInfo.height < 50) {
      errors.push('Height is required and must be valid');
    }
    
    if (!healthProfile.personalInfo?.weight || healthProfile.personalInfo.weight < 10) {
      errors.push('Weight is required and must be valid');
    }
    
    if (!healthProfile.goals?.primary) {
      errors.push('Health goal is required');
    }
    
    if (!healthProfile.activityLevel) {
      errors.push('Activity level is required');
    }
    
    if (!healthProfile.consent) {
      errors.push('Data processing consent is required');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const generateMealPlan = async () => {
    const validation = validateHealthProfile();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsGenerating(true);
    setErrors([]);
    setWarnings([]);
    setGenerationStep('Retrieving health profile...');

    try {
      // Step 1: Calculate nutrition targets
      setGenerationStep('Calculating nutrition targets...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const healthIndices = calculateHealthIndices(healthProfile as HealthProfile);
      const calorieTarget = healthIndices.recommendedCalories;

      // Step 2: Fetch user preferences
      setGenerationStep('Loading user preferences...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: Prepare constraints
      setGenerationStep('Preparing nutrition constraints...');
      await new Promise(resolve => setTimeout(resolve, 600));

      const constraints: NutritionConstraints = {
        maxCalories: Math.round(calorieTarget * 1.1),
        minCalories: Math.round(calorieTarget * 0.9),
        maxProtein: Math.round(calorieTarget * 0.35 / 4), // 35% of calories from protein
        minProtein: Math.round(calorieTarget * 0.15 / 4), // 15% of calories from protein
        maxCarbs: Math.round(calorieTarget * 0.65 / 4), // 65% of calories from carbs
        minCarbs: Math.round(calorieTarget * 0.45 / 4), // 45% of calories from carbs
        maxFat: Math.round(calorieTarget * 0.35 / 9), // 35% of calories from fat
        minFat: Math.round(calorieTarget * 0.20 / 9), // 20% of calories from fat
        maxSodium: 2300, // mg
        maxSugar: 50, // grams
        allergies: healthProfile.medicalInfo?.allergies?.split(',').map(a => a.trim()).filter(a => a) || [],
        conditions: healthProfile.medicalInfo?.conditions?.split(',').map(c => c.trim()).filter(c => c) || [],
        restrictions: preferences.dietaryRestrictions
      };

      // Step 4: Generate meal plan with LLM (mock)
      setGenerationStep('Generating meal plan with AI...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockMealPlan = generateMockMealPlan(duration, calorieTarget, constraints, preferences);

      // Step 5: Validate against nutrition database
      setGenerationStep('Validating nutrition balance...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 6: Generate grocery list
      setGenerationStep('Creating grocery list...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setGenerationStep('Meal plan generated successfully!');
      await new Promise(resolve => setTimeout(resolve, 500));

      onMealPlanGenerated(mockMealPlan);
      
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setErrors(['Failed to generate meal plan. Please try again.']);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const generateMockMealPlan = (
    duration: 'weekly' | 'monthly',
    calorieTarget: number,
    constraints: NutritionConstraints,
    preferences: UserPreferences
  ): MealPlan => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (duration === 'weekly' ? 7 : 30));

    const dailyPlans = [];
    const days = duration === 'weekly' ? 7 : 30;

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dailyPlan = generateMockDailyPlan(date, calorieTarget);
      dailyPlans.push(dailyPlan);
    }

    const groceryList = generateMockGroceryList(dailyPlans);

    return {
      id: `meal_plan_${Date.now()}`,
      userId: 'user_123',
      duration,
      startDate,
      endDate,
      totalCalories: calorieTarget * days,
      dailyPlans,
      groceryList,
      preferences,
      constraints,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  const generateMockDailyPlan = (date: Date, calorieTarget: number) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const meals = [
      generateMockMeal('breakfast', Math.round(calorieTarget * 0.25)),
      generateMockMeal('lunch', Math.round(calorieTarget * 0.35)),
      generateMockMeal('dinner', Math.round(calorieTarget * 0.30)),
      generateMockMeal('snack', Math.round(calorieTarget * 0.10))
    ];

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const macros = meals.reduce((total, meal) => ({
      protein: total.protein + meal.macros.protein,
      carbohydrates: total.carbohydrates + meal.macros.carbohydrates,
      fat: total.fat + meal.macros.fat,
      fiber: total.fiber + meal.macros.fiber,
      sugar: total.sugar + meal.macros.sugar
    }), { protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0 });

    return {
      date,
      dayOfWeek,
      meals,
      totalCalories,
      macros,
      micros: {
        sodium: 1200,
        potassium: 3500,
        calcium: 1000,
        iron: 18,
        vitaminA: 5000,
        vitaminC: 90,
        vitaminD: 600,
        vitaminE: 15,
        vitaminK: 120,
        thiamine: 1.2,
        riboflavin: 1.3,
        niacin: 16,
        folate: 400,
        vitaminB12: 2.4,
        magnesium: 400,
        zinc: 11
      }
    };
  };

  const generateMockMeal = (type: string, calories: number) => {
    const mealTemplates = {
      breakfast: [
        { name: 'Oatmeal with Berries', cuisine: 'american', prepTime: 5, cookTime: 10 },
        { name: 'Greek Yogurt Parfait', cuisine: 'mediterranean', prepTime: 5, cookTime: 0 },
        { name: 'Avocado Toast', cuisine: 'american', prepTime: 5, cookTime: 5 },
        { name: 'Scrambled Eggs with Spinach', cuisine: 'american', prepTime: 5, cookTime: 10 }
      ],
      lunch: [
        { name: 'Grilled Chicken Salad', cuisine: 'american', prepTime: 10, cookTime: 15 },
        { name: 'Quinoa Buddha Bowl', cuisine: 'asian', prepTime: 15, cookTime: 20 },
        { name: 'Mediterranean Wrap', cuisine: 'mediterranean', prepTime: 10, cookTime: 5 },
        { name: 'Salmon with Roasted Vegetables', cuisine: 'american', prepTime: 10, cookTime: 25 }
      ],
      dinner: [
        { name: 'Baked Cod with Sweet Potato', cuisine: 'american', prepTime: 15, cookTime: 30 },
        { name: 'Stir-fried Tofu with Rice', cuisine: 'asian', prepTime: 10, cookTime: 15 },
        { name: 'Pasta Primavera', cuisine: 'italian', prepTime: 10, cookTime: 20 },
        { name: 'Turkey Meatballs with Zoodles', cuisine: 'italian', prepTime: 15, cookTime: 25 }
      ],
      snack: [
        { name: 'Apple with Almond Butter', cuisine: 'american', prepTime: 2, cookTime: 0 },
        { name: 'Greek Yogurt with Honey', cuisine: 'mediterranean', prepTime: 2, cookTime: 0 },
        { name: 'Mixed Nuts', cuisine: 'american', prepTime: 1, cookTime: 0 },
        { name: 'Hummus with Veggies', cuisine: 'mediterranean', prepTime: 5, cookTime: 0 }
      ]
    };

    const template = mealTemplates[type as keyof typeof mealTemplates][
      Math.floor(Math.random() * mealTemplates[type as keyof typeof mealTemplates].length)
    ];

    return {
      id: `meal_${Date.now()}_${Math.random()}`,
      name: template.name,
      type: type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      calories,
      macros: {
        protein: Math.round(calories * 0.25 / 4),
        carbohydrates: Math.round(calories * 0.50 / 4),
        fat: Math.round(calories * 0.25 / 9),
        fiber: Math.round(calories * 0.02),
        sugar: Math.round(calories * 0.05)
      },
      ingredients: generateMockIngredients(template.name),
      instructions: `Prepare ${template.name} according to standard recipe.`,
      prepTime: template.prepTime,
      cookTime: template.cookTime,
      servings: 1,
      cuisine: template.cuisine,
      tags: ['healthy', 'balanced'],
      substitutions: ['Use gluten-free option if needed', 'Substitute dairy if allergic']
    };
  };

  const generateMockIngredients = (mealName: string) => {
    const ingredientTemplates = {
      'Oatmeal with Berries': [
        { name: 'Rolled Oats', amount: 0.5, unit: 'cup', category: 'carbohydrate' as const },
        { name: 'Mixed Berries', amount: 0.5, unit: 'cup', category: 'fruit' as const },
        { name: 'Almond Milk', amount: 1, unit: 'cup', category: 'dairy' as const },
        { name: 'Honey', amount: 1, unit: 'tbsp', category: 'other' as const }
      ],
      'Grilled Chicken Salad': [
        { name: 'Chicken Breast', amount: 4, unit: 'oz', category: 'protein' as const },
        { name: 'Mixed Greens', amount: 2, unit: 'cups', category: 'vegetable' as const },
        { name: 'Cherry Tomatoes', amount: 0.5, unit: 'cup', category: 'vegetable' as const },
        { name: 'Olive Oil', amount: 1, unit: 'tbsp', category: 'fat' as const }
      ]
    };

    const ingredients = ingredientTemplates[mealName as keyof typeof ingredientTemplates] || [
      { name: 'Main Ingredient', amount: 1, unit: 'serving', category: 'protein' as const },
      { name: 'Vegetable', amount: 1, unit: 'cup', category: 'vegetable' as const },
      { name: 'Seasoning', amount: 1, unit: 'tsp', category: 'spice' as const }
    ];

    return ingredients.map(ing => ({
      ...ing,
      calories: Math.round(Math.random() * 50 + 20),
      macros: {
        protein: Math.round(Math.random() * 10 + 2),
        carbohydrates: Math.round(Math.random() * 15 + 5),
        fat: Math.round(Math.random() * 5 + 1),
        fiber: Math.round(Math.random() * 3 + 1),
        sugar: Math.round(Math.random() * 5 + 1)
      },
      allergens: Math.random() > 0.8 ? ['gluten', 'dairy'] : []
    }));
  };

  const generateMockGroceryList = (dailyPlans: DailyMealPlan[]): GroceryItem[] => {
    const allIngredients = dailyPlans.flatMap(day => 
      day.meals.flatMap((meal: Meal) => meal.ingredients)
    );

    const groupedIngredients = allIngredients.reduce((acc, ingredient) => {
      const key = ingredient.name;
      if (acc[key]) {
        acc[key].amount += ingredient.amount;
      } else {
        acc[key] = { ...ingredient };
      }
      return acc;
    }, {} as Record<string, Ingredient>);

    return Object.values(groupedIngredients).map((ing): GroceryItem => ({
      name: ing.name,
      amount: parseFloat(ing.amount.toFixed(2)),
      unit: ing.unit,
      category: ing.category,
      estimatedCost: Math.round(Math.random() * 5) + 1, // Mock cost between $1-$6
      isChecked: false // Default to unchecked
    }));
  };

  return (
    <div className="bg-bg-card rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-primary rounded-lg mr-3">
          <FaUtensils className="text-primary-contrast text-xl" />
        </div>
        <h2 className="text-xl font-semibold text-text-header">
          Generate Meal Plan
        </h2>
      </div>

      {/* Duration Selection */}
      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-text-body mb-3">
          <FaCalendarAlt className="mr-2 text-primary" />
          Plan Duration
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setDuration('weekly')}
            disabled={isGenerating}
            className={`p-4 rounded-lg border-2 transition-all ${
              duration === 'weekly'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border-light bg-bg text-text-body hover:border-primary/50'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">7</div>
              <div className="text-sm">Days</div>
            </div>
          </button>
          <button
            onClick={() => setDuration('monthly')}
            disabled={isGenerating}
            className={`p-4 rounded-lg border-2 transition-all ${
              duration === 'monthly'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border-light bg-bg text-text-body hover:border-primary/50'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">30</div>
              <div className="text-sm">Days</div>
            </div>
          </button>
        </div>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <div className="mb-6 p-4 bg-info-bg border border-info-border rounded-lg">
          <div className="flex items-center">
            <FaSpinner className="animate-spin text-info mr-3" />
            <div>
              <p className="text-sm font-medium text-info-foreground">
                {generationStep}
              </p>
              <div className="w-full bg-bg-muted rounded-full h-2 mt-2">
                <div className="bg-info h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-6 bg-error-bg border border-error-border rounded-lg p-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-error mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-error-foreground mb-2">
                Please fix the following issues:
              </h3>
              <ul className="text-sm text-error-foreground space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-6 bg-warning-bg border border-warning-border rounded-lg p-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-warning mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-warning-foreground mb-2">
                Recommendations:
              </h3>
              <ul className="text-sm text-warning-foreground space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-text-body">
          <p className="mb-1">
            <strong>Target Calories:</strong> {healthProfile.consent ? 
              Math.round(calculateHealthIndices(healthProfile as HealthProfile).recommendedCalories) : 
              'Complete health profile first'
            }
          </p>
          <p>
            <strong>Duration:</strong> {duration === 'weekly' ? '7 days' : '30 days'}
          </p>
        </div>
        <button
          onClick={generateMealPlan}
          disabled={isGenerating || !healthProfile.consent}
          className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
            isGenerating || !healthProfile.consent
              ? 'bg-bg-muted text-text-muted cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90 text-primary-contrast shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {isGenerating ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <FaCheckCircle className="mr-2" />
              Generate Plan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
