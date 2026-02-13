import type { LocationData } from '@/types/weather';

// Nominatim 캐시 (위경도 → 주소 정보)
const nominatimCache = new Map<string, { data: LocationData; timestamp: number }>();
const NOMINATIM_CACHE_TTL = 30 * 60 * 1000; // 30분

function getNominatimCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)}_${lon.toFixed(2)}`; // ±1km 정밀도
}

interface NominatimAddress {
  country?: string;
  state?: string;
  city?: string;
  town?: string;
  suburb?: string;
  village?: string;
}

interface NominatimResponse {
  display_name: string;
  address: NominatimAddress;
}

/**
 * Nominatim Reverse Geocoding API를 호출하여 해외 좌표를 주소로 변환
 * - 무료, API 키 불필요
 * - User-Agent 헤더 필수 (Nominatim 정책)
 * - 인메모리 캐시 30분 TTL
 */
export async function fetchNominatimLocation(
  lat: number,
  lon: number
): Promise<LocationData> {
  const cacheKey = getNominatimCacheKey(lat, lon);

  // 캐시 확인
  const cached = nominatimCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < NOMINATIM_CACHE_TTL) {
    return cached.data;
  }

  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lon.toString());
  url.searchParams.set('format', 'json');
  url.searchParams.set('accept-language', 'ko');

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'what-should-i-wear-today/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`);
  }

  const data: NominatimResponse = await response.json();

  const country = data.address.country || '';
  const city = data.address.city || data.address.town || data.address.state || '';
  const detail = data.address.suburb || data.address.village || '';

  const result: LocationData = {
    address: data.display_name,
    region1: country,
    region2: city,
    region3: detail,
  };

  // 캐시 저장
  nominatimCache.set(cacheKey, { data: result, timestamp: Date.now() });

  return result;
}
