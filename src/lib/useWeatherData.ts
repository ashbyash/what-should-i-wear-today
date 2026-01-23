'use client';

import { useState, useEffect } from 'react';
import type { Coordinates } from './geolocation';
import type { KmaWeatherData, UVIndexData } from './kma-api';
import type { AirKoreaData } from './airkorea-api';

export interface LocationData {
  address: string;
  region1: string;
  region2: string;
  region3: string;
}

export interface WeatherDataState {
  weather: KmaWeatherData | null;
  airQuality: AirKoreaData | null;
  uv: UVIndexData | null;
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useWeatherData(coordinates: Coordinates | null): WeatherDataState {
  const [state, setState] = useState<WeatherDataState>({
    weather: null,
    airQuality: null,
    uv: null,
    location: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  useEffect(() => {
    if (!coordinates) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const fetchAllData = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const { lat, lon } = coordinates;

        // 4개 API 병렬 호출
        const [weatherRes, airRes, uvRes, locationRes] = await Promise.all([
          fetch(`/api/weather?lat=${lat}&lon=${lon}`),
          fetch(`/api/air-quality?lat=${lat}&lon=${lon}`),
          fetch(`/api/uv?lat=${lat}&lon=${lon}`),
          fetch(`/api/location?lat=${lat}&lon=${lon}`),
        ]);

        // 에러 체크
        if (!weatherRes.ok) {
          throw new Error('날씨 정보를 가져올 수 없습니다.');
        }

        const weather: KmaWeatherData = await weatherRes.json();

        // 대기질, UV, 위치는 실패해도 계속 진행 (optional)
        let airQuality: AirKoreaData | null = null;
        let uv: UVIndexData | null = null;
        let location: LocationData | null = null;

        if (airRes.ok) {
          airQuality = await airRes.json();
        }

        if (uvRes.ok) {
          uv = await uvRes.json();
        }

        if (locationRes.ok) {
          location = await locationRes.json();
        }

        setState({
          weather,
          airQuality,
          uv,
          location,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : '데이터를 가져올 수 없습니다.',
        }));
      }
    };

    fetchAllData();
  }, [coordinates]);

  return state;
}
