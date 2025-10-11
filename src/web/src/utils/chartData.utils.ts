import type { TrendPoint } from '../types/dashboard';

/**
 * Utility functions for chart data processing
 */

/**
 * Chuẩn hóa dữ liệu cho biểu đồ cột
 * @param data Dữ liệu xu hướng gốc
 * @returns Dữ liệu đã làm tròn thành số nguyên
 */
export function normalizeChartData(data: TrendPoint[]): TrendPoint[] {
  return data.map(point => ({
    ...point,
    value: Math.round(point.value), // Làm tròn giá trị thành số nguyên
    target: point.target ? Math.round(point.target) : undefined // Làm tròn target nếu tồn tại
  }));
}

/**
 * Tính giá trị lớn nhất cho trục Y
 * @param data Dữ liệu xu hướng
 * @returns Giá trị tối đa làm tròn
 */
export function calculateMaxValue(data: TrendPoint[]): number {
  const maxData = Math.max(...data.map(d => d.value));
  const maxTarget = Math.max(...data.map(d => d.target || 0));
  return Math.round(Math.max(maxData, maxTarget) * 1.1);
}

/**
 * Tính giá trị nhỏ nhất cho trục Y
 * @param data Dữ liệu xu hướng
 * @returns Giá trị tối thiểu làm tròn
 */
export function calculateMinValue(data: TrendPoint[]): number {
  const minData = Math.min(...data.map(d => d.value));
  const minTarget = Math.min(...data.map(d => d.target || 0));
  return Math.round(Math.min(minData, minTarget) * 0.9);
}

/**
 * Định dạng dữ liệu để sử dụng với recharts
 * @param data Dữ liệu xu hướng đã chuẩn hóa
 * @param period Giai đoạn 'week' hoặc 'month'
 * @returns Dữ liệu định dạng cho recharts
 */
export function formatChartData(data: TrendPoint[], period: 'week' | 'month' = 'week') {
  return data.map(point => ({
    name: formatDateLabel(point.date, period),
    value: Math.round(point.value),
    target: point.target ? Math.round(point.target) : undefined
  }));
}

/**
 * Định dạng nhãn ngày tháng cho trục X
 * @param date Ngày tháng
 * @param period Giai đoạn 'week' hoặc 'month'
 * @returns Chuỗi định dạng ngày tháng
 */
export function formatDateLabel(date: Date, period: 'week' | 'month'): string {
  if (period === 'week') {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Chuyển đổi mã màu dựa trên metric
 * @param metricColor Mã màu tailwind (dạng text-color-shade)
 * @returns Mã hex color
 */
export function getColorCode(metricColor: string): string {
  switch(metricColor) {
    case 'text-orange-500': return '#f97316'; 
    case 'text-purple-500': return '#a855f7'; 
    case 'text-red-500': return '#ef4444';    
    case 'text-blue-500': return '#3b82f6';   
    case 'text-yellow-500': return '#eab308'; 
    default: return '#82ca9d';                // default green
  }
}