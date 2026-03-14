'use client';

import { DAILY_CALORIE_TARGET } from '@/lib/utils';

interface CalorieProgressProps {
  consumed: number;
  target?: number;
}

export default function CalorieProgress({ consumed, target = DAILY_CALORIE_TARGET }: CalorieProgressProps) {
  const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const overTarget = consumed > target;
  const nearTarget = percentage >= 80 && !overTarget;

  const barColor = overTarget
    ? 'bg-red-500'
    : nearTarget
    ? 'bg-yellow-500'
    : 'bg-green-500';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Calories Today</p>
          <p className="text-3xl font-bold text-gray-900">{consumed.toLocaleString()}</p>
        </div>
        <p className="text-sm text-gray-500">/ {target.toLocaleString()} kcal</p>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {overTarget && (
        <p className="text-xs text-red-500 mt-1.5 font-medium">
          Over target by {(consumed - target).toLocaleString()} kcal
        </p>
      )}
    </div>
  );
}
