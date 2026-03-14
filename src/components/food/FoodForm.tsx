'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { MealType } from '@/lib/types';
import { getTodayString } from '@/lib/utils';

interface FoodResult {
  name: string;
  brand: string;
  calories_per_100g: number;
  calories_per_serving: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: string;
  image: string;
}

const mealTypes: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍿' },
];

export default function FoodForm() {
  const router = useRouter();
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [date, setDate] = useState(getTodayString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/food/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setSearchResults(data);
          setShowResults(true);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close results on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectFood(food: FoodResult) {
    const name = food.brand ? `${food.name} (${food.brand})` : food.name;
    setSearchQuery(name);
    setMealName(name);

    const cal = food.calories_per_serving || food.calories_per_100g;
    if (cal > 0) setCalories(cal.toString());
    if (food.protein > 0) setProtein(food.protein.toString());
    if (food.carbs > 0) setCarbs(food.carbs.toString());
    if (food.fat > 0) setFat(food.fat.toString());

    setShowResults(false);
  }

  function clearSearch() {
    setSearchQuery('');
    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setSearchResults([]);
    setShowResults(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalName = searchQuery.trim();
    if (!finalName) {
      setError('Enter a meal name');
      return;
    }
    if (!calories || parseInt(calories) <= 0) {
      setError('Enter valid calories');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_name: finalName,
          calories: parseInt(calories),
          protein: protein ? parseFloat(protein) : 0,
          carbs: carbs ? parseFloat(carbs) : 0,
          fat: fat ? parseFloat(fat) : 0,
          meal_type: mealType,
          date,
        }),
      });

      if (res.ok) {
        router.push('/food');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Meal Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
        <div className="grid grid-cols-4 gap-2">
          {mealTypes.map((mt) => (
            <button
              key={mt.value}
              type="button"
              onClick={() => setMealType(mt.value)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-colors ${
                mealType === mt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span className="text-lg">{mt.emoji}</span>
              {mt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Food Search & Meal Name */}
      <div className="relative" ref={resultsRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meal Name {mealName && <span className="text-green-600 text-xs">(from search)</span>}
        </label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              setMealName(val);
            }}
            onFocus={() => {
              if (searchResults.length > 0) setShowResults(true);
            }}
            placeholder="Search or type food name..."
            className={`${inputClass} pl-9 ${searchQuery ? 'pr-9' : ''}`}
            required
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
          {searching && (
            <Loader2 size={16} className="absolute right-9 top-1/2 -translate-y-1/2 animate-spin text-blue-500" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg max-h-72 overflow-y-auto">
            {searchResults.map((food, i) => {
              const cal = food.calories_per_serving || food.calories_per_100g;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectFood(food)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-lg">
                    🍽️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{food.name}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium text-orange-600">{cal} kcal</span>
                      <span className="text-[10px] text-gray-400">
                        P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {showResults && searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500">No results found</p>
            <p className="text-xs text-gray-400 mt-1">You can still type the name manually below</p>
          </div>
        )}
      </div>

      {/* Calories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Calories (kcal) {mealName && <span className="text-green-600 text-xs">(auto-filled)</span>}
        </label>
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="0"
          min="0"
          className={`${inputClass} text-xl font-bold text-center`}
          required
        />
      </div>

      {/* Macros */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Macros (per serving) {mealName && <span className="text-green-600 text-xs">(auto-filled)</span>}
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wide mb-1">Protein</p>
            <div className="flex items-baseline gap-0.5">
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full bg-transparent text-lg font-bold text-gray-900 focus:outline-none"
              />
              <span className="text-xs text-gray-400">g</span>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3">
            <p className="text-[10px] font-medium text-yellow-600 uppercase tracking-wide mb-1">Carbs</p>
            <div className="flex items-baseline gap-0.5">
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full bg-transparent text-lg font-bold text-gray-900 focus:outline-none"
              />
              <span className="text-xs text-gray-400">g</span>
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-3">
            <p className="text-[10px] font-medium text-red-500 uppercase tracking-wide mb-1">Fat</p>
            <div className="flex items-baseline gap-0.5">
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full bg-transparent text-lg font-bold text-gray-900 focus:outline-none"
              />
              <span className="text-xs text-gray-400">g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Log Food
      </button>
    </form>
  );
}
