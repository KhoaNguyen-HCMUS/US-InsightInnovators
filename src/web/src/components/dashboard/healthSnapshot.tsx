import { FaWeight, FaBullseye, FaArrowUp, FaArrowDown, FaMinus, FaFire, FaTrophy } from 'react-icons/fa';
import type { HealthSnapshot } from '../../types/dashboard';

interface HealthSnapshotProps {
  snapshot: HealthSnapshot;
}

export default function HealthSnapshot({ snapshot }: HealthSnapshotProps) {
  const getBMIColor = (category: string) => {
    switch (category) {
      case 'underweight': return 'text-blue-500';
      case 'normal': return 'text-green-500';
      case 'overweight': return 'text-yellow-500';
      case 'obese': return 'text-red-500';
      default: return 'text-text-body';
    }
  };

  const getBMIBgColor = (category: string) => {
    switch (category) {
      case 'underweight': return 'bg-blue-100 dark:bg-blue-900';
      case 'normal': return 'bg-green-100 dark:bg-green-900';
      case 'overweight': return 'bg-yellow-100 dark:bg-yellow-900';
      case 'obese': return 'bg-red-100 dark:bg-red-900';
      default: return 'bg-bg-muted';
    }
  };

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'lose': return <FaArrowDown className="text-red-500" />;
      case 'gain': return <FaArrowUp className="text-green-500" />;
      case 'maintain': return <FaMinus className="text-blue-500" />;
      default: return <FaBullseye className="text-text-body" />;
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case 'lose': return 'text-red-500';
      case 'gain': return 'text-green-500';
      case 'maintain': return 'text-blue-500';
      default: return 'text-text-body';
    }
  };

  const getWeightChangeIcon = (change: number) => {
    if (change > 0) return <FaArrowUp className="text-red-500" />;
    if (change < 0) return <FaArrowDown className="text-green-500" />;
    return <FaMinus className="text-text-body" />;
  };

  const getWeightChangeColor = (change: number) => {
    if (change > 0) return 'text-red-500';
    if (change < 0) return 'text-green-500';
    return 'text-text-body';
  };

  const formatWeightChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}kg`;
  };

  return (
    <div className="bg-bg-card rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="p-1.5 bg-primary rounded-lg mr-2">
            <FaFire className="text-primary-contrast text-lg" />
          </div>
          <h2 className="text-lg font-semibold text-text-header">
            Health Snapshot
          </h2>
        </div>
        <div className="flex items-center text-sm text-text-body">
          <FaTrophy className="mr-1 text-warning" />
          <span>{snapshot.streak} day streak</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          {/* BMI */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getBMIBgColor(snapshot.bmiCategory)}`}>
            <span className={`text-xl font-bold ${getBMIColor(snapshot.bmiCategory)}`}>
              {snapshot.bmi.toFixed(1)}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-body">BMI</h3>
            <p className={`text-xs font-medium capitalize ${getBMIColor(snapshot.bmiCategory)}`}>
              {snapshot.bmiCategory}
            </p>
          </div>
        </div>

        {/* Current Weight */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-bg-muted rounded-full">
            <FaWeight className="text-xl text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-body">Current Weight</h3>
            <p className="text-sm font-bold text-text-header">
              {snapshot.currentWeight.toFixed(1)}kg
            </p>
          </div>
        </div>

        {/* Goal */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-bg-muted rounded-full">
            {getGoalIcon(snapshot.goal)}
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-body">Goal</h3>
            <p className={`text-xs font-medium capitalize ${getGoalColor(snapshot.goal)}`}>
              {snapshot.goal} weight
              {snapshot.targetWeight && ` (${snapshot.targetWeight.toFixed(1)}kg)`}
            </p>
          </div>
        </div>

        {/* Weight Change */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-bg-muted rounded-full">
            {getWeightChangeIcon(snapshot.weightChange)}
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-body">This Week</h3>
            <p className={`text-xs font-medium ${getWeightChangeColor(snapshot.weightChange)}`}>
              {formatWeightChange(snapshot.weightChange)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar for Goal */}
      {snapshot.targetWeight && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="font-medium text-text-body">Goal Progress</span>
            <span className="text-text-body">
              {Math.abs(snapshot.currentWeight - snapshot.targetWeight).toFixed(1)}kg to go
            </span>
          </div>
          <div className="w-full bg-bg-muted rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                snapshot.goal === 'lose' 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : snapshot.goal === 'gain'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              style={{ 
                width: `${Math.min(100, Math.max(0, 
                  snapshot.goal === 'lose' 
                    ? ((snapshot.currentWeight - snapshot.targetWeight) / (snapshot.currentWeight - snapshot.targetWeight + 5)) * 100
                    : snapshot.goal === 'gain'
                    ? ((snapshot.targetWeight - snapshot.currentWeight) / (snapshot.targetWeight - snapshot.currentWeight + 5)) * 100
                    : 50
                ))}%` 
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
