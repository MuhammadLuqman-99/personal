import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'today';

  const now = new Date();
  let from: string;
  const to: string = now.toISOString().split('T')[0];

  switch (period) {
    case 'week': {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      from = weekStart.toISOString().split('T')[0];
      break;
    }
    case 'month': {
      from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      break;
    }
    default: // today
      from = to;
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', from)
    .lte('date', to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = (data || []).reduce((sum, e) => sum + Number(e.amount), 0);

  const byCategory: Record<string, number> = {};
  for (const e of data || []) {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
  }

  const categorySummary = Object.entries(byCategory).map(([category, amount]) => ({
    category,
    total: amount,
  })).sort((a, b) => b.total - a.total);

  return NextResponse.json({ total, by_category: categorySummary, period, from, to });
}
