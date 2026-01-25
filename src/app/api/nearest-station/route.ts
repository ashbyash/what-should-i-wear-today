import { NextRequest, NextResponse } from 'next/server';
import { toTMCoordinate } from '@/lib/coordinates';
import { findNearestStation } from '@/lib/airkorea-api';

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
    const { tmX, tmY } = toTMCoordinate(parseFloat(lat), parseFloat(lon));
    const station = await findNearestStation(tmX, tmY, apiKey);

    return NextResponse.json({
      stationName: station.name,
      stationAddr: station.addr,
    });
  } catch (error) {
    console.error('Nearest station API error:', error);
    return NextResponse.json(
      { error: 'Failed to find nearest station' },
      { status: 500 }
    );
  }
}
