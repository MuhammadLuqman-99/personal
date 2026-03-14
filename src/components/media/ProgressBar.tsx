import { calculateProgress } from '@/lib/utils';

interface ProgressBarProps {
  currentPage: number | null;
  totalPages: number | null;
}

export default function ProgressBar({ currentPage, totalPages }: ProgressBarProps) {
  const progress = calculateProgress(currentPage, totalPages);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Page {currentPage || 0} of {totalPages || 0}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
