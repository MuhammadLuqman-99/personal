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

  const items = data || [];
  const totalCalories = items.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = Math.round(items.reduce((sum, f) => sum + Number(f.protein || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(items.reduce((sum, f) => sum + Number(f.carbs || 0), 0) * 10) / 10;
  const totalFat = Math.round(items.reduce((sum, f) => sum + Number(f.fat || 0), 0) * 10) / 10;

  const byMeal: Record<string, number> = {};
  for (const f of items) {
    byMeal[f.meal_type] = (byMeal[f.meal_type] || 0) + f.calories;
  }

  const meals = Object.entries(byMeal).map(([meal_type, total]) => ({
    meal_type,
    total,
  }));

  return NextResponse.json({
    total_calories: totalCalories,
    total_protein: totalProtein,
    total_carbs: totalCarbs,
    total_fat: totalFat,
    target: CALORIE_TARGET,
    date,
    meals,
  });
}
