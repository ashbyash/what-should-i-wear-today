/**
 * AI 점수 메시지 생성 서비스
 *
 * - OpenAI API 통합
 * - 메모리 캐시 (동일 점수대 재사용)
 */

import OpenAI from 'openai';
import { buildSystemPrompt, buildUserPrompt, type ScoreMessageInput } from './prompts/score-message';
import { CACHE } from './constants';

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

  // 캐시 확인
  const cached = getCachedMessage(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const client = getOpenAIClient();
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(input);

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const message = response.choices[0]?.message?.content?.trim();

    if (message) {
      setCachedMessage(cacheKey, message);
      return message;
    }

    return null;
  } catch (error) {
    console.error('[AI Message] Generation failed:', error);
    return null;
  }
}
