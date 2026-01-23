'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Coordinates } from './geolocation';
import type { KmaWeatherData, UVIndexData } from './kma-api';
import type { AirKoreaData } from './airkorea-api';
import type { LocationData } from '@/types/weather';
import { CACHE } from './constants';
import {
  safeParseWeather,
  safeParseAirKorea,
  safeParseUVIndex,
  safeParseLocation,
} from './schemas';

interface CacheEntry {
  data: CachedData;
  timestamp: number;
}

interface CachedData {
  weather: KmaWeatherData;
  airQuality: AirKoreaData | null;
  uv: UVIndexData | null;
  location: LocationData | null;
}

// 좌표 기반 캐시 키 생성 (소수점 2자리까지)
function getCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

// 메모리 캐시
const cache = new Map<string, CacheEntry>();

export interface WeatherDataState {
  weather: KmaWeatherData | null;
  airQuality: AirKoreaData | null;
  uv: UVIndexData | null;
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
  isRefetching: boolean;
}

export function useWeatherData(coordinates: Coordinates | null): WeatherDataState {
  const [state, setState] = useState<Omit<WeatherDataState, 'refetch' | 'isRefetching'>>({
    weather: null,
    airQuality: null,
    uv: null,
    location: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });
  const [isRefetching, setIsRefetching] = useState(false);

  const fetchAllData = useCallback(async (coords: Coordinates, skipCache = false) => {
    const { lat, lon } = coords;
    const cacheKey = getCacheKey(lat, lon);

    // 캐시 확인 (skipCache가 아닐 때만)
    if (!skipCache) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE.TTL) {
        setState({
          ...cached.data,
          loading: false,
          error: null,
          lastUpdated: new Date(cached.timestamp),
        });
        return;
      }
    }

    try {
      // 4개 API 병렬 호출
      const [weatherRes, airRes, uvRes, locationRes] = await Promise.all([
        fetch(`/api/weather?lat=${lat}&lon=${lon}`),
        fetch(`/api/air-quality?lat=${lat}&lon=${lon}`),
        fetch(`/api/uv?lat=${lat}&lon=${lon}`),
        fetch(`/api/location?lat=${lat}&lon=${lon}`),
      ]);

      if (!weatherRes.ok) {
        throw new Error('날씨 정보를 가져올 수 없습니다.');
      }

      const weatherJson = await weatherRes.json();
      const weather = safeParseWeather(weatherJson);

      if (!weather) {
        throw new Error('날씨 데이터 형식이 올바르지 않습니다.');
      }

      // 대기질, UV, 위치는 실패해도 계속 진행 (optional)
      let airQuality: AirKoreaData | null = null;
      let uv: UVIndexData | null = null;
      let location: LocationData | null = null;

      if (airRes.ok) {
        airQuality = safeParseAirKorea(await airRes.json());
      }
      if (uvRes.ok) {
        uv = safeParseUVIndex(await uvRes.json());
      }
      if (locationRes.ok) {
        location = safeParseLocation(await locationRes.json());
      }

      const now = Date.now();

      // 캐시 저장
      cache.set(cacheKey, {
        data: { weather, airQuality, uv, location },
        timestamp: now,
      });

      setState({
        weather,
        airQuality,
        uv,
        location,
        loading: false,
        error: null,
        lastUpdated: new Date(now),
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : '데이터를 가져올 수 없습니다.',
      }));
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    if (!coordinates) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetchAllData(coordinates);
  }, [coordinates, fetchAllData]);

  // 수동 새로고침
  const refetch = useCallback(() => {
    if (!coordinates || isRefetching) return;

    setIsRefetching(true);
    fetchAllData(coordinates, true).finally(() => {
      setIsRefetching(false);
    });
  }, [coordinates, fetchAllData, isRefetching]);

  return {
    ...state,
    refetch,
    isRefetching,
  };
}
