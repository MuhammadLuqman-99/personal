'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, ChevronLeft, ChevronRight, Loader2, UtensilsCrossed } from 'lucide-react';
import { FoodLog } from '@/lib/types';
import { formatDate, getTodayString } from '@/lib/utils';
import CalorieProgress from '@/components/food/CalorieProgress';
import MealSection from '@/components/food/MealSection';

interface FoodSummary {
  total_calories: number;
  target: number;
}

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function FoodPage() {
  const [date, setDate] = useState(getTodayString());
  const [foods, setFoods] = useState<FoodLog[]>([]);
  const [summary, setSummary] = useState<FoodSummary>({ total_calories: 0, target: 2000 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const [foodRes, sumRes] = await Promise.all([
        fetch(`/api/food?date=${d}`),
        fetch(`/api/food/summary?date=${d}`),
      ]);
      const foodData = await foodRes.json();
      const sumData = await sumRes.json();
      if (Array.isArray(foodData)) setFoods(foodData);
      if (sumData.total_calories !== undefined) setSummary(sumData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(date);
  }, [date, fetchData]);

  function changeDate(delta: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split('T')[0]);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return;
    try {
      await fetch(`/api/food/${id}`, { method: 'DELETE' });
      fetchData(date);
    } catch (err) {
      console.error(err);
    }
  }

  // Group by meal type
  const grouped = MEAL_ORDER.reduce<Record<string, FoodLog[]>>((acc, type) => {
    acc[type] = foods.filter((f) => f.meal_type === type);
    return acc;
  }, {});

  const isToday = date === getTodayString();

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Food Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your calories</p>
        </div>
        <Link
          href="/food/add"
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
        </Link>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-2.5">
        <button
          onClick={() => changeDate(-1)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            {isToday ? 'Today' : formatDate(date)}
          </p>
        </div>
        <button
          onClick={() => changeDate(1)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Calorie Progress */}
      <div className="mt-4">
        <CalorieProgress consumed={summary.total_calories} target={summary.target} />
      </div>

      {/* Meals */}
      <div className="mt-4 space-y-4 pb-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No food logged</p>
            <p className="text-gray-400 text-xs mt-1">Tap + to log a meal</p>
          </div>
        ) : (
          MEAL_ORDER.map((type) => (
            <MealSection
              key={type}
              mealType={type}
              items={grouped[type]}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
