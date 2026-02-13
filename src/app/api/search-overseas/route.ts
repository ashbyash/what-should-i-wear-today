import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const OpenMeteoResultSchema = z.object({
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string(),
  country_code: z.string(),
  admin1: z.string().optional(),
});

const OpenMeteoResponseSchema = z.object({
  results: z.array(OpenMeteoResultSchema).optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'query parameter must be at least 2 characters' },
      { status: 400 }
    );
  }

  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', query);
    url.searchParams.set('count', '5');
    url.searchParams.set('language', 'ko');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Open-Meteo Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    const validated = OpenMeteoResponseSchema.parse(data);

    return NextResponse.json(validated, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Open-Meteo search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search overseas locations' },
      { status: 500 }
    );
  }
}
