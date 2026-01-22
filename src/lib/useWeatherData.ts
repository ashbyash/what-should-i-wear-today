'use client';

import { useState, useEffect } from 'react';
import type { Coordinates } from './geolocation';
import type { KmaWeatherData, UVIndexData } from './kma-api';
import type { AirKoreaData } from './airkorea-api';

export interface WeatherDataState {
  weather: KmaWeatherData | null;
  airQuality: AirKoreaData | null;
  uv: UVIndexData | null;
  loading: boolean;
  error: string | null;
}

export function useWeatherData(coordinates: Coordinates | null): WeatherDataState {
  const [state, setState] = useState<WeatherDataState>({
    weather: null,
    airQuality: null,
    uv: null,
    loading: true,
    error: null,
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

        // 3개 API 병렬 호출
        const [weatherRes, airRes, uvRes] = await Promise.all([
          fetch(`/api/weather?lat=${lat}&lon=${lon}`),
          fetch(`/api/air-quality?lat=${lat}&lon=${lon}`),
          fetch(`/api/uv?lat=${lat}&lon=${lon}`),
        ]);

        // 에러 체크
        if (!weatherRes.ok) {
          throw new Error('날씨 정보를 가져올 수 없습니다.');
        }

        const weather: KmaWeatherData = await weatherRes.json();

        // 대기질과 UV는 실패해도 계속 진행 (optional)
        let airQuality: AirKoreaData | null = null;
        let uv: UVIndexData | null = null;

        if (airRes.ok) {
          airQuality = await airRes.json();
        }

        if (uvRes.ok) {
          uv = await uvRes.json();
        }

        setState({
          weather,
          airQuality,
          uv,
          loading: false,
          error: null,
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
