/**
 * 위치 캐싱 유틸리티
 * - localStorage에 마지막 위치 저장
 * - 재방문 시 즉시 로드용
 */

import type { LocationData } from '@/types/weather';

const LOCATION_CACHE_KEY = 'last_location';
const LOCATION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간

export interface CachedLocation {
  lat: number;
  lon: number;
  address: LocationData;
  timestamp: number;
}

/**
 * 마지막 위치 저장
 */
export function saveLocation(
  lat: number,
  lon: number,
  address: LocationData
): void {
  if (typeof window === 'undefined') return;

  const data: CachedLocation = {
    lat,
    lon,
    address,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage 사용 불가 (private mode 등)
  }
}

/**
 * 마지막 위치 조회
 */
export function getLastLocation(): CachedLocation | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!stored) return null;

    const data: CachedLocation = JSON.parse(stored);

    // TTL 확인
    if (Date.now() - data.timestamp > LOCATION_CACHE_TTL) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * 두 좌표 간 거리 계산 (Haversine formula)
 * @returns 거리 (km)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 지구 반경 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * 위치가 유의미하게 변경되었는지 확인
 * @param threshold 임계값 (km), 기본 1km
 */
export function hasLocationChanged(
  oldLat: number,
  oldLon: number,
  newLat: number,
  newLon: number,
  threshold = 1
): boolean {
  const distance = calculateDistance(oldLat, oldLon, newLat, newLon);
  return distance > threshold;
}
