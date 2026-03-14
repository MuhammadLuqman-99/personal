import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

function getAuth() {
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';
  // Handle both escaped \n and real newlines
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  // Remove surrounding quotes if present
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1).replace(/\\n/g, '\n');
  }

  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    private_key: privateKey,
  };

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files allowed' }, { status: 400 });
    }

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 });
    }

    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    // Convert file to buffer then stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // Upload to Google Drive
    const driveFile = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: 'application/pdf',
      },
      media: {
        mimeType: 'application/pdf',
        body: stream,
      },
      fields: 'id,name,webViewLink',
    });

    const fileId = driveFile.data.id;

    // Make publicly readable
    await drive.permissions.create({
      fileId: fileId!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const viewUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    return NextResponse.json({
      url: viewUrl,
      name: driveFile.data.name,
      fileId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Drive upload error:', message);
    return NextResponse.json({ error: 'Upload failed', detail: message }, { status: 500 });
  }
}
