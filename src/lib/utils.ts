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
