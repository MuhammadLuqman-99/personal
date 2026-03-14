'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Loader2, Wallet } from 'lucide-react';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import ExpenseCard from '@/components/finance/ExpenseCard';
import ExpenseSummary from '@/components/finance/ExpenseSummary';
import DateRangeToggle from '@/components/finance/DateRangeToggle';

interface Summary {
  total: number;
  by_category: { category: string; total: number }[];
}

export default function FinancePage() {
  const [period, setPeriod] = useState('today');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, by_category: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const [expRes, sumRes] = await Promise.all([
        fetch(`/api/expenses?${p === 'today' ? `date=${new Date().toISOString().split('T')[0]}` : `from=${getFromDate(p)}&to=${new Date().toISOString().split('T')[0]}`}`),
        fetch(`/api/expenses/summary?period=${p}`),
      ]);
      const expData = await expRes.json();
      const sumData = await sumRes.json();
      if (Array.isArray(expData)) setExpenses(expData);
      if (sumData.total !== undefined) setSummary(sumData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return;
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      fetchData(period);
    } catch (err) {
      console.error(err);
    }
  }

  // Group expenses by date
  const grouped = expenses.reduce<Record<string, Expense[]>>((acc, exp) => {
    const key = exp.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(exp);
    return acc;
  }, {});

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Finance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your spending</p>
        </div>
        <Link
          href="/finance/add"
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
        </Link>
      </div>

      <DateRangeToggle value={period} onChange={setPeriod} />

      {/* Total */}
      <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Spent</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          {formatCurrency(summary.total)}
        </p>
      </div>

      {/* Summary */}
      <div className="mt-4">
        <ExpenseSummary data={summary.by_category} total={summary.total} />
      </div>

      {/* Expense List */}
      <div className="mt-4 space-y-4 pb-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <Wallet size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No expenses yet</p>
            <p className="text-gray-400 text-xs mt-1">Tap + to add one</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-medium text-gray-500 mb-2">{formatDate(date)}</p>
              <div className="space-y-2">
                {items.map((exp) => (
                  <ExpenseCard key={exp.id} expense={exp} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getFromDate(period: string): string {
  const now = new Date();
  switch (period) {
    case 'week': {
      const d = new Date(now);
      d.setDate(now.getDate() - now.getDay());
      return d.toISOString().split('T')[0];
    }
    case 'month':
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    default:
      return now.toISOString().split('T')[0];
  }
}
