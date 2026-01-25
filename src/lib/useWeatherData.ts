'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Coordinates } from './geolocation';
import type { KmaWeatherData, UVIndexData } from './kma-api';
import type { AirKoreaData } from './airkorea-api';
import type { LocationData } from '@/types/weather';
import { CACHE } from './constants';
import {
  safeParseCurrentWeather,
  safeParseForecastWeather,
  safeParseAirKorea,
  safeParseUVIndex,
  safeParseLocation,
  type KmaCurrentData,
  type KmaForecastData,
} from './schemas';

interface CacheEntry {
  data: CachedData;
  timestamp: number;
}

interface CachedData {
  weatherCurrent: KmaCurrentData | null;
  weatherForecast: KmaForecastData | null;
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

// weatherCurrent + weatherForecast → KmaWeatherData 통합
function combineWeatherData(
  current: KmaCurrentData | null,
  forecast: KmaForecastData | null
): KmaWeatherData | null {
  if (!current) return null;

  // 강수형태가 있으면 하늘상태 대신 강수형태 사용
  const hasRain = current.precipitation !== '';

  return {
    temperature: current.temperature,
    humidity: current.humidity,
    windSpeed: current.windSpeed,
    precipitation: current.precipitation,
    precipitationDescription: current.precipitationDescription,
    sky: hasRain ? current.precipitation : (forecast?.sky ?? 'Clear'),
    skyDescription: hasRain
      ? current.precipitationDescription
      : (forecast?.skyDescription ?? '맑음'),
    tempMin: forecast?.tempMin ?? null,
    tempMax: forecast?.tempMax ?? null,
  };
}

export interface WeatherDataState {
  // 분리된 날씨 데이터 (점진적 렌더링용)
  weatherCurrent: KmaCurrentData | null;
  weatherCurrentLoading: boolean;
  weatherForecast: KmaForecastData | null;
  weatherForecastLoading: boolean;
  // 통합 날씨 데이터 (하위 호환)
  weather: KmaWeatherData | null;
  weatherLoading: boolean;
  // 기타 데이터
  airQuality: AirKoreaData | null;
  airQualityLoading: boolean;
  uv: UVIndexData | null;
  uvLoading: boolean;
  location: LocationData | null;
  locationLoading: boolean;
  // 상태
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
  isRefetching: boolean;
}

export function useWeatherData(coordinates: Coordinates | null): WeatherDataState {
  const [state, setState] = useState<Omit<WeatherDataState, 'refetch' | 'isRefetching'>>({
    weatherCurrent: null,
    weatherCurrentLoading: true,
    weatherForecast: null,
    weatherForecastLoading: true,
    weather: null,
    weatherLoading: true,
    airQuality: null,
    airQualityLoading: true,
    uv: null,
    uvLoading: true,
    location: null,
    locationLoading: true,
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
        const weather = combineWeatherData(cached.data.weatherCurrent, cached.data.weatherForecast);
        setState({
          ...cached.data,
          weather,
          weatherCurrentLoading: false,
          weatherForecastLoading: false,
          weatherLoading: false,
          airQualityLoading: false,
          uvLoading: false,
          locationLoading: false,
          loading: false,
          error: null,
          lastUpdated: new Date(cached.timestamp),
        });
        return;
      }
    }

    // 결과 저장용 변수
    let currentResult: KmaCurrentData | null = null;
    let forecastResult: KmaForecastData | null = null;
    let airQualityResult: AirKoreaData | null = null;
    let uvResult: UVIndexData | null = null;
    let locationResult: LocationData | null = null;
    let hasError = false;

    // Weather Current API (초단기실황) - 완료 즉시 표시
    const currentPromise = fetch(`/api/weather-current?lat=${lat}&lon=${lon}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('현재 날씨 정보를 가져올 수 없습니다.');
        const json = await res.json();
        const current = safeParseCurrentWeather(json);
        if (!current) throw new Error('현재 날씨 데이터 형식이 올바르지 않습니다.');
        currentResult = current;
        setState((prev) => {
          const weather = combineWeatherData(current, prev.weatherForecast);
          return {
            ...prev,
            weatherCurrent: current,
            weatherCurrentLoading: false,
            weather,
            weatherLoading: !weather,
          };
        });
        return current;
      })
      .catch((err) => {
        hasError = true;
        setState((prev) => ({
          ...prev,
          weatherCurrentLoading: false,
          weatherLoading: false,
          loading: false,
          error: err instanceof Error ? err.message : '현재 날씨 정보를 가져올 수 없습니다.',
        }));
        throw err;
      });

    // Weather Forecast API (단기예보) - 완료 즉시 표시
    const forecastPromise = fetch(`/api/weather-forecast?lat=${lat}&lon=${lon}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('날씨 예보 정보를 가져올 수 없습니다.');
        const json = await res.json();
        const forecast = safeParseForecastWeather(json);
        if (!forecast) throw new Error('날씨 예보 데이터 형식이 올바르지 않습니다.');
        forecastResult = forecast;
        setState((prev) => {
          const weather = combineWeatherData(prev.weatherCurrent, forecast);
          return {
            ...prev,
            weatherForecast: forecast,
            weatherForecastLoading: false,
            weather: weather ?? prev.weather,
            weatherLoading: !weather && prev.weatherLoading,
          };
        });
        return forecast;
      })
      .catch(() => {
        setState((prev) => ({ ...prev, weatherForecastLoading: false }));
        return null;
      });

    // Location API - 완료 즉시 표시
    const locationPromise = fetch(`/api/location?lat=${lat}&lon=${lon}`)
      .then(async (res) => {
        if (res.ok) {
          const location = safeParseLocation(await res.json());
          locationResult = location;
          setState((prev) => ({ ...prev, location, locationLoading: false }));
          return location;
        }
        setState((prev) => ({ ...prev, locationLoading: false }));
        return null;
      })
      .catch(() => {
        setState((prev) => ({ ...prev, locationLoading: false }));
        return null;
      });

    // AirQuality API - nearest-station 먼저 호출 후 air-quality 호출
    const airQualityPromise = fetch(`/api/nearest-station?lat=${lat}&lon=${lon}`)
      .then(async (stationRes) => {
        if (!stationRes.ok) throw new Error('측정소 검색 실패');
        const station = await stationRes.json();

        const airRes = await fetch(
          `/api/air-quality?stationName=${encodeURIComponent(station.stationName)}&stationAddr=${encodeURIComponent(station.stationAddr)}`
        );
        if (!airRes.ok) throw new Error('대기질 조회 실패');

        const airQuality = safeParseAirKorea(await airRes.json());
        airQualityResult = airQuality;
        setState((prev) => ({ ...prev, airQuality, airQualityLoading: false }));
        return airQuality;
      })
      .catch(() => {
        setState((prev) => ({ ...prev, airQualityLoading: false }));
        return null;
      });

    // UV API - 완료 즉시 표시
    const uvPromise = fetch(`/api/uv?lat=${lat}&lon=${lon}`)
      .then(async (res) => {
        if (res.ok) {
          const uv = safeParseUVIndex(await res.json());
          uvResult = uv;
          setState((prev) => ({ ...prev, uv, uvLoading: false }));
          return uv;
        }
        setState((prev) => ({ ...prev, uvLoading: false }));
        return null;
      })
      .catch(() => {
        setState((prev) => ({ ...prev, uvLoading: false }));
        return null;
      });

    // 모든 API 병렬 실행, 완료 대기
    await Promise.allSettled([
      currentPromise,
      forecastPromise,
      locationPromise,
      airQualityPromise,
      uvPromise,
    ]);

    // Current 성공 시에만 캐시 저장 및 완료 처리
    if (!hasError && currentResult) {
      const now = Date.now();
      cache.set(cacheKey, {
        data: {
          weatherCurrent: currentResult,
          weatherForecast: forecastResult,
          airQuality: airQualityResult,
          uv: uvResult,
          location: locationResult,
        },
        timestamp: now,
      });
      setState((prev) => ({
        ...prev,
        loading: false,
        lastUpdated: new Date(now),
      }));
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    if (!coordinates) {
      setState((prev) => ({
        ...prev,
        weatherCurrentLoading: false,
        weatherForecastLoading: false,
        weatherLoading: false,
        airQualityLoading: false,
        uvLoading: false,
        locationLoading: false,
        loading: false,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      weatherCurrentLoading: true,
      weatherForecastLoading: true,
      weatherLoading: true,
      airQualityLoading: true,
      uvLoading: true,
      locationLoading: true,
      loading: true,
      error: null,
    }));
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
