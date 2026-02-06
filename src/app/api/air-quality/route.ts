import { NextRequest, NextResponse } from 'next/server';
import { fetchAirKorea, fetchAirQualityByStation } from '@/lib/airkorea-api';
import { fetchOpenMeteoAirQuality } from '@/lib/open-meteo-api';
import { isKoreaCoordinates } from '@/lib/cities';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const stationName = searchParams.get('stationName');
  const stationAddr = searchParams.get('stationAddr');

  try {
    // lat/lon이 있고 해외 좌표면 Open-Meteo 사용
    if (lat && lon && !isKoreaCoordinates(parseFloat(lat), parseFloat(lon))) {
      const data = await fetchOpenMeteoAirQuality(parseFloat(lat), parseFloat(lon));
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, max-age=600' },
      });
    }

    // 한국: API 키 필요
    const apiKey = process.env.AIRKOREA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AirKorea API key not configured' },
        { status: 500 }
      );
    }

    // stationName이 있으면 측정소 검색 스킵
    if (stationName) {
      const data = await fetchAirQualityByStation(
        stationName,
        stationAddr || '',
        apiKey
      );
      return NextResponse.json(data);
    }

    // 기존 로직: lat/lon으로 측정소 검색 + 대기질 조회
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'lat/lon or stationName parameters are required' },
        { status: 400 }
      );
    }

    const data = await fetchAirKorea(parseFloat(lat), parseFloat(lon), apiKey);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Air quality API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air quality data' },
      { status: 500 }
    );
  }
}
