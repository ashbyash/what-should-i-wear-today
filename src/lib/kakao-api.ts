import type { LocationData } from '@/types/weather';

interface KakaoAddress {
  address_name: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
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

/**
 * 카카오 Reverse Geocoding API를 호출하여 좌표를 주소로 변환
 */
export async function fetchLocation(
  lat: number,
  lon: number,
  apiKey: string
): Promise<LocationData> {
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
    throw new Error('No address found for the given coordinates');
  }

  const doc = data.documents[0];
  const addr = doc.address;

  if (!addr) {
    throw new Error('No address information available');
  }

  return {
    address: addr.address_name,
    region1: addr.region_1depth_name,
    region2: addr.region_2depth_name,
    region3: addr.region_3depth_name,
  };
}
