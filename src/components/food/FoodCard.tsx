'use client';

import { Trash2 } from 'lucide-react';
import { FoodLog } from '@/lib/types';
import { getMealTypeLabel } from '@/lib/utils';

interface FoodCardProps {
  food: FoodLog;
  onDelete?: (id: string) => void;
}

const mealEmojis: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍿',
};

export default function FoodCard({ food, onDelete }: FoodCardProps) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-lg">
        {mealEmojis[food.meal_type] || '🍽️'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{food.meal_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{getMealTypeLabel(food.meal_type)}</span>
          {(food.protein > 0 || food.carbs > 0 || food.fat > 0) && (
            <span className="text-[10px] text-gray-400">
              P:{food.protein}g C:{food.carbs}g F:{food.fat}g
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-orange-600">{food.calories} kcal</span>
        {onDelete && (
          <button
            onClick={() => onDelete(food.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
