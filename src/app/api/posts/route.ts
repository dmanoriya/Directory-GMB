import { NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/wordpress';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const posts = await getBlogPosts();
    return NextResponse.json(posts, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('Error in /api/posts:', error);
    return NextResponse.json([], { status: 500 });
  }
}
