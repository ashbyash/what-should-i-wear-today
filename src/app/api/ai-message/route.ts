import { NextResponse } from 'next/server';
import { generateScoreMessage } from '@/lib/ai-message';
import { rateLimit } from '@/lib/rate-limit';
import type { ScoreMessageInput } from '@/lib/prompts/score-message';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const rl = rateLimit(ip, { limit: 5, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const body = await request.json();

    // 필수 필드 검증
    const { score, temperature, feelsLike, weatherMain, pm25, humidity, windSpeed, uvIndex } = body;

    if (!score || typeof temperature !== 'number' || typeof feelsLike !== 'number' || !weatherMain || typeof pm25 !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const input: ScoreMessageInput = {
      total: score.total,
      level: score.level,
      breakdown: score.breakdown,
      temperature,
      feelsLike,
      weatherMain,
      pm25,
      humidity,
      windSpeed,
      uvIndex,
    };

    const message = await generateScoreMessage(input);

    if (!message) {
      return NextResponse.json(
        { error: 'Failed to generate message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('[AI Message API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
