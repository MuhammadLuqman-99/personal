import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
  }

  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const { error } = await supabase.storage
    .from('pdfs')
    .upload(fileName, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from('pdfs')
    .getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl });
}
