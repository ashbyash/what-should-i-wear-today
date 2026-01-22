import { NextRequest, NextResponse } from 'next/server';
import { fetchAirKorea } from '@/lib/airkorea-api';

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

  const apiKey = process.env.AIRKOREA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'AirKorea API key not configured' },
      { status: 500 }
    );
  }

  try {
    const airData = await fetchAirKorea(
      parseFloat(lat),
      parseFloat(lon),
      apiKey
    );

    return NextResponse.json(airData);
  } catch (error) {
    console.error('AirKorea API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air quality data' },
      { status: 500 }
    );
  }
}
