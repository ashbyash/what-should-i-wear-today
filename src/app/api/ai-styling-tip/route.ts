import { NextResponse } from 'next/server';
import { generateStylingTip } from '@/lib/ai-styling-tip';
import type { StylingTipInput } from '@/lib/prompts/styling-tip';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    const { categories, alerts, temperature, feelsLike, weatherMain, pm25 } = body;

    if (!categories || !Array.isArray(alerts) || typeof temperature !== 'number' || typeof feelsLike !== 'number' || !weatherMain || typeof pm25 !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const input: StylingTipInput = {
      categories,
      alerts,
      temperature,
      feelsLike,
      weatherMain,
      pm25,
    };

    const tip = await generateStylingTip(input);

    if (!tip) {
      return NextResponse.json(
        { error: 'Failed to generate styling tip' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tip });
  } catch (error) {
    console.error('[AI Styling Tip API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
