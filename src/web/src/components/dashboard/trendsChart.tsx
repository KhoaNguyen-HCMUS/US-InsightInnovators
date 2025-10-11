import { useState } from 'react';
import { FaChartPie, FaCalendar, FaFire, FaWeight, FaDrumstickBite, FaBreadSlice, FaCheese, FaChartLine } from 'react-icons/fa';
import type { TrendsData } from '../../types/dashboard';
import BarChartComponent from './barChartComponent';
import { normalizeChartData, calculateMaxValue, calculateMinValue, formatDateLabel } from '../../utils/chartData.utils';

interface TrendsChartProps {
  trends: TrendsData;
}

export default function TrendsChart({ trends }: TrendsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'calories' | 'weight' | 'macros'>('calories');
  const [selectedMacro, setSelectedMacro] = useState<'protein' | 'carbohydrates' | 'fat'>('protein');

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'calories': return <FaFire className="text-orange-500" />;
      case 'weight': return <FaWeight className="text-purple-500" />;
      case 'macros': 
        switch (selectedMacro) {
          case 'protein': return <FaDrumstickBite className="text-red-500" />;
          case 'carbohydrates': return <FaBreadSlice className="text-blue-500" />;
          case 'fat': return <FaCheese className="text-yellow-500" />;
          default: return <FaDrumstickBite className="text-red-500" />;
        }
      default: return <FaChartLine className="text-text-body" />;
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'calories': return 'text-orange-500';
      case 'weight': return 'text-purple-500';
      case 'macros': 
        switch (selectedMacro) {
          case 'protein': return 'text-red-500';
          case 'carbohydrates': return 'text-blue-500';
          case 'fat': return 'text-yellow-500';
          default: return 'text-red-500';
        }
      default: return 'text-text-body';
    }
  };

  const getCurrentData = () => {
    switch (selectedMetric) {
      case 'calories': return trends.calories;
      case 'weight': return trends.weight;
      case 'macros': return trends.macros[selectedMacro];
      default: return trends.calories;
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'calories': return 'Calories';
      case 'weight': return 'Weight (kg)';
      case 'macros': return `${selectedMacro.charAt(0).toUpperCase() + selectedMacro.slice(1)} (g)`;
      default: return 'Value';
    }
  };

  // Using the formatDate function imported from dateUtils

  const getMaxValue = () => {
    const data = getCurrentData();
    return calculateMaxValue(data);
  };

  const getMinValue = () => {
    const data = getCurrentData();
    return calculateMinValue(data);
  };

  // Sử dụng Bar Chart cho cả Weight và Calories

  // Bar Chart for Calories and Water (shows daily values as vertical bars)
  const renderBarChart = () => {
    const rawData = getCurrentData();
    const data = normalizeChartData(rawData);
    
    const maxValue = getMaxValue();
    const minValue = getMinValue();
    
    return (
      <BarChartComponent 
        data={data}
        metricColor={getMetricColor(selectedMetric)}
        minValue={minValue}
        maxValue={maxValue}
        period="week"
      />
    );
  };

  // Area Chart for Macros (shows cumulative intake)
  const renderAreaChart = () => {
    const data = getCurrentData();
    const maxValue = getMaxValue();
    const minValue = getMinValue();
    const range = maxValue - minValue;

    return (
      <div className="relative h-48 bg-bg-muted rounded-lg p-4">
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent, index) => (
            <line
              key={index}
              x1="0"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.1"
              className="text-text-body"
            />
          ))}
          
          {/* Target line */}
          {data[0]?.target && (
            <line
              x1="0"
              y1={`${((data[0].target - minValue) / range) * 100}%`}
              x2="100%"
              y2={`${((data[0].target - minValue) / range) * 100}%`}
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
              className="text-primary"
            />
          )}
          
          {/* Area fill */}
          <path
            fill={`url(#gradient-${selectedMetric})`}
            opacity="0.3"
            d={`M 0,100 ${data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((point.value - minValue) / range) * 100;
              return `L ${x},${y}`;
            }).join(' ')} L 100,100 Z`}
          />
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={getMetricColor(selectedMetric)}
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((point.value - minValue) / range) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((point.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="currentColor"
                className={getMetricColor(selectedMetric)}
              />
            );
          })}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id={`gradient-${selectedMetric}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" className={getMetricColor(selectedMetric)} />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" className={getMetricColor(selectedMetric)} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-2">
          {data.map((point, index) => (
            <span key={index} className="text-xs text-text-body">
              {formatDateLabel(point.date, 'week')}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Pie Chart for Macro Distribution (shows current day's macro breakdown)
  const renderPieChart = () => {
    const todayData = trends.macros;
    const totalProtein = todayData.protein.reduce((sum, point) => sum + point.value, 0);
    const totalCarbs = todayData.carbohydrates.reduce((sum, point) => sum + point.value, 0);
    const totalFat = todayData.fat.reduce((sum, point) => sum + point.value, 0);
    const total = totalProtein + totalCarbs + totalFat;

    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-48 bg-bg-muted rounded-lg">
          <div className="text-center">
            <FaChartPie className="text-4xl text-text-muted mx-auto mb-2" />
            <p className="text-text-body">No data available</p>
          </div>
        </div>
      );
    }

    const proteinPercent = (totalProtein / total) * 100;
    const carbsPercent = (totalCarbs / total) * 100;
    const fatPercent = (totalFat / total) * 100;

    return (
      <div className="flex items-center space-x-6">
        {/* Pie Chart SVG */}
        <div className="relative w-32 h-32">
          <svg width="100%" height="100%" className="transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${proteinPercent * 2.51} 251`}
              className="text-red-500"
              strokeLinecap="round"
            />
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${carbsPercent * 2.51} 251`}
              strokeDashoffset={`-${proteinPercent * 2.51}`}
              className="text-blue-500"
              strokeLinecap="round"
            />
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${fatPercent * 2.51} 251`}
              strokeDashoffset={`-${(proteinPercent + carbsPercent) * 2.51}`}
              className="text-yellow-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-text-header">{total.toFixed(0)}g</div>
              <div className="text-xs text-text-body">Total</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-text-body">Protein: {proteinPercent.toFixed(0)}%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-text-body">Carbs: {carbsPercent.toFixed(0)}%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-text-body">Fat: {fatPercent.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    );
  };

  // Select appropriate chart type based on metric
  const renderChart = () => {
    switch (selectedMetric) {
      case 'weight':
        return renderBarChart(); // Sử dụng biểu đồ cột cho weight
      case 'calories':
        return renderBarChart();
      case 'macros':
        return selectedMacro === 'protein' && trends.period === 'week' ? renderPieChart() : renderAreaChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="bg-bg-card rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-1.5 bg-primary rounded-lg mr-2">
            <FaChartLine className="text-primary-contrast text-lg" />
          </div>
          <h2 className="text-lg font-semibold text-text-header">
            Trends & Analytics
          </h2>
        </div>
        
        {/* No period toggle - always using weekly data */}
        <div className="flex bg-bg-muted rounded-lg p-0.5">
          <div className="px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-contrast">
            Week
          </div>
        </div>
      </div>

      {/* Metric Selection - Made more compact */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {['calories', 'weight', 'macros'].map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric as 'calories' | 'weight' | 'macros')}
              className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMetric === metric
                  ? 'bg-primary text-primary-contrast'
                  : 'bg-bg-muted text-text-body hover:bg-bg-muted/80'
              }`}
            >
              <div className="flex items-center">
                {getMetricIcon(metric)}
                <span className="ml-1 capitalize">{metric}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Macro Selection - Made more compact */}
        {selectedMetric === 'macros' && (
          <div className="flex gap-1.5 mb-3">
            {['protein', 'carbohydrates', 'fat'].map(macro => (
              <button
                key={macro}
                onClick={() => setSelectedMacro(macro as 'protein' | 'carbohydrates' | 'fat')}
                className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedMacro === macro
                    ? 'bg-secondary text-secondary-contrast'
                    : 'bg-bg-muted text-text-body hover:bg-bg-muted/80'
                }`}
              >
                {getMetricIcon('macros')}
                <span className="ml-1 capitalize">{macro}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-header">
            {getMetricLabel(selectedMetric)}
          </h3>
          <div className="flex items-center text-xs text-text-body">
            <FaCalendar className="mr-1" />
            <span>Last week</span>
          </div>
        </div>
        
        <div className="bg-bg rounded-lg p-3">
          {renderChart()}
        </div>
      </div>

      {/* Summary Stats - More compact */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        <div className="text-center">
          <div className="text-base font-bold text-gray-900 dark:text-white">
            {getCurrentData().reduce((sum, point) => sum + point.value, 0).toFixed(0)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-purple-600 dark:text-purple-400">
            {(getCurrentData().reduce((sum, point) => sum + point.value, 0) / getCurrentData().length).toFixed(0)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Average</div>
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-orange-500">
            {Math.max(...getCurrentData().map(d => d.value)).toFixed(0)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Peak</div>
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-blue-500">
            {Math.min(...getCurrentData().map(d => d.value)).toFixed(0)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Low</div>
        </div>
      </div>
    </div>
  );
}
