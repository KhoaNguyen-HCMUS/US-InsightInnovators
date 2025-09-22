import { FaFire, FaDrumstickBite, FaBreadSlice, FaCheese, FaLeaf } from 'react-icons/fa';
import type { TodayProgress } from '../../types/dashboard';

interface ProgressTrackerProps {
  progress: TodayProgress;
}

export default function ProgressTracker({ progress }: ProgressTrackerProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-500';
    if (percentage >= 80) return 'text-yellow-500';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMacroIcon = (macro: string) => {
    switch (macro) {
      case 'protein': return <FaDrumstickBite className="text-red-500" />;
      case 'carbohydrates': return <FaBreadSlice className="text-blue-500" />;
      case 'fat': return <FaCheese className="text-yellow-500" />;
      case 'fiber': return <FaLeaf className="text-green-500" />;
      default: return <FaFire className="text-text-body" />;
    }
  };

  const getMacroColor = (macro: string) => {
    switch (macro) {
      case 'protein': return 'text-red-500';
      case 'carbohydrates': return 'text-blue-500';
      case 'fat': return 'text-yellow-500';
      case 'fiber': return 'text-green-500';
      default: return 'text-text-body';
    }
  };

  return (
    <div className="bg-bg-card rounded-lg shadow-md p-5">
      <div className="flex items-center mb-4">
        <div className="p-1.5 bg-primary rounded-lg mr-2">
          <FaFire className="text-primary-contrast text-lg" />
        </div>
        <h2 className="text-lg font-semibold text-text-header">
          Today's Progress
        </h2>
      </div>

      {/* Calories Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <FaFire className="text-orange-500 mr-2" />
            <span className="text-base font-medium text-text-header">Calories</span>
          </div>
          <div className="text-right">
            <span className={`text-xl font-bold ${getProgressColor(progress.calories.percentage)}`}>
              {progress.calories.consumed}
            </span>
            <span className="text-text-body"> / {progress.calories.target}</span>
          </div>
        </div>
        
        <div className="w-full bg-bg-muted rounded-full h-2.5 mb-1.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBgColor(progress.calories.percentage)}`}
            style={{ width: `${Math.min(100, progress.calories.percentage)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className={`font-medium ${getProgressColor(progress.calories.percentage)}`}>
            {progress.calories.percentage.toFixed(0)}% complete
          </span>
          <span className="text-text-body">
            {progress.calories.remaining > 0 ? `${progress.calories.remaining} remaining` : 'Goal reached!'}
          </span>
        </div>
      </div>

      {/* Macros and Other Progress */}
      <div className="grid grid-cols-2 gap-3">
        {/* Macro Cards - First Row */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(progress.macros).slice(0, 2).map(([macro, data]) => (
            <div key={macro} className="bg-bg rounded-lg p-3 border border-border-light">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  {getMacroIcon(macro)}
                  <span className="ml-1.5 text-xs font-medium text-text-body capitalize">
                    {macro}
                  </span>
                </div>
                <span className={`text-xs font-bold ${getMacroColor(macro)}`}>
                  {data.consumed}g
                </span>
              </div>
              
              <div className="w-full bg-bg-muted rounded-full h-1.5 mb-1">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${getMacroColor(macro).replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min(100, data.percentage)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-text-body">
                <span>{data.percentage.toFixed(0)}%</span>
                <span>{data.target}g</span>
              </div>
            </div>
          ))}
        </div>

        {/* Macro Cards - Second Row */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(progress.macros).slice(2, 4).map(([macro, data]) => (
            <div key={macro} className="bg-bg rounded-lg p-3 border border-border-light">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  {getMacroIcon(macro)}
                  <span className="ml-1.5 text-xs font-medium text-text-body capitalize">
                    {macro}
                  </span>
                </div>
                <span className={`text-xs font-bold ${getMacroColor(macro)}`}>
                  {data.consumed}g
                </span>
              </div>
              
              <div className="w-full bg-bg-muted rounded-full h-1.5 mb-1">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${getMacroColor(macro).replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min(100, data.percentage)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-text-body">
                <span>{data.percentage.toFixed(0)}%</span>
                <span>{data.target}g</span>
              </div>
            </div>
          ))}
        </div>

      
      </div>
    </div>
  );
}
