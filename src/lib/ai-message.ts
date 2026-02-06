/**
 * AI 점수 메시지 생성 서비스
 *
 * - OpenAI API 통합
 * - 시스템 프롬프트 메모이제이션 (상수 기반이므로 한 번만 생성)
 * - 앱 레벨 메모리 캐시 (동일 점수대 재사용)
 * - OpenAI 서버 사이드 자동 캐싱 (1024 토큰 이상 시스템 프롬프트)
 */

import OpenAI from 'openai';
import { buildSystemPrompt, buildUserPrompt, type ScoreMessageInput } from './prompts/score-message';
import { CACHE } from './constants';

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

// 메모리 캐시: 점수대(10점 단위) + 레벨 기반
interface CacheEntry {
  message: string;
  timestamp: number;
}

const messageCache = new Map<string, CacheEntry>();

function getCacheKey(input: ScoreMessageInput): string {
  // 10점 단위로 버킷팅 + 레벨 + 주요 날씨 조건
  const scoreBucket = Math.floor(input.total / 10) * 10;
  const weatherKey = input.weatherMain.toLowerCase();
  const pm25Bucket = input.pm25 < 36 ? 'good' : input.pm25 < 76 ? 'bad' : 'veryBad';
  return `${scoreBucket}-${input.level}-${weatherKey}-${pm25Bucket}`;
}

function getCachedMessage(key: string): string | null {
  const entry = messageCache.get(key);
  if (!entry) return null;

  // TTL 체크
  if (Date.now() - entry.timestamp > CACHE.TTL) {
    messageCache.delete(key);
    return null;
  }

  return entry.message;
}

function setCachedMessage(key: string, message: string): void {
  messageCache.set(key, {
    message,
    timestamp: Date.now(),
  });

  // 캐시 크기 제한 (최대 50개)
  if (messageCache.size > 50) {
    const oldestKey = messageCache.keys().next().value;
    if (oldestKey) {
      messageCache.delete(oldestKey);
    }
  }
}

/**
 * AI 점수 메시지 생성
 *
 * @param input - 점수 및 날씨 데이터
 * @returns 생성된 메시지 또는 null (실패 시)
 */
export async function generateScoreMessage(input: ScoreMessageInput): Promise<string | null> {
  const cacheKey = getCacheKey(input);

  // 앱 레벨 캐시 확인
  const cached = getCachedMessage(cacheKey);
  if (cached) {
    console.log(`[AI Message] Cache hit: ${cacheKey}`);
    return cached;
  }
  console.log(`[AI Message] Cache miss: ${cacheKey}`);

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
      max_tokens: 100,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content?.trim();

    if (raw) {
      const parsed = JSON.parse(raw) as { message: string };
      if (parsed.message) {
        setCachedMessage(cacheKey, parsed.message);
        return parsed.message;
      }
    }

    return null;
  } catch (error) {
    console.error('[AI Message] Generation failed:', error);
    return null;
  }
}
