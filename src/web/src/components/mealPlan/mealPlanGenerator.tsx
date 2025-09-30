import { useState, useEffect } from 'react';
import type { HealthProfile } from '../../types/health';
import { generateMealPlan, type MealPlanRequestBody, type MealPlanPreferences, type MealPlanResponseData } from '../../services/mealPlan';
import { FaCalendarAlt, FaUtensils, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { FaStopwatch, FaLeaf, FaBowlFood } from 'react-icons/fa6';

interface MealPlanGeneratorProps {
  healthProfile: Partial<HealthProfile>;
  onMealPlanGenerated: (mealPlan: MealPlanResponseData) => void;
}

export default function MealPlanGenerator({ healthProfile, onMealPlanGenerated }: MealPlanGeneratorProps) {
  const [title, setTitle] = useState<string>('Kế hoạch giảm cân tuần 1');
  const [duration, setDuration] = useState<'weekly' | 'monthly'>('weekly');
  const [focus, setFocus] = useState<'weight_loss' | 'muscle_gain' | 'maintenance'>('weight_loss');
  const [excludeIngredients, setExcludeIngredients] = useState<string>('');
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>(['Vietnamese', 'Asian']);
  const [cookingTime, setCookingTime] = useState<'quick' | 'moderate' | 'elaborate'>('quick');
  const [mealFrequency, setMealFrequency] = useState<number>(3);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Extract allergens from health profile when available
  useEffect(() => {
    if (healthProfile.medicalInfo?.allergies) {
      setExcludeIngredients(healthProfile.medicalInfo.allergies);
    }
  }, [healthProfile.medicalInfo?.allergies]);

  // Update title when focus or duration changes
  useEffect(() => {
    const focusText = focus === 'weight_loss' 
      ? 'Weight Loss' 
      : focus === 'muscle_gain' 
        ? 'Muscle Gain' 
        : 'Maintenance';
    const durationText = duration === 'weekly' ? 'Week' : 'Month';
    
    setTitle(`${focusText} Plan ${durationText} 1`);
  }, [focus, duration]);

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!title.trim()) {
      errors.push('Title cannot be empty');
    }
    
    if (title.length > 255) {
      errors.push('Title cannot exceed 255 characters');
    }
    
    if (mealFrequency < 2 || mealFrequency > 6) {
      errors.push('Meals per day must be between 2 and 6');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleGenerateMealPlan = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsGenerating(true);
    setErrors([]);

    try {
      // Parse excluded ingredients to array
      const excludeIngredientsArray = excludeIngredients
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      // Create request body
      const preferences: MealPlanPreferences = {
        focus,
        exclude_ingredients: excludeIngredientsArray,
        preferred_cuisines: preferredCuisines,
        cooking_time: cookingTime,
        meal_frequency: mealFrequency
      };

      const requestBody: MealPlanRequestBody = {
        duration,
        title,
        preferences
      };

      // Call API
      const response = await generateMealPlan(requestBody);

      if (response.success) {
        onMealPlanGenerated(response.data);
      } else {
        setErrors([response.message || 'Failed to generate meal plan']);
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setErrors(['An error occurred while generating the meal plan. Please try again later.']);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-bg-card rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-primary rounded-lg mr-3">
          <FaUtensils className="text-primary-contrast text-xl" />
        </div>
        <h2 className="text-xl font-semibold text-text-header">
          Create Meal Plan
        </h2>
      </div>

      {/* Basic Information */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-body mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isGenerating}
          className="w-full px-4 py-2.5 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body"
          placeholder="Enter meal plan title"
        />
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
      
      {/* Focus Selection */}
      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-text-body mb-3">
          <FaLeaf className="mr-2 text-success" />
          Goal
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setFocus('weight_loss')}
            disabled={isGenerating}
            className={`p-3 rounded-lg border-2 transition-all ${
              focus === 'weight_loss'
                ? 'border-success bg-success/10 text-success'
                : 'border-border-light bg-bg text-text-body hover:border-success/50'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-center">
              <div className="text-sm font-medium">Weight Loss</div>
            </div>
          </button>
          <button
            onClick={() => setFocus('muscle_gain')}
            disabled={isGenerating}
            className={`p-3 rounded-lg border-2 transition-all ${
              focus === 'muscle_gain'
                ? 'border-warning bg-warning/10 text-warning'
                : 'border-border-light bg-bg text-text-body hover:border-warning/50'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-center">
              <div className="text-sm font-medium">Muscle Gain</div>
            </div>
          </button>
          <button
            onClick={() => setFocus('maintenance')}
            disabled={isGenerating}
            className={`p-3 rounded-lg border-2 transition-all ${
              focus === 'maintenance'
                ? 'border-info bg-info/10 text-info'
                : 'border-border-light bg-bg text-text-body hover:border-info/50'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-center">
              <div className="text-sm font-medium">Maintenance</div>
            </div>
          </button>
        </div>
      </div>

      {/* Excluded Ingredients */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-body mb-2">
          Excluded Ingredients (comma separated)
        </label>
        <input
          type="text"
          value={excludeIngredients}
          onChange={(e) => setExcludeIngredients(e.target.value)}
          disabled={isGenerating}
          className="w-full px-4 py-2.5 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body"
          placeholder="Example: peanuts, milk, seafood..."
        />
      </div>

      {/* Preferred Cuisine */}
      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-text-body mb-3">
          <FaUtensils className="mr-2 text-primary" />
          Preferred Cuisines
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'Vietnamese', label: 'Vietnamese' },
            { id: 'Asian', label: 'Asian' },
            { id: 'European', label: 'European' }
          ].map((cuisine) => (
            <button
              key={cuisine.id}
              onClick={() => {
                if (preferredCuisines.includes(cuisine.id)) {
                  setPreferredCuisines(preferredCuisines.filter(c => c !== cuisine.id));
                } else {
                  setPreferredCuisines([...preferredCuisines, cuisine.id]);
                }
              }}
              disabled={isGenerating}
              className={`p-3 rounded-lg border-2 transition-all ${
                preferredCuisines.includes(cuisine.id)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border-light bg-bg text-text-body hover:border-primary/50'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                <div className="text-sm font-medium">{cuisine.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cooking Time */}
      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-text-body mb-3">
          <FaStopwatch className="mr-2 text-warning" />
          Cooking Time
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setCookingTime('quick')}
            disabled={isGenerating}
            className={`p-3 rounded-lg border-2 transition-all ${
              cookingTime === 'quick'
                ? 'border-success bg-success/10 text-success'
                : 'border-border-light bg-bg text-text-body hover:border-success/50'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-center">
              <div className="text-sm font-medium">Quick</div>
              <div className="text-xs text-text-muted mt-1">&lt; 30 mins</div>
            </div>
          </button>
          <button
            onClick={() => setCookingTime('moderate')}
            disabled={isGenerating}
            className={`p-3 rounded-lg border-2 transition-all ${
              cookingTime === 'moderate'
                ? 'border-warning bg-warning/10 text-warning'
                : 'border-border-light bg-bg text-text-body hover:border-warning/50'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-center">
              <div className="text-sm font-medium">Moderate</div>
              <div className="text-xs text-text-muted mt-1">30-60 mins</div>
            </div>
          </button>
          <button
            onClick={() => setCookingTime('elaborate')}
            disabled={isGenerating}
            className={`p-3 rounded-lg border-2 transition-all ${
              cookingTime === 'elaborate'
                ? 'border-error bg-error/10 text-error'
                : 'border-border-light bg-bg text-text-body hover:border-error/50'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-center">
              <div className="text-sm font-medium">Elaborate</div>
              <div className="text-xs text-text-muted mt-1">&gt; 60 mins</div>
            </div>
          </button>
        </div>
      </div>

      {/* Meal Frequency */}
      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-text-body mb-3">
          <FaBowlFood className="mr-2 text-info" />
          Meals Per Day
        </label>
        <div className="grid grid-cols-5 gap-2">
          {[2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => setMealFrequency(num)}
              disabled={isGenerating}
              className={`p-2 rounded-lg border-2 transition-all ${
                mealFrequency === num
                  ? 'border-info bg-info/10 text-info'
                  : 'border-border-light bg-bg text-text-body hover:border-info/50'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                <div className="text-lg font-medium">{num}</div>
                <div className="text-xs text-text-muted">meals</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-6 bg-error-bg border border-error-border rounded-lg p-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-error mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-error-foreground mb-2">
                Please fix the following errors:
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

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerateMealPlan}
          disabled={isGenerating}
          className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
            isGenerating
              ? 'bg-bg-muted text-text-muted cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90 text-primary-contrast shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {isGenerating ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Generating plan...
            </>
          ) : (
            <>
              <FaCheckCircle className="mr-2" />
              Generate Meal Plan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
