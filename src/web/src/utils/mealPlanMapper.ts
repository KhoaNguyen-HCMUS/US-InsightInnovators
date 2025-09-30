import type { MealPlan, DailyMealPlan, Meal, MacroNutrients, GroceryItem } from '../types/mealPlan';
import type { MealPlanResponseData, MealData } from '../services/mealPlan';

// Helper function to generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper function to get day of week from date string
const getDayOfWeek = (dateStr: string): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

// Helper to convert API meal data to internal Meal format
const mapMeal = (mealData: MealData, type: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Meal => {
  return {
    id: generateId(),
    name: mealData.name,
    type: type,
    calories: mealData.calories,
    macros: {
      protein: mealData.protein,
      carbohydrates: mealData.carbs,
      fat: mealData.fat,
      fiber: 0, // API doesn't provide this
      sugar: 0  // API doesn't provide this
    },
    ingredients: mealData.ingredients.map(ingredientName => ({
      name: ingredientName,
      amount: 1, // Default value as API doesn't provide
      unit: 'serving', // Default value as API doesn't provide
      category: 'other' as const, // Default value as API doesn't provide
      calories: 0, // We don't have per-ingredient calories
      macros: { protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0 }, // Default values
      allergens: [] // Default value as API doesn't provide
    })),
    instructions: mealData.cooking_instructions,
    prepTime: 15, // Default value as API doesn't provide specific breakdown
    cookTime: mealData.cooking_time === 'quick' ? 15 : mealData.cooking_time === 'moderate' ? 30 : 60,
    servings: 1, // Default value as API doesn't provide
    cuisine: mealData.cuisine,
    tags: []
  };
};

// Convert API response to internal MealPlan format
export const mapApiResponseToMealPlan = (apiResponse: MealPlanResponseData): MealPlan => {
  const mealPlanData = apiResponse.meal_plan;
  const startDate = new Date();
  const endDate = new Date();
  if (mealPlanData.duration === 'weekly') {
    endDate.setDate(startDate.getDate() + 6);
  } else {
    endDate.setDate(startDate.getDate() + 29);
  }

  // Map daily plans
  const dailyPlans: DailyMealPlan[] = [];
  const daysOfPlan = Object.keys(mealPlanData.plan_data).sort();
  
  for (let i = 0; i < daysOfPlan.length; i++) {
    const dayKey = daysOfPlan[i];
    const dayPlanData = mealPlanData.plan_data[dayKey];
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + i);

    const meals: Meal[] = [];
    
    // Map each meal in the day
    if (dayPlanData.breakfast) {
      meals.push(mapMeal(dayPlanData.breakfast, 'breakfast'));
    }
    
    if (dayPlanData.lunch) {
      meals.push(mapMeal(dayPlanData.lunch, 'lunch'));
    }
    
    if (dayPlanData.dinner) {
      meals.push(mapMeal(dayPlanData.dinner, 'dinner'));
    }
    
    // Handle snacks or other meals
    Object.keys(dayPlanData).forEach(mealKey => {
      if (!['breakfast', 'lunch', 'dinner'].includes(mealKey)) {
        meals.push(mapMeal(dayPlanData[mealKey], 'snack'));
      }
    });
    
    // Calculate total calories and macros for the day
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const macros: MacroNutrients = {
      protein: meals.reduce((sum, meal) => sum + meal.macros.protein, 0),
      carbohydrates: meals.reduce((sum, meal) => sum + meal.macros.carbohydrates, 0),
      fat: meals.reduce((sum, meal) => sum + meal.macros.fat, 0),
      fiber: 0, // API doesn't provide this
      sugar: 0  // API doesn't provide this
    };

    dailyPlans.push({
      date: dayDate,
      dayOfWeek: getDayOfWeek(dayDate.toISOString()),
      meals,
      totalCalories,
      macros,
      micros: {
        sodium: 0, potassium: 0, calcium: 0, iron: 0, vitaminA: 0, vitaminC: 0,
        vitaminD: 0, vitaminE: 0, vitaminK: 0, thiamine: 0, riboflavin: 0,
        niacin: 0, folate: 0, vitaminB12: 0, magnesium: 0, zinc: 0
      }
    });
  }

  // Create grocery items from API response
  const groceryList: GroceryItem[] = [];
  const groceryCategories = ['vegetables', 'proteins', 'grains', 'other'];
  
  groceryCategories.forEach(category => {
    const items = mealPlanData.grocery_list[category as keyof typeof mealPlanData.grocery_list];
    if (items && Array.isArray(items)) {
      items.forEach((item) => {
        const [name, details] = item;
        groceryList.push({
          name: name,
          category: details.category,
          amount: details.quantity,
          unit: details.unit,
          estimatedCost: 0, // Not provided by API
          isChecked: false
        });
      });
    }
  });

  // Create the full meal plan object
  // Calculate total days based on duration or available data
  const totalDays = mealPlanData.duration === 'weekly' ? 7 : 30;
  
  return {
    id: mealPlanData.id,
    userId: 'current-user', // We don't have this from API
    duration: mealPlanData.duration,
    startDate,
    endDate,
    totalCalories: mealPlanData.nutrition_targets.calories * totalDays,
    dailyPlans,
    groceryList,
    preferences: {
      likedFoods: [],
      dislikedFoods: [],
      favoriteCuisines: ['Vietnamese'], // Default since API doesn't provide
      dietaryRestrictions: [],
      cookingSkill: 'intermediate',
      availableTime: 60, // Default
      budget: 'medium' // Default
    },
    constraints: {
      maxCalories: mealPlanData.nutrition_targets.calories,
      minCalories: mealPlanData.nutrition_targets.calories * 0.9,
      maxProtein: mealPlanData.nutrition_targets.protein,
      minProtein: mealPlanData.nutrition_targets.protein * 0.9,
      maxCarbs: mealPlanData.nutrition_targets.carbs,
      minCarbs: mealPlanData.nutrition_targets.carbs * 0.9,
      maxFat: mealPlanData.nutrition_targets.fat,
      minFat: mealPlanData.nutrition_targets.fat * 0.9,
      maxSodium: 2300, // Default based on general guidelines
      maxSugar: 25, // Default based on general guidelines
      allergies: [],
      conditions: [],
      restrictions: []
    },
    version: 1,
    createdAt: new Date(), // API doesn't provide in standard format
    updatedAt: new Date() // API doesn't provide in standard format
  };
};