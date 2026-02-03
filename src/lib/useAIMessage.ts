'use client';

import useSWR from 'swr';
import type { OutingScore } from '@/types/score';
import { CACHE } from './constants';

interface AIMessageInput {
  score: OutingScore;
  temperature: number;
  feelsLike: number;
  weatherMain: string;
  pm25: number;
  humidity?: number;
  windSpeed?: number;
  uvIndex?: number;
}

interface AIMessageState {
  message: string | null;
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
    throw new Error('AI 메시지 생성 실패');
  }

  const data = await res.json();
  return data.message;
};

// 캐시 키 생성 (10점 단위 버킷팅)
function getCacheKey(input: AIMessageInput | null): string | null {
  if (!input) return null;

  const scoreBucket = Math.floor(input.score.total / 10) * 10;
  const weatherKey = input.weatherMain.toLowerCase();
  const pm25Bucket = input.pm25 < 36 ? 'good' : input.pm25 < 76 ? 'bad' : 'veryBad';

  return `ai-message-${scoreBucket}-${input.score.level}-${weatherKey}-${pm25Bucket}`;
}

export function useAIMessage(input: AIMessageInput | null): AIMessageState {
  const cacheKey = getCacheKey(input);

  const { data, error, isLoading } = useSWR(
    cacheKey ? ['/api/ai-message', input] : null,
    ([url, body]) => fetcher(url, body!),
    {
      dedupingInterval: CACHE.TTL,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  return {
    message: data ?? null,
    isLoading,
    error: error?.message ?? null,
  };
}
