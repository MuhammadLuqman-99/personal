import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from('media_items')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const { data, error } = await supabase
    .from('media_items')
    .update(body)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // First get the item to check for PDF
  const { data: item } = await supabase
    .from('media_items')
    .select('pdf_url')
    .eq('id', params.id)
    .single();

  // Delete PDF from storage if it exists and is in our bucket
  if (item?.pdf_url && item.pdf_url.includes('supabase')) {
    const path = item.pdf_url.split('/pdfs/').pop();
    if (path) {
      await supabase.storage.from('pdfs').remove([path]);
    }
  }

  const { error } = await supabase
    .from('media_items')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
