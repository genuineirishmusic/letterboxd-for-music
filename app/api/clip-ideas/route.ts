import { NextResponse } from 'next/server';
import { analyzeClipIdeas } from '@/lib/clip-finder/analyzer';
import type { ClipAnalysisRequest } from '@/lib/clip-finder/types';

export async function POST(request: Request) {
  const body = (await request.json()) as ClipAnalysisRequest;

  if (!body || typeof body.transcript !== 'string') {
    return NextResponse.json({ error: 'Transcript is required.' }, { status: 400 });
  }

  return NextResponse.json(analyzeClipIdeas(body));
}
