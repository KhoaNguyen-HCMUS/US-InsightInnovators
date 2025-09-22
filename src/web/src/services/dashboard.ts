import type { DashboardData, TrendsData } from '../types/dashboard';
import type { HealthProfile } from '../types/health';
import { calculateHealthIndices } from '../utils/healthCalculations';

/**
 * Service class for handling all health related data fetching and processing
 */
export class HealthService {
  /**
   * Fetch dashboard data from API
   * @param healthProfile User's health profile
   * @returns Promise with dashboard data
   */
  static async fetchDashboardData(healthProfile: HealthProfile): Promise<DashboardData> {
    // In a real app, this would be an actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const healthIndices = calculateHealthIndices(healthProfile);
        
        const mockDashboardData: DashboardData = {
          healthSnapshot: {
            bmi: healthIndices.bmi.value,
            bmiCategory: healthIndices.bmi.category,
            goal: healthProfile.goals?.primary || 'maintain',
            targetWeight: healthProfile.goals?.targetWeight,
            currentWeight: healthProfile.personalInfo?.weight || 70,
            weightChange: -0.5, 
            streak: 7 
          },
          todayProgress: {
            calories: {
              consumed: 1200,
              target: healthIndices.recommendedCalories,
              remaining: healthIndices.recommendedCalories - 1200,
              percentage: (1200 / healthIndices.recommendedCalories) * 100
            },
            macros: {
              protein: {
                consumed: 80,
                target: Math.round(healthIndices.recommendedCalories * 0.25 / 4),
                percentage: 75
              },
              carbohydrates: {
                consumed: 150,
                target: Math.round(healthIndices.recommendedCalories * 0.50 / 4),
                percentage: 60
              },
              fat: {
                consumed: 45,
                target: Math.round(healthIndices.recommendedCalories * 0.25 / 9),
                percentage: 80
              },
              fiber: {
                consumed: 20,
                target: 30,
                percentage: 67
              }
            },
            water: {
              consumed: 1200,
              target: 2500,
              percentage: 48
            },
            exercise: {
              minutes: 30,
              caloriesBurned: 200
            }
          },
          todayMeals: [
            {
              id: '1',
              type: 'breakfast',
              name: 'Oatmeal with Berries',
              calories: 350,
              macros: { protein: 12, carbohydrates: 60, fat: 8, fiber: 8 },
              time: new Date(2024, 0, 1, 8, 0),
              source: 'meal_plan',
              isLogged: true
            },
            {
              id: '2',
              type: 'lunch',
              name: 'Grilled Chicken Salad',
              calories: 450,
              macros: { protein: 35, carbohydrates: 20, fat: 25, fiber: 6 },
              time: new Date(2024, 0, 1, 12, 30),
              source: 'scan',
              isLogged: true
            },
            {
              id: '3',
              type: 'snack',
              name: 'Apple with Almond Butter',
              calories: 200,
              macros: { protein: 6, carbohydrates: 25, fat: 12, fiber: 4 },
              time: new Date(2024, 0, 1, 15, 0),
              source: 'manual',
              isLogged: true
            }
          ],
          quickActions: [],
          trends: HealthService.generateTrendsData(),
          lastUpdated: new Date()
        };

        resolve(mockDashboardData);
      }, 1000);
    });
  }

  /**
   * Generate trends data for charts
   * @param period 'week' or 'month'
   * @returns Trends data object
   */
  static generateTrendsData(period: 'week' | 'month' = 'week'): TrendsData {
    const days = period === 'week' ? 7 : 30;
    const calories = [];
    const weight = [];
    const water = [];
    const protein = [];
    const carbohydrates = [];
    const fat = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      calories.push({
        date,
        value: Math.round(1800 + Math.random() * 400),
        target: 2000
      });
      
      weight.push({
        date,
        value: Math.round((70 - (i * 0.1) + Math.random() * 0.2) * 10) / 10,
        target: 70
      });
      
      water.push({
        date,
        value: Math.round(2000 + Math.random() * 1000),
        target: 2500
      });
      
      protein.push({
        date,
        value: Math.round(80 + Math.random() * 20),
        target: 100
      });
      
      carbohydrates.push({
        date,
        value: Math.round(200 + Math.random() * 50),
        target: 250
      });
      
      fat.push({
        date,
        value: Math.round(60 + Math.random() * 20),
        target: 80
      });
    }

    return {
      period,
      calories,
      weight,
      macros: { protein, carbohydrates, fat },
      water,
      exercise: []
    };
  }

  /**
   * Fetch trends data for a specific period
   * @param period 'week' or 'month'
   * @returns Promise with trends data
   */
  static async fetchTrendsData(period: 'week' | 'month' = 'week'): Promise<TrendsData> {
    // In a real app, this would be an actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(HealthService.generateTrendsData(period));
      }, 500);
    });
  }
}