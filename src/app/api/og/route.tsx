import { NextRequest } from 'next/server';
import { generateOGImage } from '@/growth/OGTemplate';

export const runtime = 'edge'; // Runs fast on the edge

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // ?title=My Title
    const hasTitle = searchParams.has('title');
    const title = hasTitle
      ? searchParams.get('title')?.slice(0, 100) // Limit length
      : 'Study Smarter';

    return generateOGImage(title || 'Krama');
    
  } catch (e: any) {
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}