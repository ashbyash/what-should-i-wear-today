/**
 * 날씨 데이터 캐싱 유틸리티
 * - localStorage에 마지막 날씨 데이터 저장
 * - 재방문 시 즉시 로드용 (Stale-While-Revalidate)
 */

import type { InitialWeatherData } from '@/types/weather';
import { calculateDistance } from './location-cache';
import { CACHE } from './constants';

const WEATHER_CACHE_KEY = 'last_weather';
const WEATHER_CACHE_TTL = CACHE.CLIENT_TTL; // 10분
const LOCATION_THRESHOLD_KM = 1; // 1km 이내면 동일 위치로 간주

export interface CachedWeatherData {
  lat: number;
  lon: number;
  data: InitialWeatherData;
  timestamp: number;
}

/**
 * 날씨 데이터 저장
 */
export function saveWeatherData(
  lat: number,
  lon: number,
  data: InitialWeatherData
): void {
  if (typeof window === 'undefined') return;

  const cached: CachedWeatherData = {
    lat,
    lon,
    data,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cached));
  } catch {
    // localStorage 사용 불가 (private mode 등)
  }
}

/**
 * 캐시된 날씨 데이터 조회
 * @param lat 현재 위도 (옵션)
 * @param lon 현재 경도 (옵션)
 * @returns 캐시된 데이터 (TTL 유효 & 위치 1km 이내일 때만)
 */
export function getCachedWeatherData(
  lat?: number,
  lon?: number
): CachedWeatherData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!stored) return null;

    const cached: CachedWeatherData = JSON.parse(stored);

    // TTL 확인
    if (Date.now() - cached.timestamp > WEATHER_CACHE_TTL) {
      localStorage.removeItem(WEATHER_CACHE_KEY);
      return null;
    }

    // 좌표가 제공된 경우 거리 확인
    if (lat !== undefined && lon !== undefined) {
      const distance = calculateDistance(cached.lat, cached.lon, lat, lon);
      if (distance > LOCATION_THRESHOLD_KM) {
        // 1km 이상 떨어진 위치 → 캐시 무효
        return null;
      }
    }

    return cached;
  } catch {
    return null;
  }
}

/**
 * 캐시 삭제
 */
export function clearWeatherCache(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(WEATHER_CACHE_KEY);
  } catch {
    // ignore
  }
}
