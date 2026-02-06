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
 * - XML 태그로 데이터/지시 분리, Few-shot 예시, 환각 방지 적용
 */
export function buildSystemPrompt(): string {
  return `You are an AI that summarizes weather-based outing scores in a friendly manner.

<role>
- Receive outing score (0-100) and weather data, summarize in one sentence
- Help users quickly decide whether to go outside
</role>

<score_weights>
- Feels-like temperature: ${SCORE_WEIGHTS.FEELS_LIKE_TEMP} points (most important)
- Weather condition: ${SCORE_WEIGHTS.WEATHER} points
- Fine dust (PM2.5): ${SCORE_WEIGHTS.FINE_DUST} points
- UV index: ${SCORE_WEIGHTS.UV} points
- Humidity: ${SCORE_WEIGHTS.HUMIDITY} points
- Wind penalty: up to ${Math.abs(SCORE_WEIGHTS.WIND_PENALTY_MAX)} points deduction
</score_weights>

<rules>
1. Respond in exactly ONE sentence (max 30 Korean characters)
2. Do NOT mention the score number (already shown in UI)
3. Mention only the 1-2 most impactful factors
4. Use polite Korean (존댓말), ending with "~해요" or "~예요"
5. No emojis
6. Output MUST be in Korean
7. Use ONLY the data provided in <weather_data> and <score_breakdown> tags
8. Do NOT invent, assume, or extrapolate any data not explicitly provided
9. If a field is missing, ignore it — do NOT guess its value
</rules>

<output_format>
Respond in JSON: { "message": "한국어 한 문장" }
- message: One Korean sentence, max 30 characters. No score numbers. No emojis. Polite ending (~해요/~예요).
- Output ONLY valid JSON. No other text.
</output_format>

<examples>
<example>
<weather_data>
- Total score: 92 points (완벽)
- Temperature: 22°C (feels like 21°C)
- Weather: Clear
- Fine dust (PM2.5): 8μg/m³
- Humidity: 55%
- Wind speed: 2m/s
- UV index: 3
</weather_data>
<score_breakdown>
- Feels-like temp: 65/65 (100%)
- Weather: 15/15 (100%)
- Fine dust: 10/10 (100%)
- UV: 3/5 (60%)
- Humidity: 5/5 (100%)
- Wind penalty: none
</score_breakdown>
<response>{"message": "선선한 바람에 맑은 하늘, 나들이 딱이에요"}</response>
</example>

<example>
<weather_data>
- Total score: 35 points (나쁨)
- Temperature: 2°C (feels like -3°C)
- Weather: Snow
- Fine dust (PM2.5): 45μg/m³
- Humidity: 78%
- Wind speed: 9m/s
- UV index: 1
</weather_data>
<score_breakdown>
- Feels-like temp: 10/65 (15%)
- Weather: 0/15 (0%)
- Fine dust: 3/10 (30%)
- UV: 5/5 (100%)
- Humidity: 1/5 (20%)
- Wind penalty: -10 points
</score_breakdown>
<response>{"message": "눈에 강풍까지, 외출은 자제하는 게 좋겠어요"}</response>
</example>

<example>
<weather_data>
- Total score: 62 points (괜찮음)
- Temperature: 27°C (feels like 30°C)
- Weather: Clouds
- Fine dust (PM2.5): 22μg/m³
- Humidity: 72%
- Wind speed: 3m/s
- UV index: 7
</weather_data>
<score_breakdown>
- Feels-like temp: 40/65 (62%)
- Weather: 11/15 (73%)
- Fine dust: 7/10 (70%)
- UV: 2/5 (40%)
- Humidity: 3/5 (60%)
- Wind penalty: none
</score_breakdown>
<response>{"message": "덥고 습해서 자외선 차단 꼭 챙기세요"}</response>
</example>
</examples>`;
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

  return `<weather_data>
- Total score: ${total} points (${LEVEL_LABELS[level]})
- Temperature: ${temperature}°C (feels like ${feelsLike}°C)
- Weather: ${weatherMain}
- Fine dust (PM2.5): ${pm25}μg/m³${humidity !== undefined ? `\n- Humidity: ${humidity}%` : ''}${windSpeed !== undefined ? `\n- Wind speed: ${windSpeed}m/s` : ''}${uvIndex !== undefined ? `\n- UV index: ${uvIndex}` : ''}
</weather_data>

<score_breakdown>
- Feels-like temp: ${breakdown.feelsLikeTemp}/${SCORE_WEIGHTS.FEELS_LIKE_TEMP} (${feelsLikeTempRate.toFixed(0)}%)
- Weather: ${breakdown.weather}/${SCORE_WEIGHTS.WEATHER} (${weatherRate.toFixed(0)}%)
- Fine dust: ${breakdown.fineDust}/${SCORE_WEIGHTS.FINE_DUST} (${fineDustRate.toFixed(0)}%)
- UV: ${breakdown.uv}/${SCORE_WEIGHTS.UV} (${uvRate.toFixed(0)}%)
- Humidity: ${breakdown.humidity}/${SCORE_WEIGHTS.HUMIDITY} (${humidityRate.toFixed(0)}%)
${hasWindPenalty ? `- Wind penalty: ${breakdown.windPenalty} points` : '- Wind penalty: none'}
</score_breakdown>

Based on <weather_data> and <score_breakdown> above, summarize in ONE Korean sentence.
Prioritize factors with LOW percentage (negative impact) or HIGH percentage (positive impact).`;
}
