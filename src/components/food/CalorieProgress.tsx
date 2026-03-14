'use client';

import { DAILY_CALORIE_TARGET } from '@/lib/utils';

interface CalorieProgressProps {
  consumed: number;
  target?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export default function CalorieProgress({
  consumed,
  target = DAILY_CALORIE_TARGET,
  protein = 0,
  carbs = 0,
  fat = 0,
}: CalorieProgressProps) {
  const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const overTarget = consumed > target;
  const nearTarget = percentage >= 80 && !overTarget;

  const barColor = overTarget
    ? 'bg-red-500'
    : nearTarget
    ? 'bg-yellow-500'
    : 'bg-green-500';

  const hasMacros = protein > 0 || carbs > 0 || fat > 0;
  const totalMacroGrams = protein + carbs + fat;

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

      {/* Macros */}
      {hasMacros && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MacroBar label="Protein" value={protein} total={totalMacroGrams} color="bg-blue-500" textColor="text-blue-600" />
          <MacroBar label="Carbs" value={carbs} total={totalMacroGrams} color="bg-yellow-500" textColor="text-yellow-600" />
          <MacroBar label="Fat" value={fat} total={totalMacroGrams} color="bg-red-400" textColor="text-red-500" />
        </div>
      )}
    </div>
  );
}

function MacroBar({ label, value, total, color, textColor }: {
  label: string;
  value: number;
  total: number;
  color: string;
  textColor: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${textColor}`}>{value}g</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-0.5">{pct}%</p>
    </div>
  );
}
