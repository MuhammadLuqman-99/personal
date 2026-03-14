'use client';

import { FoodLog } from '@/lib/types';
import { getMealTypeLabel } from '@/lib/utils';
import FoodCard from './FoodCard';

const mealEmojis: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍿',
};

interface MealSectionProps {
  mealType: string;
  items: FoodLog[];
  onDelete?: (id: string) => void;
}

export default function MealSection({ mealType, items, onDelete }: MealSectionProps) {
  if (items.length === 0) return null;

  const totalCal = items.reduce((sum, f) => sum + f.calories, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">
          {mealEmojis[mealType] || '🍽️'} {getMealTypeLabel(mealType)}
        </p>
        <span className="text-xs text-gray-500">{totalCal} kcal</span>
      </div>
      <div className="space-y-2">
        {items.map((food) => (
          <FoodCard key={food.id} food={food} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
