/**
 * AI 점수 메시지 생성용 프롬프트 템플릿
 *
 * SCORE_WEIGHTS를 동적으로 참조하여 가중치 변경 시 자동 반영
 * 프롬프트 튜닝이 필요하면 이 파일만 수정
 */

import { SCORE_WEIGHTS } from '@/lib/constants';
import type { ScoreBreakdown, OutingLevel } from '@/types/score';

// 레벨별 한글 표현
const LEVEL_LABELS: Record<OutingLevel, string> = {
  perfect: '완벽',
  excellent: '최고',
  good: '좋음',
  fair: '괜찮음',
  moderate: '보통',
  poor: '나쁨',
  bad: '안좋음',
};

export interface ScoreMessageInput {
  total: number;
  level: OutingLevel;
  breakdown: ScoreBreakdown;
  temperature: number;
  feelsLike: number; // 체감온도
  weatherMain: string;
  pm25: number;
  humidity?: number;
  windSpeed?: number;
  uvIndex?: number;
}

/**
 * System prompt 생성
 * - 역할과 제약조건 정의
 * - 가중치 정보는 constants.ts에서 동적으로 가져옴
 */
export function buildSystemPrompt(): string {
  return `You are an AI that summarizes weather-based outing scores in a friendly manner.

## Role
- Receive outing score (0-100) and weather data, summarize in one sentence
- Help users quickly decide whether to go outside

## Score Weights (100 points max)
- Feels-like temperature: ${SCORE_WEIGHTS.FEELS_LIKE_TEMP} points (most important)
- Weather condition: ${SCORE_WEIGHTS.WEATHER} points
- Fine dust (PM2.5): ${SCORE_WEIGHTS.FINE_DUST} points
- UV index: ${SCORE_WEIGHTS.UV} points
- Humidity: ${SCORE_WEIGHTS.HUMIDITY} points
- Wind penalty: up to ${Math.abs(SCORE_WEIGHTS.WIND_PENALTY_MAX)} points deduction

## Rules
1. Respond in exactly ONE sentence (max 30 Korean characters)
2. Do NOT mention the score number (already shown in UI)
3. Mention only the 1-2 most impactful factors
4. Use polite Korean (존댓말), ending with "~해요" or "~예요"
5. No emojis
6. Output MUST be in Korean`;
}

/**
 * User prompt 생성
 * - 실제 날씨 데이터와 점수 breakdown 전달
 */
export function buildUserPrompt(input: ScoreMessageInput): string {
  const { total, level, breakdown, temperature, feelsLike, weatherMain, pm25, humidity, windSpeed, uvIndex } = input;

  // 각 요소별 득점률 계산 (영향도 파악용)
  const feelsLikeTempRate = (breakdown.feelsLikeTemp / SCORE_WEIGHTS.FEELS_LIKE_TEMP) * 100;
  const weatherRate = (breakdown.weather / SCORE_WEIGHTS.WEATHER) * 100;
  const fineDustRate = (breakdown.fineDust / SCORE_WEIGHTS.FINE_DUST) * 100;
  const uvRate = (breakdown.uv / SCORE_WEIGHTS.UV) * 100;
  const humidityRate = (breakdown.humidity / SCORE_WEIGHTS.HUMIDITY) * 100;
  const hasWindPenalty = breakdown.windPenalty < 0;

  return `## Current Conditions
- Total score: ${total} points (${LEVEL_LABELS[level]})
- Temperature: ${temperature}°C (feels like ${feelsLike}°C)
- Weather: ${weatherMain}
- Fine dust (PM2.5): ${pm25}μg/m³
${humidity !== undefined ? `- Humidity: ${humidity}%` : ''}
${windSpeed !== undefined ? `- Wind speed: ${windSpeed}m/s` : ''}
${uvIndex !== undefined ? `- UV index: ${uvIndex}` : ''}

## Score Breakdown (percentage of max points)
- Feels-like temp: ${breakdown.feelsLikeTemp}/${SCORE_WEIGHTS.FEELS_LIKE_TEMP} (${feelsLikeTempRate.toFixed(0)}%)
- Weather: ${breakdown.weather}/${SCORE_WEIGHTS.WEATHER} (${weatherRate.toFixed(0)}%)
- Fine dust: ${breakdown.fineDust}/${SCORE_WEIGHTS.FINE_DUST} (${fineDustRate.toFixed(0)}%)
- UV: ${breakdown.uv}/${SCORE_WEIGHTS.UV} (${uvRate.toFixed(0)}%)
- Humidity: ${breakdown.humidity}/${SCORE_WEIGHTS.HUMIDITY} (${humidityRate.toFixed(0)}%)
${hasWindPenalty ? `- Wind penalty: ${breakdown.windPenalty} points` : '- Wind penalty: none'}

Based on this data, summarize in ONE Korean sentence what the weather is like for going outside.
Prioritize mentioning factors with LOW percentage (negative impact) or HIGH percentage (positive impact).`;
}
