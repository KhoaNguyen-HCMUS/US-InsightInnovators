import { useState } from 'react';
import type { MealPlan, DailyMealPlan, Meal } from '../../types/mealPlan';
import { FaCalendarAlt, FaUtensils, FaClock, FaUsers, FaFire, FaApple, FaDrumstickBite, FaLeaf, FaExchangeAlt, FaShoppingCart } from 'react-icons/fa';

interface MealPlanDisplayProps {
  mealPlan: MealPlan;
  onMealSubstitute: (mealId: string, mealType: string) => void;
  onViewGroceryList: () => void;
}

export default function MealPlanDisplay({ mealPlan, onMealSubstitute, onViewGroceryList }: MealPlanDisplayProps) {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const getMacroColor = (type: string) => {
    switch (type) {
      case 'protein': return 'text-red-500';
      case 'carbohydrates': return 'text-blue-500';
      case 'fat': return 'text-yellow-500';
      case 'fiber': return 'text-green-500';
      default: return 'text-text-body';
    }
  };

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return <FaApple className="text-orange-500" />;
      case 'lunch': return <FaUtensils className="text-blue-500" />;
      case 'dinner': return <FaDrumstickBite className="text-purple-500" />;
      case 'snack': return <FaLeaf className="text-green-500" />;
      default: return <FaUtensils className="text-text-body" />;
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'lunch': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'dinner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'snack': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderMealCard = (meal: Meal) => (
    <div key={meal.id} className="bg-bg rounded-lg border border-border-light p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="mr-3">
            {getMealTypeIcon(meal.type)}
          </div>
          <div>
            <h4 className="font-semibold text-text-header">{meal.name}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(meal.type)}`}>
                {meal.type}
              </span>
              <span className="text-xs text-text-body bg-bg-muted px-2 py-1 rounded">
                {meal.cuisine}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onMealSubstitute(meal.id, meal.type)}
          className="p-2 text-text-body hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          title="Substitute meal"
        >
          <FaExchangeAlt className="text-sm" />
        </button>
      </div>

      {/* Calories and Macros */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <FaFire className="text-orange-500 mr-2" />
          <span className="text-sm font-medium text-text-body">
            {meal.calories} cal
          </span>
        </div>
        <div className="flex items-center">
          <FaUsers className="text-blue-500 mr-2" />
          <span className="text-sm font-medium text-text-body">
            {meal.servings} serving{meal.servings > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className={`text-sm font-semibold ${getMacroColor('protein')}`}>
            {meal.macros.protein}g
          </div>
          <div className="text-xs text-text-body">Protein</div>
        </div>
        <div className="text-center">
          <div className={`text-sm font-semibold ${getMacroColor('carbohydrates')}`}>
            {meal.macros.carbohydrates}g
          </div>
          <div className="text-xs text-text-body">Carbs</div>
        </div>
        <div className="text-center">
          <div className={`text-sm font-semibold ${getMacroColor('fat')}`}>
            {meal.macros.fat}g
          </div>
          <div className="text-xs text-text-body">Fat</div>
        </div>
      </div>

      {/* Timing */}
      <div className="flex items-center justify-between text-xs text-text-body mb-3">
        <div className="flex items-center">
          <FaClock className="mr-1" />
          <span>Prep: {meal.prepTime}m</span>
        </div>
        <div className="flex items-center">
          <FaClock className="mr-1" />
          <span>Cook: {meal.cookTime}m</span>
        </div>
      </div>

      {/* Ingredients Preview */}
      <div className="mb-3">
        <h5 className="text-xs font-medium text-text-body mb-2">Key Ingredients:</h5>
        <div className="flex flex-wrap gap-1">
          {meal.ingredients.slice(0, 3).map((ingredient, index) => (
            <span
              key={index}
              className="text-xs bg-bg-muted text-text-body px-2 py-1 rounded"
            >
              {ingredient.name}
            </span>
          ))}
          {meal.ingredients.length > 3 && (
            <span className="text-xs text-text-body">
              +{meal.ingredients.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Instructions Preview */}
      <div className="text-xs text-text-body bg-bg-muted p-2 rounded">
        {meal.instructions}
      </div>
    </div>
  );

  const renderDailyView = (dailyPlan: DailyMealPlan) => (
    <div className="space-y-6">
      {/* Day Header */}
      <div className="bg-bg-card rounded-lg p-4 border border-border-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaCalendarAlt className="text-primary mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-text-header">
                {dailyPlan.dayOfWeek}
              </h3>
              <p className="text-sm text-text-body">
                {dailyPlan.date.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-text-header">
              {dailyPlan.totalCalories}
            </div>
            <div className="text-sm text-text-body">calories</div>
          </div>
        </div>

        {/* Daily Macros */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className={`text-lg font-semibold ${getMacroColor('protein')}`}>
              {Math.round(dailyPlan.macros.protein)}g
            </div>
            <div className="text-xs text-text-body">Protein</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${getMacroColor('carbohydrates')}`}>
              {Math.round(dailyPlan.macros.carbohydrates)}g
            </div>
            <div className="text-xs text-text-body">Carbs</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${getMacroColor('fat')}`}>
              {Math.round(dailyPlan.macros.fat)}g
            </div>
            <div className="text-xs text-text-body">Fat</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${getMacroColor('fiber')}`}>
              {Math.round(dailyPlan.macros.fiber)}g
            </div>
            <div className="text-xs text-text-body">Fiber</div>
          </div>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dailyPlan.meals.map(renderMealCard)}
      </div>
    </div>
  );

  const renderWeeklyView = () => (
    <div className="space-y-4">
      {mealPlan.dailyPlans.map((dailyPlan, index) => (
        <div key={index} className="bg-bg-card rounded-lg border border-border-light p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <FaCalendarAlt className="text-primary mr-2" />
              <h3 className="font-semibold text-text-header">
                {dailyPlan.dayOfWeek}
              </h3>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-text-header">
                {dailyPlan.totalCalories} cal
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {dailyPlan.meals.map(meal => (
              <div key={meal.id} className="flex items-center p-2 bg-bg rounded border border-border-light">
                <div className="mr-2">
                  {getMealTypeIcon(meal.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-header truncate">
                    {meal.name}
                  </div>
                  <div className="text-xs text-text-body">
                    {meal.calories} cal
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-bg-card rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary rounded-lg mr-3">
            <FaUtensils className="text-primary-contrast text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-header">
              {mealPlan.duration === 'weekly' ? 'Weekly' : 'Monthly'} Meal Plan
            </h2>
            <p className="text-sm text-text-body">
              {mealPlan.startDate.toLocaleDateString()} - {mealPlan.endDate.toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'daily'
                  ? 'bg-primary text-primary-contrast'
                  : 'text-text-body hover:text-text-header'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'weekly'
                  ? 'bg-primary text-primary-contrast'
                  : 'text-text-body hover:text-text-header'
              }`}
            >
              Weekly
            </button>
          </div>
          
          {/* Grocery List Button */}
          <button
            onClick={onViewGroceryList}
            className="inline-flex items-center px-4 py-2 bg-secondary hover:bg-secondary/90 text-secondary-contrast rounded-lg font-medium transition-colors"
          >
            <FaShoppingCart className="mr-2" />
            Grocery List
          </button>
        </div>
      </div>

      {/* Day Selector for Daily View */}
      {viewMode === 'daily' && (
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {mealPlan.dailyPlans.map((dailyPlan, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDay === index
                    ? 'bg-primary text-primary-contrast'
                    : 'bg-bg-muted text-text-body hover:bg-bg-muted/80'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-semibold">
                    {dailyPlan.dayOfWeek.slice(0, 3)}
                  </div>
                  <div className="text-xs">
                    {dailyPlan.date.getDate()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'daily' 
        ? renderDailyView(mealPlan.dailyPlans[selectedDay])
        : renderWeeklyView()
      }
    </div>
  );
}
