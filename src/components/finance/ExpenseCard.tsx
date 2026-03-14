'use client';

import { Utensils, Car, ShoppingBag, Receipt, Gamepad2, MoreHorizontal, Trash2 } from 'lucide-react';
import { Expense } from '@/lib/types';
import { formatCurrency, getCategoryColor, getCategoryLabel } from '@/lib/utils';

const categoryIcons: Record<string, typeof Utensils> = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  bills: Receipt,
  entertainment: Gamepad2,
  other: MoreHorizontal,
};

interface ExpenseCardProps {
  expense: Expense;
  onDelete?: (id: string) => void;
}

export default function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  const Icon = categoryIcons[expense.category] || MoreHorizontal;
  const colorClass = getCategoryColor(expense.category);

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {expense.note || getCategoryLabel(expense.category)}
        </p>
        <p className="text-xs text-gray-500">{getCategoryLabel(expense.category)}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900">
          {formatCurrency(Number(expense.amount))}
        </span>
        {onDelete && (
          <button
            onClick={() => onDelete(expense.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
