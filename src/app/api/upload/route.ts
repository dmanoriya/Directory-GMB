import { NextResponse } from 'next/server';
import { getWpApiUrl } from '@/lib/wordpress';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userEmail = (formData.get('userEmail') as string) || 'guest@locable.com';
    const imageType = (formData.get('imageType') as string) || 'general'; // 'cover' | 'thumbnail'

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    // Validate mime type & file size on server
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds maximum 10MB limit.' }, { status: 400 });
    }

    const apiUrl = getWpApiUrl();
    if (apiUrl) {
      try {
        const wpFormData = new FormData();
        wpFormData.append('file', file, file.name);
        wpFormData.append('userEmail', userEmail);
        wpFormData.append('imageType', imageType);

        const wpRes = await fetch(`${apiUrl}/wp-json/locable/v1/upload-media`, {
          method: 'POST',
          headers: {
            'User-Agent': 'LocableNextJS/1.0',
          },
          body: wpFormData,
        });

        if (wpRes.ok) {
          const data = await wpRes.json();
          return NextResponse.json({
            success: true,
            url: data.url,
            attachmentId: data.attachment_id,
            file: data.file,
          });
        }
      } catch (e) {
        console.error('[Upload API] WordPress media upload error:', e);
      }
    }

    // Fallback: create base64 preview or mock URL if local WP is un-reachable
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      url: base64Data,
      attachmentId: 'att_' + Date.now(),
      file: file.name,
    });
  } catch (err) {
    console.error('[Upload API] Internal error:', err);
    return NextResponse.json({ error: 'Image upload failed.' }, { status: 500 });
  }
}
