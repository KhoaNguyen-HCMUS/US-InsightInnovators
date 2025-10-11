import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { DashboardData, QuickAction } from '../types/dashboard';
import type { HealthProfile } from '../types/health';
import HealthSnapshot from '../components/dashboard/healthSnapshot';
import ProgressTracker from '../components/dashboard/progressTracker';
import TodayMeals from '../components/dashboard/todayMeals';
import QuickActions from '../components/dashboard/quickActions';
import TrendsChart from '../components/dashboard/trendsChart';
import { FaHome, FaInfoCircle } from 'react-icons/fa';
import { HealthService } from '../services/dashboard';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock health profile - in real app, this would come from context/API
  const [healthProfile] = useState<Partial<HealthProfile>>({
    personalInfo: {
      age: 30,
      gender: 'male',
      height: 175,
      weight: 70,
      location: 'Ho Chi Minh City, Vietnam'
    },
    goals: {
      primary: 'maintain',
      targetWeight: 70
    },
    activityLevel: 'moderate',
    medicalInfo: {
      conditions: 'None',
      allergies: 'None',
      medications: 'None'
    },
    units: {
      weight: 'kg',
      height: 'cm',
      temperature: 'celsius'
    },
    consent: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Sử dụng service để fetch dữ liệu
      const dashboardData = await HealthService.fetchDashboardData(healthProfile as HealthProfile);
      
      setDashboardData(dashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = () => {
    toast.info('Camera scan feature coming soon!');
    // In real app, this would open camera and process food image
  };

  const handleAddMeal = (mealType?: string) => {
    if (mealType) {
      toast.info(`Adding ${mealType}...`);
    } else {
      toast.info('Add meal feature coming soon!');
    }
    // In real app, this would open meal logging form
  };



  const handleEditMeal = (mealId: string) => {
    toast.info(`Editing meal ${mealId}...`);
    // In real app, this would open meal editing form
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-(--gradient-primary) flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-body">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-linear-(--gradient-primary) flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-body">Failed to load dashboard data</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-primary text-primary-contrast rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const quickActions: QuickAction[] = [
    {
      id: 'scan',
      type: 'scan',
      title: 'Scan Food',
      description: 'Take a photo to identify food and nutrition',
      icon: 'camera',
      color: 'blue',
      action: handleScan
    },
    {
      id: 'edit_profile',
      type: 'edit_profile',
      title: 'Edit Profile',
      description: 'Update your health profile and preferences',
      icon: 'user-edit',
      color: 'green',
      action: () => toast.info('Edit profile feature coming soon!')
    }
  ];

  return (
    <div className="min-h-screen bg-linear-(--gradient-primary) py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary text-primary-contrast rounded-lg mr-3">
              <FaHome className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Dashboard
              </h1>
              <p className="text-sm text-text-header">
                Track your health journey and daily progress
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-bg-card border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <FaInfoCircle className="text-blue-500 mr-3 mt-0.5" />
            <div className="text-sm ">
              <p className="font-medium mb-1 text-text-header">Welcome to your health dashboard!</p>
              <p className="text-text-body">Track your daily nutrition, monitor your progress, and stay on top of your health goals.</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Health Snapshot - 2/3 width */}
          <div className="md:col-span-1 lg:col-span-2">
            <HealthSnapshot snapshot={dashboardData.healthSnapshot} />
          </div>
          
          {/* Quick Actions - 1/3 width */}
          <div>
            <QuickActions
              actions={quickActions}
              onScan={handleScan}
            />
          </div>
          
          <div className="md:col-span-2 lg:col-span-3">
            <ProgressTracker progress={dashboardData.todayProgress} />
          </div>
          
          {/* Today's Meals - 2/3 width */}
          <div className="md:col-span-2 lg:col-span-3">
            <TodayMeals 
              meals={dashboardData.todayMeals}
              onAddMeal={handleAddMeal}
              onEditMeal={handleEditMeal}
            />
          </div>
        </div>

        {/* Trends Chart - Full width */}
        <TrendsChart 
          trends={dashboardData.trends}
        />
      </div>
    </div>
  );
}
