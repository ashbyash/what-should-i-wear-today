import { NextRequest, NextResponse } from 'next/server';
import { fetchUVIndex } from '@/lib/kma-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'lat and lon parameters are required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.KMA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'KMA API key not configured' },
      { status: 500 }
    );
  }

  try {
    const uvData = await fetchUVIndex(
      parseFloat(lat),
      parseFloat(lon),
      apiKey
    );

    return NextResponse.json(uvData);
  } catch (error) {
    console.error('UV Index API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch UV index data' },
      { status: 500 }
    );
  }
}
