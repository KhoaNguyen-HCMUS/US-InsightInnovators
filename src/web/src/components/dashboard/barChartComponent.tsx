import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { formatDate } from '../../utils/dateUtils';
import type { TrendPoint } from '../../types/dashboard';

interface BarChartComponentProps {
  data: TrendPoint[];
  metricColor: string;
  minValue: number;
  maxValue: number;
  period: 'week' | 'month';
}

export default function BarChartComponent({ 
  data, 
  metricColor, 
  minValue, 
  maxValue,
  period 
}: BarChartComponentProps) {
  const chartData = data.map(point => ({
    name: formatDate(point.date, period),
    value: Math.round(point.value), 
    target: point.target ? Math.round(point.target) : undefined
  }));
  const getColorCode = () => {
    switch(metricColor) {
      case 'text-orange-500': return '#f97316'; 
      case 'text-purple-500': return '#a855f7'; 
      case 'text-red-500': return '#ef4444';    
      case 'text-blue-500': return '#3b82f6';   
      case 'text-yellow-500': return '#eab308'; 
      default: return '#82ca9d';                // default green
    }
  };

  return (
    <div className="w-full h-64 bg-bg-card rounded-lg p-4">
      <BarChart 
        width={500} 
        height={220} 
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        style={{ margin: '0 auto' }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          fontSize={12} 
          tick={{ fill: 'var(--text-body)' }}
        />
        <YAxis 
          fontSize={12}
          tick={{ fill: 'var(--text-body)' }}
          domain={[minValue * 0.9, maxValue * 1.1]}
		 tickFormatter={(v) =>
			new Intl.NumberFormat("en-US", {
			maximumFractionDigits: 0,
			minimumFractionDigits: 0,
			}).format(v)
		}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-color)',
            borderRadius: '0.375rem'
          }}
          labelStyle={{ color: 'var(--text-header)' }}
          itemStyle={{ color: 'var(--text-body)' }}
          formatter={(value) => Math.round(Number(value)).toString()} 
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar 
          dataKey="value" 
          fill={getColorCode()} 
          radius={[4, 4, 0, 0]} 
          name="Value"
        />
        
        {data[0]?.target && (
          <ReferenceLine 
            y={Math.round(data[0].target)} 
            label="Target" 
            stroke="#ff7300" 
            strokeDasharray="3 3"
          />
        )}
      </BarChart>
    </div>
  );
}