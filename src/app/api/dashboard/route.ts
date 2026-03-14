import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

function getDateRange(range: string, baseDate: string) {
  const base = new Date(baseDate + 'T12:00:00');
  const dateStr = base.toISOString().split('T')[0];

  if (range === 'weekly') {
    const weekStart = new Date(base);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];
    const label = `${weekStart.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}`;
    return { start: startStr, end: endStr, days: 7, label };
  }

  if (range === 'monthly') {
    const year = base.getFullYear();
    const month = base.getMonth();
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0);
    const end = lastDay.toISOString().split('T')[0];
    const daysInMonth = lastDay.getDate();
    const label = base.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
    return { start, end, days: daysInMonth, label };
  }

  // daily
  const label = base.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return { start: dateStr, end: dateStr, days: 1, label };
}

function getPreviousRange(range: string, baseDate: string) {
  const base = new Date(baseDate + 'T12:00:00');

  if (range === 'weekly') {
    const prevWeekEnd = new Date(base);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - prevWeekEnd.getDay() + 1 - 1); // day before this Monday
    const prevWeekStart = new Date(prevWeekEnd);
    prevWeekStart.setDate(prevWeekStart.getDate() - 6);
    return { start: prevWeekStart.toISOString().split('T')[0], end: prevWeekEnd.toISOString().split('T')[0], label: 'Prev Week' };
  }

  if (range === 'monthly') {
    const prevMonth = new Date(base.getFullYear(), base.getMonth() - 1, 1);
    const prevMonthEnd = new Date(base.getFullYear(), base.getMonth(), 0);
    return {
      start: `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}-01`,
      end: prevMonthEnd.toISOString().split('T')[0],
      label: prevMonth.toLocaleDateString('en-MY', { month: 'short' }),
    };
  }

  const yesterday = new Date(base);
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.toISOString().split('T')[0];
  return { start: y, end: y, label: 'Yesterday' };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'daily';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const current = getDateRange(range, date);
  const previous = getPreviousRange(range, date);

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
      date,
      rangeLabel: current.label,
      prevLabel: previous.label,
      media: { totalBooks, totalVideos, booksReading, booksCompleted, videosWatched, videosWatching },
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
