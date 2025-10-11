export function formatDate(date: Date, format: 'week' | 'month' = 'week'): string {
  if (format === 'week') {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}