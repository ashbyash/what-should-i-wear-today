'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { CITIES } from './cities';
import type { SearchResult, KakaoPlaceResponse } from '@/types/location';

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
      type: 'predefined',
      name: city.name,
      nameEn: city.nameEn,
      description: city.description,
      lat: city.lat,
      lon: city.lon,
      slug: city.slug,
    }));
  }, [debouncedQuery]);

  // 카카오 API 호출 (2글자 이상)
  const shouldFetchKakao = debouncedQuery.length >= 2;
  const {
    data: kakaoData,
    error: kakaoError,
    isLoading: kakaoLoading,
  } = useSWR<KakaoPlaceResponse>(
    shouldFetchKakao
      ? `/api/search-location?query=${encodeURIComponent(debouncedQuery)}`
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

  // 결과 병합: 사전 정의 → 카카오
  const results = useMemo(() => {
    return [...predefinedResults, ...kakaoResults];
  }, [predefinedResults, kakaoResults]);

  return {
    results,
    isLoading: kakaoLoading,
    error: kakaoError,
    isEmpty: debouncedQuery.length > 0 && results.length === 0 && !kakaoLoading,
  };
}
