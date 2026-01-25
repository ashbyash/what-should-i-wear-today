import type { LocationData } from '@/types/weather';

// 위치 캐시 (위경도 → 주소 정보)
const locationCache = new Map<string, { data: LocationData; timestamp: number }>();
const LOCATION_CACHE_TTL = 10 * 60 * 1000; // 10분

function getLocationCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)}_${lon.toFixed(3)}`;
}

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
  const cacheKey = getLocationCacheKey(lat, lon);

  // 캐시 확인
  const cached = locationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < LOCATION_CACHE_TTL) {
    return cached.data;
  }

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

  const result: LocationData = {
    address: addr.address_name,
    region1: addr.region_1depth_name,
    region2: addr.region_2depth_name,
    region3: addr.region_3depth_name,
  };

  // 캐시 저장
  locationCache.set(cacheKey, { data: result, timestamp: Date.now() });

  return result;
}
