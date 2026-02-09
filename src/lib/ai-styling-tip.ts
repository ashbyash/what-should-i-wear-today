/**
 * AI 스타일링 팁 생성 서비스
 *
 * - OpenAI API 통합
 * - 시스템 프롬프트 메모이제이션 (상수 기반이므로 한 번만 생성)
 * - 앱 레벨 메모리 캐시 (동일 온도 구간 + 날씨 조건 재사용)
 * - OpenAI 서버 사이드 자동 캐싱 (1024 토큰 이상 시스템 프롬프트)
 */

import OpenAI from 'openai';
import { buildSystemPrompt, buildUserPrompt, type StylingTipInput } from './prompts/styling-tip';
import { CACHE, OUTFIT_TEMP } from './constants';

// 시스템 프롬프트 메모이제이션 (상수 기반 → 런타임 중 불변)
let cachedSystemPrompt: string | null = null;

function getSystemPrompt(): string {
  if (!cachedSystemPrompt) {
    cachedSystemPrompt = buildSystemPrompt();
  }
  return cachedSystemPrompt;
}

// OpenAI 클라이언트 (lazy initialization)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// 메모리 캐시: 온도 구간 + 날씨 + 미세먼지 기반
interface CacheEntry {
  tip: string;
  timestamp: number;
}

const tipCache = new Map<string, CacheEntry>();

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

function getCacheKey(input: StylingTipInput): string {
  const tempZone = getTempZone(input.feelsLike);
  const weatherKey = input.weatherMain.toLowerCase();
  const pm25Bucket = input.pm25 < 36 ? 'good' : input.pm25 < 76 ? 'bad' : 'veryBad';
  return `${tempZone}-${weatherKey}-${pm25Bucket}`;
}

function getCachedTip(key: string): string | null {
  const entry = tipCache.get(key);
  if (!entry) return null;

  // TTL 체크
  if (Date.now() - entry.timestamp > CACHE.TTL) {
    tipCache.delete(key);
    return null;
  }

  return entry.tip;
}

function setCachedTip(key: string, tip: string): void {
  tipCache.set(key, {
    tip,
    timestamp: Date.now(),
  });

  // 캐시 크기 제한 (최대 50개)
  if (tipCache.size > 50) {
    const oldestKey = tipCache.keys().next().value;
    if (oldestKey) {
      tipCache.delete(oldestKey);
    }
  }
}

/**
 * AI 스타일링 팁 생성
 *
 * @param input - 옷차림 및 날씨 데이터
 * @returns 생성된 스타일링 팁 또는 null (실패 시)
 */
export async function generateStylingTip(input: StylingTipInput): Promise<string | null> {
  const cacheKey = getCacheKey(input);

  // 앱 레벨 캐시 확인
  const cached = getCachedTip(cacheKey);
  if (cached) {
    console.log(`[AI Styling Tip] Cache hit: ${cacheKey}`);
    return cached;
  }
  console.log(`[AI Styling Tip] Cache miss: ${cacheKey}`);

  try {
    const client = getOpenAIClient();
    const systemPrompt = getSystemPrompt();
    const userPrompt = buildUserPrompt(input);

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 150,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content?.trim();

    if (raw) {
      const parsed = JSON.parse(raw) as { tip: string };
      if (parsed.tip) {
        setCachedTip(cacheKey, parsed.tip);
        return parsed.tip;
      }
    }

    return null;
  } catch (error) {
    console.error('[AI Styling Tip] Generation failed:', error);
    return null;
  }
}
