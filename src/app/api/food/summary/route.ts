import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const CALORIE_TARGET = 2000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('date', date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalCalories = (data || []).reduce((sum, f) => sum + f.calories, 0);

  const byMeal: Record<string, number> = {};
  for (const f of data || []) {
    byMeal[f.meal_type] = (byMeal[f.meal_type] || 0) + f.calories;
  }

  const meals = Object.entries(byMeal).map(([meal_type, total]) => ({
    meal_type,
    total,
  }));

  return NextResponse.json({
    total_calories: totalCalories,
    target: CALORIE_TARGET,
    date,
    meals,
  });
}
