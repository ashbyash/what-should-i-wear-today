'use client';

import useSWR from 'swr';
import { useEffect, useCallback, useRef, useMemo } from 'react';
import type { Coordinates } from './geolocation';
import type { KmaWeatherData, UVIndexData } from './kma-api';
import type { AirKoreaData } from './airkorea-api';
import type { LocationData, InitialWeatherData } from '@/types/weather';
import { CACHE } from './constants';
import { saveLocation, hasLocationChanged } from './location-cache';
import { getCachedWeatherData, saveWeatherData } from './weather-cache';
import {
  parseCurrentWeather,
  parseForecastWeather,
  parseAirKorea,
  parseUVIndex,
  parseLocation,
  parseHourlyForecast,
  type KmaCurrentData,
  type KmaForecastData,
} from './type-guards';
import type { HourlyForecastItem } from '@/types/weather';

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
  hourlyForecast: HourlyForecastItem[] | null;
  hourlyLoading: boolean;
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

  // localStorage 캐시 로드 (initialData가 없을 때만)
  const cachedData = useMemo(() => {
    if (initialData) return null; // ISR 데이터 우선
    if (typeof window === 'undefined') return null;
    return getCachedWeatherData(lat, lon);
  }, [initialData, lat, lon]);

  // fallback 데이터 결정 (initialData > cachedData)
  const fallbackCurrent = initialData?.current ?? cachedData?.data.current ?? undefined;
  const fallbackForecast = initialData?.forecast ?? cachedData?.data.forecast ?? undefined;
  const fallbackLocation = initialData?.location ?? cachedData?.data.location ?? undefined;
  const fallbackAirQuality = initialData?.airQuality ?? cachedData?.data.airQuality ?? undefined;
  const fallbackUv = initialData?.uv ?? cachedData?.data.uv ?? undefined;
  const fallbackHourly = initialData?.hourly ?? cachedData?.data.hourly ?? undefined;

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
      fallbackData: fallbackCurrent,
    }
  );
  const weatherCurrent = currentRaw ? parseCurrentWeather(currentRaw) : null;

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
      fallbackData: fallbackForecast,
    }
  );
  const weatherForecast = forecastRaw ? parseForecastWeather(forecastRaw) : null;

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
      fallbackData: fallbackLocation,
    }
  );
  const location = locationRaw ? parseLocation(locationRaw) : null;

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
      fallbackData: fallbackAirQuality,
    }
  );
  const airQuality = airQualityRaw ? parseAirKorea(airQualityRaw) : null;

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
      fallbackData: fallbackUv,
    }
  );
  const uv = uvRaw ? parseUVIndex(uvRaw) : null;

  // Hourly Forecast API (시간별 예보)
  const {
    data: hourlyRaw,
    isLoading: hourlyLoading,
    isValidating: hourlyValidating,
    mutate: mutateHourly,
  } = useSWR(
    lat && lon ? getCacheKey(lat, lon, '/api/weather-hourly') : null,
    fetcher,
    {
      ...swrOptions,
      fallbackData: fallbackHourly,
    }
  );
  const hourlyForecast = hourlyRaw ? parseHourlyForecast(hourlyRaw) : null;

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

  // 날씨 데이터 캐시 저장 (모든 데이터 로드 완료 시)
  useEffect(() => {
    if (lat && lon && currentRaw && forecastRaw && locationRaw) {
      const weatherDataToCache: InitialWeatherData = {
        current: currentRaw,
        forecast: forecastRaw,
        location: locationRaw,
        airQuality: airQualityRaw ?? null,
        uv: uvRaw ?? null,
        hourly: hourlyRaw ?? null,
      };
      saveWeatherData(lat, lon, weatherDataToCache);
    }
  }, [lat, lon, currentRaw, forecastRaw, locationRaw, airQualityRaw, uvRaw, hourlyRaw]);

  // 위치 변경 시 revalidate
  useEffect(() => {
    if (locationChanged && lat && lon) {
      mutateCurrent();
      mutateForecast();
      mutateLocation();
      mutateAirQuality();
      mutateUV();
      mutateHourly();
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
    mutateHourly,
  ]);

  // 수동 새로고침
  const refetch = useCallback(() => {
    mutateCurrent();
    mutateForecast();
    mutateLocation();
    mutateAirQuality();
    mutateUV();
    mutateHourly();
  }, [
    mutateCurrent,
    mutateForecast,
    mutateLocation,
    mutateAirQuality,
    mutateUV,
    mutateHourly,
  ]);

  // 로딩 상태 계산
  const isRefetching =
    currentValidating ||
    forecastValidating ||
    locationValidating ||
    airQualityValidating ||
    uvValidating ||
    hourlyValidating;

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
    hourlyForecast,
    hourlyLoading,
    location,
    locationLoading,
    loading,
    error: currentError?.message ?? null,
    lastUpdated,
    refetch,
    isRefetching,
  };
}
