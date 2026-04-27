import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Недопустимый формат. Используйте JPG, PNG или WebP.' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Файл слишком большой. Максимум 5 МБ.' }, { status: 400 });
  }

  const ext = EXTENSION_MAP[file.type] || 'jpg';
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const bucketName = process.env.GCS_BUCKET_NAME;

  if (bucketName) {
    // Production: upload to Google Cloud Storage
    const { Storage } = await import('@google-cloud/storage');
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(`uploads/${filename}`);

    await blob.save(buffer, {
      contentType: file.type,
      metadata: { cacheControl: 'public, max-age=31536000' },
    });

    const url = `https://storage.googleapis.com/${bucketName}/uploads/${filename}`;
    return NextResponse.json({ url });
  }

  // Local dev: save to public/uploads/
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
