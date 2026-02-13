'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { CITIES } from './cities';
import type { SearchResult, KakaoPlaceResponse, OpenMeteoSearchResponse } from '@/types/location';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
};

// 좌표 근접 체크 (±0.01° ≈ 1km)
function areCoordinatesNear(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): boolean {
  return Math.abs(lat1 - lat2) < 0.01 && Math.abs(lon1 - lon2) < 0.01;
}

export function useLocationSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // 사전 정의 도시 필터링 (즉시)
  const predefinedResults = useMemo((): SearchResult[] => {
    if (!debouncedQuery) return [];

    const lowerQuery = debouncedQuery.toLowerCase();
    return CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(lowerQuery) ||
        city.nameEn.toLowerCase().includes(lowerQuery) ||
        city.slug.toLowerCase().includes(lowerQuery)
    ).map((city) => ({
      type: 'predefined' as const,
      name: city.name,
      nameEn: city.nameEn,
      description: city.description,
      lat: city.lat,
      lon: city.lon,
      slug: city.slug,
      isOverseas: city.isOverseas ?? false,
    }));
  }, [debouncedQuery]);

  // 카카오 API 호출 (2글자 이상)
  const shouldFetch = debouncedQuery.length >= 2;
  const {
    data: kakaoData,
    error: kakaoError,
    isLoading: kakaoLoading,
  } = useSWR<KakaoPlaceResponse>(
    shouldFetch
      ? `/api/search-location?query=${encodeURIComponent(debouncedQuery)}`
      : null,
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  // Open-Meteo 해외 검색 (2글자 이상, Kakao와 독립)
  const {
    data: openMeteoData,
    isLoading: openMeteoLoading,
  } = useSWR<OpenMeteoSearchResponse>(
    shouldFetch
      ? `/api/search-overseas?query=${encodeURIComponent(debouncedQuery)}`
      : null,
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  // 카카오 결과 변환 + 중복 제거
  const kakaoResults = useMemo((): SearchResult[] => {
    if (!kakaoData?.documents) return [];

    return kakaoData.documents
      .map((place) => ({
        type: 'kakao' as const,
        name: place.place_name,
        description: place.address_name || place.road_address_name,
        lat: parseFloat(place.y),
        lon: parseFloat(place.x),
      }))
      .filter((kakaoResult) => {
        // 사전 정의 도시와 좌표 근접 시 제외
        return !predefinedResults.some((predefined) =>
          areCoordinatesNear(
            predefined.lat,
            predefined.lon,
            kakaoResult.lat,
            kakaoResult.lon
          )
        );
      });
  }, [kakaoData, predefinedResults]);

  // Open-Meteo 결과 변환 + 중복 제거 (한국 결과 필터링)
  const openMeteoResults = useMemo((): SearchResult[] => {
    if (!openMeteoData?.results) return [];

    return openMeteoData.results
      .filter((place) => place.country_code !== 'KR')
      .map((place) => ({
        type: 'openmeteo' as const,
        name: place.name,
        description: `${place.admin1 ? place.admin1 + ', ' : ''}${place.country}`,
        lat: place.latitude,
        lon: place.longitude,
        country: place.country,
        isOverseas: true,
      }))
      .filter((omResult) => {
        // 사전 정의 도시와 좌표 근접 시 제외
        return !predefinedResults.some((predefined) =>
          areCoordinatesNear(
            predefined.lat,
            predefined.lon,
            omResult.lat,
            omResult.lon
          )
        );
      });
  }, [openMeteoData, predefinedResults]);

  // 결과 병합: 사전 정의 → 카카오 → Open-Meteo
  const results = useMemo(() => {
    return [...predefinedResults, ...kakaoResults, ...openMeteoResults];
  }, [predefinedResults, kakaoResults, openMeteoResults]);

  // 국내/해외 분리
  const domesticResults = useMemo(() => {
    return [...predefinedResults.filter(r => !r.isOverseas), ...kakaoResults];
  }, [predefinedResults, kakaoResults]);

  const overseasResults = useMemo(() => {
    return [...predefinedResults.filter(r => r.isOverseas), ...openMeteoResults];
  }, [predefinedResults, openMeteoResults]);

  const isLoading = kakaoLoading || openMeteoLoading;

  return {
    results,
    domesticResults,
    overseasResults,
    isLoading,
    error: kakaoError,
    isEmpty: debouncedQuery.length > 0 && results.length === 0 && !isLoading,
  };
}
