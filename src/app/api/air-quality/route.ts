import { NextRequest, NextResponse } from 'next/server';
import { fetchAirQuality, parseAirQualityData } from '@/lib/weather';

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

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const rawData = await fetchAirQuality(
      { lat: parseFloat(lat), lon: parseFloat(lon) },
      apiKey
    );
    const airQualityData = parseAirQualityData(rawData);

    return NextResponse.json(airQualityData);
  } catch (error) {
    console.error('Air Quality API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air quality data' },
      { status: 500 }
    );
  }
}
