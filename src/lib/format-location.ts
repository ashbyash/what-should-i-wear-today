import type { LocationData } from '@/types/weather';
import type { AirKoreaData } from './airkorea-api';

/**
 * 위치 정보를 사용자 친화적 문자열로 포맷팅
 * - 카카오 API 데이터 우선 사용
 * - 없으면 에어코리아 측정소 주소 사용
 */
export function formatLocation(
  location: LocationData | null,
  airQuality: AirKoreaData | null
): string {
  // 카카오 API 데이터가 있으면 우선 사용
  if (location) {
    // "서울특별시" → "서울", "경기도" → "경기" 등 축약
    const region1 = location.region1
      .replace(/특별시|광역시|특별자치시|특별자치도/g, '')
      .trim();
    return `${region1} ${location.region2} ${location.region3}`.trim();
  }

  // 폴백: 에어코리아 측정소 주소
  if (airQuality?.stationAddr) {
    return airQuality.stationAddr
      .replace(/특별시|광역시|특별자치시|특별자치도/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return '현재 위치';
}
