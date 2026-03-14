import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

function getDateRange(range: string) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (range === 'weekly') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);
    return { start: weekAgo.toISOString().split('T')[0], end: today, days: 7, label: 'This Week' };
  }

  if (range === 'monthly') {
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return { start, end: today, days: now.getDate(), label: 'This Month' };
  }

  // daily (default)
  return { start: today, end: today, days: 1, label: 'Today' };
}

function getPreviousRange(range: string) {
  const now = new Date();

  if (range === 'weekly') {
    const prevEnd = new Date(now);
    prevEnd.setDate(prevEnd.getDate() - 7);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - 6);
    return { start: prevStart.toISOString().split('T')[0], end: prevEnd.toISOString().split('T')[0], label: 'Last Week' };
  }

  if (range === 'monthly') {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      start: `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-01`,
      end: lastMonthEnd.toISOString().split('T')[0],
      label: 'Last Month',
    };
  }

  // daily -> yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.toISOString().split('T')[0];
  return { start: y, end: y, label: 'Yesterday' };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'daily';

  const current = getDateRange(range);
  const previous = getPreviousRange(range);

  try {
    const [
      mediaRes,
      currentExpRes,
      prevExpRes,
      currentFoodRes,
    ] = await Promise.all([
      supabase.from('media_items').select('*'),
      supabase.from('expenses').select('*').gte('date', current.start).lte('date', current.end),
      supabase.from('expenses').select('*').gte('date', previous.start).lte('date', previous.end),
      supabase.from('food_logs').select('*').gte('date', current.start).lte('date', current.end),
    ]);

    // Media stats
    const media = mediaRes.data || [];
    const totalBooks = media.filter((m) => m.type === 'book').length;
    const totalVideos = media.filter((m) => m.type === 'video').length;
    const booksReading = media.filter((m) => m.type === 'book' && m.status === 'in_progress').length;
    const booksCompleted = media.filter((m) => m.type === 'book' && m.status === 'completed').length;
    const videosWatched = media.filter((m) => m.type === 'video' && m.status === 'completed').length;
    const videosWatching = media.filter((m) => m.type === 'video' && m.status === 'in_progress').length;

    // Expense stats
    const currentExpenses = currentExpRes.data || [];
    const prevExpenses = prevExpRes.data || [];

    const currentSpent = currentExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const prevSpent = prevExpenses.reduce((s, e) => s + Number(e.amount), 0);

    // Top spending category
    const catTotals: Record<string, number> = {};
    for (const e of currentExpenses) {
      catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount);
    }
    const topCategoryEntry = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0] || null;

    // Food stats
    const currentFood = currentFoodRes.data || [];

    const totalCalories = currentFood.reduce((s, f) => s + f.calories, 0);
    const totalProtein = currentFood.reduce((s, f) => s + Number(f.protein || 0), 0);
    const totalCarbs = currentFood.reduce((s, f) => s + Number(f.carbs || 0), 0);
    const totalFat = currentFood.reduce((s, f) => s + Number(f.fat || 0), 0);

    const avgDailyCalories = current.days > 0 ? Math.round(totalCalories / current.days) : 0;

    // Most eaten food
    const foodCounts: Record<string, { count: number; totalCal: number }> = {};
    for (const f of currentFood) {
      const name = f.meal_name;
      if (!foodCounts[name]) foodCounts[name] = { count: 0, totalCal: 0 };
      foodCounts[name].count += 1;
      foodCounts[name].totalCal += f.calories;
    }
    const topFoods = Object.entries(foodCounts)
      .map(([name, data]) => ({ name, count: data.count, avgCal: Math.round(data.totalCal / data.count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      range,
      rangeLabel: current.label,
      prevLabel: previous.label,
      media: {
        totalBooks,
        totalVideos,
        booksReading,
        booksCompleted,
        videosWatched,
        videosWatching,
      },
      finance: {
        currentSpent,
        prevSpent,
        topCategory: topCategoryEntry ? { name: topCategoryEntry[0], amount: topCategoryEntry[1] } : null,
      },
      food: {
        totalCalories,
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        foods: currentFood.map((f) => ({
          name: f.meal_name,
          calories: f.calories,
          protein: Number(f.protein || 0),
          carbs: Number(f.carbs || 0),
          fat: Number(f.fat || 0),
          meal_type: f.meal_type,
        })),
        avgDailyCalories,
        topFoods,
        target: range === 'daily' ? 2000 : range === 'weekly' ? 14000 : 60000,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
