import { FaApple, FaUtensils, FaDrumstickBite, FaLeaf, FaPlus, FaCamera, FaClock, FaCheckCircle } from 'react-icons/fa';
import type { TodayMeal } from '../../types/dashboard';

interface TodayMealsProps {
  meals: TodayMeal[];
  onAddMeal: (mealType: string) => void;
  onEditMeal: (mealId: string) => void;
}

export default function TodayMeals({ meals, onAddMeal, onEditMeal }: TodayMealsProps) {
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

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'scan': return <FaCamera className="text-blue-500" />;
      case 'meal_plan': return <FaCheckCircle className="text-green-500" />;
      case 'manual': return <FaUtensils className="text-text-body" />;
      default: return <FaUtensils className="text-text-body" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getMealsByType = (type: string) => {
    return meals.filter(meal => meal.type === type);
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  const getTotalCaloriesForType = (type: string) => {
    return getMealsByType(type).reduce((sum, meal) => sum + meal.calories, 0);
  };

  return (
    <div className="bg-bg-card rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-1.5 bg-primary rounded-lg mr-2">
            <FaUtensils className="text-primary-contrast text-lg" />
          </div>
          <h2 className="text-lg font-semibold text-text-header">
            Today's Meals
          </h2>
        </div>
        <div className="text-sm text-text-body">
          Total: {meals.reduce((sum, meal) => sum + meal.calories, 0)} cal
        </div>
      </div>

      <div className="space-y-3">
        {mealTypes.map(mealType => {
          const typeMeals = getMealsByType(mealType);
          const totalCalories = getTotalCaloriesForType(mealType);
          
          return (
            <div key={mealType} className="border border-border-light rounded-lg p-3">
              {/* Meal Type Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getMealTypeIcon(mealType)}
                  <h3 className="ml-2 text-sm font-semibold text-text-header capitalize">
                    {mealType}
                  </h3>
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium ${getMealTypeColor(mealType)}`}>
                    {typeMeals.length} item{typeMeals.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-text-body">
                    {totalCalories} cal
                  </span>
                  <button
                    onClick={() => onAddMeal(mealType)}
                    className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title={`Add ${mealType}`}
                  >
                    <FaPlus className="text-xs" />
                  </button>
                </div>
              </div>

              {/* Meals List */}
              {typeMeals.length === 0 ? (
                <div className="text-center py-3 text-text-body">
                  <div className="text-2xl mb-1 opacity-50">
                    {getMealTypeIcon(mealType)}
                  </div>
                  <p className="text-xs">No {mealType} logged yet</p>
                  <button
                    onClick={() => onAddMeal(mealType)}
                    className="mt-1 text-primary hover:text-primary/80 text-xs font-medium"
                  >
                    Add {mealType}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {typeMeals.map(meal => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-2 bg-bg rounded-lg border border-border-light hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => onEditMeal(meal.id)}
                    >
                      <div className="flex items-center flex-1">
                        {/* Meal Image or Icon */}
                        <div className="w-10 h-10 bg-bg-muted rounded-lg flex items-center justify-center mr-2">
                          {meal.imageUrl ? (
                            <img 
                              src={meal.imageUrl} 
                              alt={meal.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            getMealTypeIcon(meal.type)
                          )}
                        </div>

                        {/* Meal Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="font-medium text-sm text-text-header truncate">
                              {meal.name}
                            </h4>
                            <div className="ml-1 flex items-center space-x-1">
                              {getSourceIcon(meal.source)}
                              {meal.isLogged && (
                                <FaCheckCircle className="text-green-500 text-xs" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center text-xs space-x-2">
                            <span className="text-text-body font-medium">
                              {meal.calories} cal
                            </span>
                            <span className="text-text-body text-xs">
                              P:{meal.macros.protein}g•C:{meal.macros.carbohydrates}g•F:{meal.macros.fat}g
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-center text-xs text-text-body ml-2">
                        <FaClock className="mr-0.5" />
                        <span>{formatTime(meal.time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Add Buttons */}
      <div className="mt-4 pt-3 border-t border-border-light">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-body">Quick Add:</span>
          <div className="flex space-x-1">
            {mealTypes.map(type => (
              <button
                key={type}
                onClick={() => onAddMeal(type)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${getMealTypeColor(type)} hover:opacity-80`}
              >
                +{type.substring(0, 1).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
