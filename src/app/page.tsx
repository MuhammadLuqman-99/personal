'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen, Eye, Wallet, UtensilsCrossed, TrendingUp, TrendingDown,
  Minus, ChevronRight, Loader2, BookMarked, Video,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import QuickActions from '@/components/dashboard/QuickActions';

interface DashboardData {
  media: {
    totalBooks: number;
    totalVideos: number;
    booksReading: number;
    booksCompleted: number;
    videosWatched: number;
    videosWatching: number;
  };
  finance: {
    todaySpent: number;
    thisMonthSpent: number;
    lastMonthSpent: number;
    topCategory: { name: string; amount: number } | null;
  };
  food: {
    todayCalories: number;
    avgDailyCalories: number;
    topFoods: { name: string; count: number; avgCal: number }[];
    target: number;
  };
}

const categoryLabels: Record<string, string> = {
  food: 'Food',
  transport: 'Transport',
  shopping: 'Shopping',
  bills: 'Bills',
  entertainment: 'Entertainment',
  other: 'Other',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => { if (d.media) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  const spendDiff = data
    ? data.finance.thisMonthSpent - data.finance.lastMonthSpent
    : 0;

  return (
    <div className="px-4 pt-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{greeting}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {now.toLocaleDateString('en-MY', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {data && (
        <>
          {/* ===== MEDIA SECTION ===== */}
          <Link href="/media" className="block mt-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <BookOpen size={16} className="text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Library</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Books */}
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookMarked size={14} className="text-purple-500" />
                    <span className="text-xs font-medium text-purple-700">Books</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.media.totalBooks}</p>
                  <div className="mt-1.5 space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Reading</span>
                      <span className="font-medium text-blue-600">{data.media.booksReading}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Completed</span>
                      <span className="font-medium text-green-600">{data.media.booksCompleted}</span>
                    </div>
                  </div>
                </div>

                {/* Videos */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Video size={14} className="text-blue-500" />
                    <span className="text-xs font-medium text-blue-700">Videos</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.media.totalVideos}</p>
                  <div className="mt-1.5 space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Watching</span>
                      <span className="font-medium text-blue-600">{data.media.videosWatching}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Watched</span>
                      <span className="font-medium text-green-600">{data.media.videosWatched}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* ===== FINANCE SECTION ===== */}
          <Link href="/finance" className="block mt-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Wallet size={16} className="text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Finance</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>

              {/* Today & This Month */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Today</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {formatCurrency(data.finance.todaySpent)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">This Month</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {formatCurrency(data.finance.thisMonthSpent)}
                  </p>
                </div>
              </div>

              {/* Last Month Comparison */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-500">vs Last Month ({formatCurrency(data.finance.lastMonthSpent)})</span>
                <div className="flex items-center gap-1">
                  {spendDiff > 0 ? (
                    <TrendingUp size={14} className="text-red-500" />
                  ) : spendDiff < 0 ? (
                    <TrendingDown size={14} className="text-green-500" />
                  ) : (
                    <Minus size={14} className="text-gray-400" />
                  )}
                  <span className={`text-xs font-medium ${spendDiff > 0 ? 'text-red-500' : spendDiff < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                    {spendDiff === 0 ? 'Same' : `${spendDiff > 0 ? '+' : ''}${formatCurrency(spendDiff)}`}
                  </span>
                </div>
              </div>

              {/* Top category */}
              {data.finance.topCategory && (
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Most spent on</span>
                  <span className="font-medium text-gray-700">
                    {categoryLabels[data.finance.topCategory.name] || data.finance.topCategory.name} — {formatCurrency(data.finance.topCategory.amount)}
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* ===== FOOD SECTION ===== */}
          <Link href="/food" className="block mt-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <UtensilsCrossed size={16} className="text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Food & Calories</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>

              {/* Calories today */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Today</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {data.food.todayCalories.toLocaleString()} <span className="text-xs font-normal text-gray-400">kcal</span>
                  </p>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        data.food.todayCalories > data.food.target ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min((data.food.todayCalories / data.food.target) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">Target: {data.food.target.toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Daily Average</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {data.food.avgDailyCalories.toLocaleString()} <span className="text-xs font-normal text-gray-400">kcal</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2.5">This month</p>
                </div>
              </div>

              {/* Top foods */}
              {data.food.topFoods.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                    <Eye size={12} />
                    Most eaten this month
                  </p>
                  <div className="space-y-1.5">
                    {data.food.topFoods.slice(0, 3).map((food, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                          <span className="text-xs font-medium text-gray-700 truncate max-w-[160px]">{food.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">{food.avgCal} kcal</span>
                          <span className="text-xs font-semibold text-orange-600">{food.count}x</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Link>
        </>
      )}
    </div>
  );
}
