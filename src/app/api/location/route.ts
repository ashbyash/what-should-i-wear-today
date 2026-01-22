import { NextRequest, NextResponse } from 'next/server';

interface KakaoAddress {
  address_name: string;
  region_1depth_name: string; // 시/도
  region_2depth_name: string; // 구/군
  region_3depth_name: string; // 동/읍/면
}

interface KakaoRoadAddress {
  address_name: string;
  region_1depth_name: string;
  region_2depth_name: string;
  road_name: string;
}

interface KakaoGeoResponse {
  documents: Array<{
    address: KakaoAddress | null;
    road_address: KakaoRoadAddress | null;
  }>;
}

export interface LocationData {
  address: string; // 전체 주소
  region1: string; // 시/도
  region2: string; // 구/군
  region3: string; // 동/읍/면
}

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

  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Kakao API key not configured' },
      { status: 500 }
    );
  }

  try {
    // 카카오 Reverse Geocoding API 호출
    // x: 경도(lon), y: 위도(lat)
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lon}&y=${lat}`,
      {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Kakao API error: ${response.status}`);
    }

    const data: KakaoGeoResponse = await response.json();

    if (!data.documents || data.documents.length === 0) {
      return NextResponse.json(
        { error: 'No address found for the given coordinates' },
        { status: 404 }
      );
    }

    const doc = data.documents[0];
    const addr = doc.address;

    if (!addr) {
      return NextResponse.json(
        { error: 'No address information available' },
        { status: 404 }
      );
    }

    const locationData: LocationData = {
      address: addr.address_name,
      region1: addr.region_1depth_name,
      region2: addr.region_2depth_name,
      region3: addr.region_3depth_name,
    };

    return NextResponse.json(locationData);
  } catch (error) {
    console.error('Location API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 500 }
    );
  }
}
