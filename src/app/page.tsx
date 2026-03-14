'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BookOpen, Eye, Wallet, UtensilsCrossed, TrendingUp, TrendingDown,
  Minus, ChevronRight, ChevronDown, ChevronLeft, Loader2, BookMarked, Video, X, Calendar,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import QuickActions from '@/components/dashboard/QuickActions';

type Range = 'daily' | 'weekly' | 'monthly';

interface DashboardData {
  range: string;
  rangeLabel: string;
  prevLabel: string;
  media: {
    totalBooks: number;
    totalVideos: number;
    booksReading: number;
    booksCompleted: number;
    videosWatched: number;
    videosWatching: number;
  };
  finance: {
    currentSpent: number;
    prevSpent: number;
    topCategory: { name: string; amount: number } | null;
  };
  food: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    foods: { name: string; calories: number; protein: number; carbs: number; fat: number; meal_type: string }[];
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

const ranges: { value: Range; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>('daily');
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMacroDetail, setShowMacroDetail] = useState(false);

  const fetchData = useCallback(async (r: Range, d: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?range=${r}&date=${d}`);
      const json = await res.json();
      if (json.media) setData(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range, selectedDate);
  }, [range, selectedDate, fetchData]);

  function navigateDate(delta: number) {
    const d = new Date(selectedDate + 'T12:00:00');
    if (range === 'daily') d.setDate(d.getDate() + delta);
    else if (range === 'weekly') d.setDate(d.getDate() + delta * 7);
    else d.setMonth(d.getMonth() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  }

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const isToday = selectedDate === getTodayStr();

  const spendDiff = data ? data.finance.currentSpent - data.finance.prevSpent : 0;

  return (
    <div className="px-4 pt-6 pb-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{greeting}</h1>
      </div>

      {/* Range Filter */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-3">
        {ranges.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              range === r.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-3 py-2.5 mb-4">
        <button
          onClick={() => navigateDate(-1)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar size={14} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-900">
              {data?.rangeLabel || selectedDate}
            </span>
          </button>
          {showDatePicker && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 bg-white rounded-xl border border-gray-200 shadow-lg p-3">
              <input
                type={range === 'monthly' ? 'month' : 'date'}
                value={range === 'monthly' ? selectedDate.slice(0, 7) : selectedDate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (range === 'monthly') {
                    setSelectedDate(val + '-01');
                  } else {
                    setSelectedDate(val);
                  }
                  setShowDatePicker(false);
                }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {!isToday && (
                <button
                  onClick={() => { setSelectedDate(getTodayStr()); setShowDatePicker(false); }}
                  className="mt-2 w-full py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100"
                >
                  Go to Today
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => navigateDate(1)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : data && (
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

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{data.rangeLabel}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {formatCurrency(data.finance.currentSpent)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Avg / day</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {formatCurrency(
                      range === 'daily'
                        ? data.finance.currentSpent
                        : range === 'weekly'
                        ? Math.round(data.finance.currentSpent / 7)
                        : Math.round(data.finance.currentSpent / new Date().getDate())
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-500">vs {data.prevLabel} ({formatCurrency(data.finance.prevSpent)})</span>
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

              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowMacroDetail(true); }}
                  className="bg-orange-50 rounded-lg p-3 text-left hover:bg-orange-100 transition-colors"
                >
                  <p className="text-xs text-gray-500">{data.rangeLabel}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {data.food.totalCalories.toLocaleString()} <span className="text-xs font-normal text-gray-400">kcal</span>
                  </p>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        data.food.totalCalories > data.food.target ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min((data.food.totalCalories / data.food.target) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[10px] text-gray-400">Target: {data.food.target.toLocaleString()}</p>
                    <ChevronDown size={10} className="text-gray-400" />
                  </div>
                </button>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Avg / day</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {data.food.avgDailyCalories.toLocaleString()} <span className="text-xs font-normal text-gray-400">kcal</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2.5">{data.rangeLabel}</p>
                </div>
              </div>

              {/* Macros summary */}
              {(data.food.totalProtein > 0 || data.food.totalCarbs > 0 || data.food.totalFat > 0) && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-blue-600 font-medium uppercase">Protein</p>
                    <p className="text-sm font-bold text-gray-900">{data.food.totalProtein}g</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-yellow-600 font-medium uppercase">Carbs</p>
                    <p className="text-sm font-bold text-gray-900">{data.food.totalCarbs}g</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-red-500 font-medium uppercase">Fat</p>
                    <p className="text-sm font-bold text-gray-900">{data.food.totalFat}g</p>
                  </div>
                </div>
              )}

              {/* Top foods */}
              {data.food.topFoods.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                    <Eye size={12} />
                    Most eaten ({data.rangeLabel.toLowerCase()})
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

      {/* Macro Detail Modal */}
      {showMacroDetail && data && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={() => setShowMacroDetail(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-2xl p-5 pb-8 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{data.rangeLabel}&apos;s Nutrition</h3>
              <button
                onClick={() => setShowMacroDetail(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 mb-4 text-center">
              <p className="text-3xl font-bold text-gray-900">
                {data.food.totalCalories.toLocaleString()}
                <span className="text-sm font-normal text-gray-400 ml-1">kcal</span>
              </p>
              <div className="mt-2 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    data.food.totalCalories > data.food.target ? 'bg-red-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min((data.food.totalCalories / data.food.target) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Target: {data.food.target.toLocaleString()} kcal</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {(() => {
                const total = data.food.totalProtein + data.food.totalCarbs + data.food.totalFat;
                const pPct = total > 0 ? Math.round((data.food.totalProtein / total) * 100) : 0;
                const cPct = total > 0 ? Math.round((data.food.totalCarbs / total) * 100) : 0;
                const fPct = total > 0 ? Math.round((data.food.totalFat / total) * 100) : 0;
                return (
                  <>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">{data.food.totalProtein}g</p>
                      <p className="text-[10px] text-gray-500 uppercase font-medium mt-0.5">Protein</p>
                      <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pPct}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{pPct}%</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-600">{data.food.totalCarbs}g</p>
                      <p className="text-[10px] text-gray-500 uppercase font-medium mt-0.5">Carbs</p>
                      <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${cPct}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{cPct}%</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-red-500">{data.food.totalFat}g</p>
                      <p className="text-[10px] text-gray-500 uppercase font-medium mt-0.5">Fat</p>
                      <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${fPct}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{fPct}%</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {data.food.foods.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Food log ({data.food.foods.length} items)
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.food.foods.map((food, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{food.name}</p>
                        <p className="text-[10px] text-gray-400 capitalize">{food.meal_type}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-orange-600">{food.calories} kcal</p>
                          <p className="text-[10px] text-gray-400">
                            P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.food.foods.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">No food logged</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
