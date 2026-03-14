'use client';

import { getCategoryColor, getCategoryLabel, formatCurrency } from '@/lib/utils';

interface CategorySummary {
  category: string;
  total: number;
}

interface ExpenseSummaryProps {
  data: CategorySummary[];
  total: number;
}

export default function ExpenseSummary({ data, total }: ExpenseSummaryProps) {
  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Spending Breakdown</h3>
      <div className="space-y-3">
        {data.map((item) => {
          const percentage = total > 0 ? (item.total / total) * 100 : 0;
          const colorClass = getCategoryColor(item.category);
          const bgColor = colorClass.split(' ')[0];
          return (
            <div key={item.category}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">{getCategoryLabel(item.category)}</span>
                <span className="font-medium text-gray-900">{formatCurrency(item.total)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${bgColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
