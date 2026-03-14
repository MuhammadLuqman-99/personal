import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // Last month
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStart = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-01`;
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthEndStr = lastMonthEnd.toISOString().split('T')[0];

  try {
    const [
      mediaRes,
      todayExpRes,
      thisMonthExpRes,
      lastMonthExpRes,
      todayFoodRes,
      thisMonthFoodRes,
    ] = await Promise.all([
      // All media items
      supabase.from('media_items').select('*'),
      // Today expenses
      supabase.from('expenses').select('*').eq('date', today),
      // This month expenses
      supabase.from('expenses').select('*').gte('date', thisMonthStart).lte('date', today),
      // Last month expenses
      supabase.from('expenses').select('*').gte('date', lastMonthStart).lte('date', lastMonthEndStr),
      // Today food
      supabase.from('food_logs').select('*').eq('date', today),
      // This month food
      supabase.from('food_logs').select('*').gte('date', thisMonthStart).lte('date', today),
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
    const todayExpenses = todayExpRes.data || [];
    const thisMonthExpenses = thisMonthExpRes.data || [];
    const lastMonthExpenses = lastMonthExpRes.data || [];

    const todaySpent = todayExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const thisMonthSpent = thisMonthExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const lastMonthSpent = lastMonthExpenses.reduce((s, e) => s + Number(e.amount), 0);

    // Top spending category this month
    const catTotals: Record<string, number> = {};
    for (const e of thisMonthExpenses) {
      catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount);
    }
    const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0] || null;

    // Food stats
    const todayFood = todayFoodRes.data || [];
    const thisMonthFood = thisMonthFoodRes.data || [];

    const todayCalories = todayFood.reduce((s, f) => s + f.calories, 0);

    // Most eaten food this month
    const foodCounts: Record<string, { count: number; totalCal: number }> = {};
    for (const f of thisMonthFood) {
      const name = f.meal_name;
      if (!foodCounts[name]) foodCounts[name] = { count: 0, totalCal: 0 };
      foodCounts[name].count += 1;
      foodCounts[name].totalCal += f.calories;
    }
    const topFoods = Object.entries(foodCounts)
      .map(([name, data]) => ({ name, count: data.count, avgCal: Math.round(data.totalCal / data.count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Avg daily calories this month
    const daysInMonth = now.getDate();
    const avgDailyCalories = daysInMonth > 0 ? Math.round(thisMonthFood.reduce((s, f) => s + f.calories, 0) / daysInMonth) : 0;

    return NextResponse.json({
      media: {
        totalBooks,
        totalVideos,
        booksReading,
        booksCompleted,
        videosWatched,
        videosWatching,
      },
      finance: {
        todaySpent,
        thisMonthSpent,
        lastMonthSpent,
        topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      },
      food: {
        todayCalories,
        avgDailyCalories,
        topFoods,
        target: 2000,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
