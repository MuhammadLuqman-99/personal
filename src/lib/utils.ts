export function calculateProgress(currentPage: number | null, totalPages: number | null): number {
  if (!currentPage || !totalPages || totalPages === 0) return 0;
  return Math.min(Math.round((currentPage / totalPages) * 100), 100);
}

export function getYouTubeThumbnail(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return null;
}

export function getYouTubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

export function formatStatus(status: string): string {
  switch (status) {
    case 'want': return 'Want';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    default: return status;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'want': return 'bg-yellow-100 text-yellow-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Finance utils
export const CURRENCY_SYMBOL = 'RM';
export const DAILY_CALORIE_TARGET = 2000;

export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL} ${amount.toFixed(2)}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-MY', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'food': return 'bg-green-100 text-green-700';
    case 'transport': return 'bg-blue-100 text-blue-700';
    case 'shopping': return 'bg-pink-100 text-pink-700';
    case 'bills': return 'bg-orange-100 text-orange-700';
    case 'entertainment': return 'bg-purple-100 text-purple-700';
    case 'other': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'food': return 'Food';
    case 'transport': return 'Transport';
    case 'shopping': return 'Shopping';
    case 'bills': return 'Bills';
    case 'entertainment': return 'Entertainment';
    case 'other': return 'Other';
    default: return category;
  }
}

export function getMealTypeLabel(type: string): string {
  switch (type) {
    case 'breakfast': return 'Breakfast';
    case 'lunch': return 'Lunch';
    case 'dinner': return 'Dinner';
    case 'snack': return 'Snack';
    default: return type;
  }
}
