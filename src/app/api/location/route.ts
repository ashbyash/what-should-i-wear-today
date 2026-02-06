import { NextRequest, NextResponse } from 'next/server';
import { fetchLocation } from '@/lib/kakao-api';
import { isKoreaCoordinates, CITIES } from '@/lib/cities';

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

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  // 해외 좌표 → CITIES에서 가장 가까운 도시 정보 반환
  if (!isKoreaCoordinates(latNum, lonNum)) {
    const overseasCity = CITIES.find(
      (c) => c.isOverseas && Math.abs(c.lat - latNum) < 0.5 && Math.abs(c.lon - lonNum) < 0.5
    );

    return NextResponse.json({
      address: overseasCity ? `${overseasCity.name}, ${overseasCity.country}` : '해외',
      region1: overseasCity?.country ?? '',
      region2: overseasCity?.name ?? '',
      region3: '',
    }, {
      headers: { 'Cache-Control': 'public, max-age=600' },
    });
  }

  // 한국 좌표 → 기존 Kakao API
  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Kakao API key not configured' },
      { status: 500 }
    );
  }

  try {
    const data = await fetchLocation(latNum, lonNum, apiKey);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=600' },
    });
  } catch (error) {
    console.error('Location API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 500 }
    );
  }
}
