import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  let query = supabase
    .from('food_logs')
    .select('*')
    .order('created_at', { ascending: true });

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.meal_name || !body.calories || !body.meal_type) {
    return NextResponse.json(
      { error: 'Meal name, calories, and meal type are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('food_logs')
    .insert({
      meal_name: body.meal_name,
      calories: body.calories,
      meal_type: body.meal_type,
      date: body.date || new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
