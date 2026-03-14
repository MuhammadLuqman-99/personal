import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const type = searchParams.get('type');
  const status = searchParams.get('status');

  let query = supabase
    .from('media_items')
    .select('*')
    .order('updated_at', { ascending: false });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (type) {
    query = query.eq('type', type);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.title || !body.type) {
    return NextResponse.json(
      { error: 'Title and type are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('media_items')
    .insert({
      type: body.type,
      title: body.title,
      status: body.status || 'want',
      current_page: body.current_page || null,
      total_pages: body.total_pages || null,
      pdf_url: body.pdf_url || null,
      video_url: body.video_url || null,
      notes: body.notes || null,
      cover_image_url: body.cover_image_url || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
