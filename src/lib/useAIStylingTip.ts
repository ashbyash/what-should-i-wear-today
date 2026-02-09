'use client';

import useSWR from 'swr';
import type { OutfitByCategory } from '@/types/score';
import { CACHE, OUTFIT_TEMP } from './constants';

interface AIStylingTipInput {
  categories: OutfitByCategory;
  alerts: string[];
  temperature: number;
  feelsLike: number;
  weatherMain: string;
  pm25: number;
}

interface AIStylingTipState {
  tip: string | null;
  isLoading: boolean;
  error: string | null;
}

const fetcher = async (url: string, body: object) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error('스타일링 팁 생성 실패');
  }

  const data = await res.json();
  return data.tip;
};

// 체감온도 → 온도 구간 키 변환
function getTempZone(feelsLike: number): string {
  if (feelsLike >= OUTFIT_TEMP.HOT) return 'hot';
  if (feelsLike >= OUTFIT_TEMP.WARM) return 'warm';
  if (feelsLike >= OUTFIT_TEMP.MILD) return 'mild';
  if (feelsLike >= OUTFIT_TEMP.COOL) return 'cool';
  if (feelsLike >= OUTFIT_TEMP.COLD) return 'cold';
  if (feelsLike >= OUTFIT_TEMP.FREEZING) return 'freezing';
  if (feelsLike >= OUTFIT_TEMP.BITTER) return 'bitter';
  return 'extreme';
}

// 캐시 키 생성 (온도 구간 + 날씨 + PM2.5 버킷)
function getCacheKey(input: AIStylingTipInput | null): string | null {
  if (!input) return null;

  const tempZone = getTempZone(input.feelsLike);
  const weatherKey = input.weatherMain.toLowerCase();
  const pm25Bucket = input.pm25 < 36 ? 'good' : input.pm25 < 76 ? 'bad' : 'veryBad';

  return `ai-styling-tip-${tempZone}-${weatherKey}-${pm25Bucket}`;
}

export function useAIStylingTip(input: AIStylingTipInput | null): AIStylingTipState {
  const cacheKey = getCacheKey(input);

  const { data, error, isLoading } = useSWR(
    cacheKey ? ['/api/ai-styling-tip', input] : null,
    ([url, body]) => fetcher(url, body!),
    {
      dedupingInterval: CACHE.TTL,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  return {
    tip: data ?? null,
    isLoading,
    error: error?.message ?? null,
  };
}
