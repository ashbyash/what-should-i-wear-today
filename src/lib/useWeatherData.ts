'use client';

import useSWR from 'swr';
import { useEffect, useCallback, useRef } from 'react';
import type { Coordinates } from './geolocation';
import type { KmaWeatherData, UVIndexData } from './kma-api';
import type { AirKoreaData } from './airkorea-api';
import type { LocationData, InitialWeatherData } from '@/types/weather';
import { CACHE } from './constants';
import { saveLocation, hasLocationChanged } from './location-cache';
import {
  safeParseCurrentWeather,
  safeParseForecastWeather,
  safeParseAirKorea,
  safeParseUVIndex,
  safeParseLocation,
  type KmaCurrentData,
  type KmaForecastData,
} from './schemas';

// SWR fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('API 요청 실패');
  return res.json();
};

// 좌표 기반 캐시 키 생성 (소수점 2자리까지)
function getCacheKey(lat: number, lon: number, endpoint: string): string {
  return `${endpoint}?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;
}

// weatherCurrent + weatherForecast → KmaWeatherData 통합
function combineWeatherData(
  current: KmaCurrentData | null,
  forecast: KmaForecastData | null
): KmaWeatherData | null {
  if (!current) return null;

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
  weatherCurrent: KmaCurrentData | null;
  weatherCurrentLoading: boolean;
  weatherForecast: KmaForecastData | null;
  weatherForecastLoading: boolean;
  weather: KmaWeatherData | null;
  weatherLoading: boolean;
  airQuality: AirKoreaData | null;
  airQualityLoading: boolean;
  uv: UVIndexData | null;
  uvLoading: boolean;
  location: LocationData | null;
  locationLoading: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
  isRefetching: boolean;
}

interface UseWeatherDataOptions {
  /** GPS 위치로 변경되었을 때 revalidate 트리거 */
  locationChanged?: boolean;
  /** ISR에서 가져온 초기 데이터 (fallbackData로 사용) */
  initialData?: InitialWeatherData;
}

export function useWeatherData(
  coordinates: Coordinates | null,
  options: UseWeatherDataOptions = {}
): WeatherDataState {
  const { locationChanged = false, initialData } = options;
  const prevCoordsRef = useRef<Coordinates | null>(null);

  const lat = coordinates?.lat;
  const lon = coordinates?.lon;

  // SWR 공통 옵션
  const swrOptions = {
    dedupingInterval: CACHE.TTL,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  };

  // Weather Current API (초단기실황)
  const {
    data: currentRaw,
    error: currentError,
    isLoading: currentLoading,
    isValidating: currentValidating,
    mutate: mutateCurrent,
  } = useSWR(
    lat && lon ? getCacheKey(lat, lon, '/api/weather-current') : null,
    fetcher,
    {
      ...swrOptions,
      fallbackData: initialData?.current ?? undefined,
    }
  );
  const weatherCurrent = currentRaw ? safeParseCurrentWeather(currentRaw) : null;

  // Weather Forecast API (단기예보)
  const {
    data: forecastRaw,
    isLoading: forecastLoading,
    isValidating: forecastValidating,
    mutate: mutateForecast,
  } = useSWR(
    lat && lon ? getCacheKey(lat, lon, '/api/weather-forecast') : null,
    fetcher,
    {
      ...swrOptions,
      fallbackData: initialData?.forecast ?? undefined,
    }
  );
  const weatherForecast = forecastRaw ? safeParseForecastWeather(forecastRaw) : null;

  // Location API
  const {
    data: locationRaw,
    isLoading: locationLoading,
    isValidating: locationValidating,
    mutate: mutateLocation,
  } = useSWR(
    lat && lon ? getCacheKey(lat, lon, '/api/location') : null,
    fetcher,
    {
      ...swrOptions,
      fallbackData: initialData?.location ?? undefined,
    }
  );
  const location = locationRaw ? safeParseLocation(locationRaw) : null;

  // Air Quality API (lat/lon으로 직접 호출 - 측정소 검색 + 대기질 조회 통합)
  const {
    data: airQualityRaw,
    isLoading: airQualityLoading,
    isValidating: airQualityValidating,
    mutate: mutateAirQuality,
  } = useSWR(
    lat && lon ? getCacheKey(lat, lon, '/api/air-quality') : null,
    fetcher,
    {
      ...swrOptions,
      fallbackData: initialData?.airQuality ?? undefined,
    }
  );
  const airQuality = airQualityRaw ? safeParseAirKorea(airQualityRaw) : null;

  // UV API
  const {
    data: uvRaw,
    isLoading: uvLoading,
    isValidating: uvValidating,
    mutate: mutateUV,
  } = useSWR(
    lat && lon ? getCacheKey(lat, lon, '/api/uv') : null,
    fetcher,
    {
      ...swrOptions,
      fallbackData: initialData?.uv ?? undefined,
    }
  );
  const uv = uvRaw ? safeParseUVIndex(uvRaw) : null;

  // 통합 날씨 데이터
  const weather = combineWeatherData(weatherCurrent, weatherForecast);

  // 위치 저장 (location 데이터 로드 완료 시)
  useEffect(() => {
    if (lat && lon && location) {
      const prevCoords = prevCoordsRef.current;
      const shouldSave =
        !prevCoords ||
        hasLocationChanged(prevCoords.lat, prevCoords.lon, lat, lon);

      if (shouldSave) {
        saveLocation(lat, lon, location);
        prevCoordsRef.current = { lat, lon };
      }
    }
  }, [lat, lon, location]);

  // 위치 변경 시 revalidate
  useEffect(() => {
    if (locationChanged && lat && lon) {
      mutateCurrent();
      mutateForecast();
      mutateLocation();
      mutateAirQuality();
      mutateUV();
    }
  }, [
    locationChanged,
    lat,
    lon,
    mutateCurrent,
    mutateForecast,
    mutateLocation,
    mutateAirQuality,
    mutateUV,
  ]);

  // 수동 새로고침
  const refetch = useCallback(() => {
    mutateCurrent();
    mutateForecast();
    mutateLocation();
    mutateAirQuality();
    mutateUV();
  }, [
    mutateCurrent,
    mutateForecast,
    mutateLocation,
    mutateAirQuality,
    mutateUV,
  ]);

  // 로딩 상태 계산
  const isRefetching =
    currentValidating ||
    forecastValidating ||
    locationValidating ||
    airQualityValidating ||
    uvValidating;

  const loading =
    !coordinates ||
    currentLoading ||
    forecastLoading ||
    locationLoading ||
    airQualityLoading ||
    uvLoading;

  // lastUpdated 계산 (데이터가 있을 때만)
  const lastUpdated = weatherCurrent ? new Date() : null;

  return {
    weatherCurrent,
    weatherCurrentLoading: currentLoading,
    weatherForecast,
    weatherForecastLoading: forecastLoading,
    weather,
    weatherLoading: currentLoading || forecastLoading,
    airQuality,
    airQualityLoading,
    uv,
    uvLoading,
    location,
    locationLoading,
    loading,
    error: currentError?.message ?? null,
    lastUpdated,
    refetch,
    isRefetching,
  };
}
