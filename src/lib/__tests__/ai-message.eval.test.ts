// @vitest-environment node
/**
 * AI 메시지 품질 Eval 테스트
 *
 * 실제 OpenAI API를 호출하므로 일반 테스트와 분리
 * 실행: npm run eval
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserPrompt, type ScoreMessageInput } from '../prompts/score-message';

// .env.local 로드 (vitest는 자동 로드하지 않음)
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // 따옴표 제거 ("value" or 'value')
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // .env.local 없으면 무시
}

// ============================================
// Eval 체커 함수들
// ============================================

interface EvalCheck {
  name: string;
  fn: (message: string) => boolean;
}

const EVAL_CHECKS: EvalCheck[] = [
  {
    name: 'Length ≤ 30',
    fn: (msg) => msg.length <= 30,
  },
  {
    name: 'Korean',
    fn: (msg) => /[가-힣]/.test(msg),
  },
  {
    name: 'Polite ending',
    fn: (msg) => /요[.!]?$/.test(msg),
  },
  {
    name: 'No score number',
    fn: (msg) => !/\d+점/.test(msg),
  },
  {
    name: 'No emoji',
    fn: (msg) => !/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(msg),
  },
];

// ============================================
// 테스트 케이스 (8개)
// ============================================

interface EvalCase {
  name: string;
  input: ScoreMessageInput;
}

const EVAL_CASES: EvalCase[] = [
  {
    name: '완벽한 봄날',
    input: {
      total: 92, level: 'perfect',
      breakdown: { feelsLikeTemp: 65, weather: 15, fineDust: 10, uv: 3, humidity: 5, windPenalty: 0 },
      temperature: 22, feelsLike: 21, weatherMain: 'Clear', pm25: 8,
      humidity: 55, windSpeed: 2, uvIndex: 3,
    },
  },
  {
    name: '혹한 + 눈 + 강풍',
    input: {
      total: 15, level: 'bad',
      breakdown: { feelsLikeTemp: 0, weather: 0, fineDust: 3, uv: 5, humidity: 1, windPenalty: -10 },
      temperature: -5, feelsLike: -12, weatherMain: 'Snow', pm25: 45,
      humidity: 78, windSpeed: 12, uvIndex: 1,
    },
  },
  {
    name: '무더위 + 고습도',
    input: {
      total: 38, level: 'poor',
      breakdown: { feelsLikeTemp: 24, weather: 15, fineDust: 10, uv: 1, humidity: 1, windPenalty: 0 },
      temperature: 35, feelsLike: 39, weatherMain: 'Clear', pm25: 10,
      humidity: 82, windSpeed: 1, uvIndex: 9,
    },
  },
  {
    name: '비 오는 날',
    input: {
      total: 48, level: 'moderate',
      breakdown: { feelsLikeTemp: 47, weather: 0, fineDust: 7, uv: 3, humidity: 3, windPenalty: -5 },
      temperature: 15, feelsLike: 13, weatherMain: 'Rain', pm25: 20,
      humidity: 72, windSpeed: 6, uvIndex: 2,
    },
  },
  {
    name: '겨울 맑음',
    input: {
      total: 62, level: 'fair',
      breakdown: { feelsLikeTemp: 47, weather: 15, fineDust: 10, uv: 5, humidity: 3, windPenalty: 0 },
      temperature: 3, feelsLike: 0, weatherMain: 'Clear', pm25: 10,
      humidity: 28, windSpeed: 3, uvIndex: 1,
    },
  },
  {
    name: '미세먼지 최악',
    input: {
      total: 55, level: 'moderate',
      breakdown: { feelsLikeTemp: 65, weather: 15, fineDust: 0, uv: 3, humidity: 5, windPenalty: 0 },
      temperature: 20, feelsLike: 20, weatherMain: 'Clear', pm25: 90,
      humidity: 50, windSpeed: 2, uvIndex: 3,
    },
  },
  {
    name: 'UV 매우 높음',
    input: {
      total: 65, level: 'fair',
      breakdown: { feelsLikeTemp: 47, weather: 15, fineDust: 10, uv: 0, humidity: 3, windPenalty: 0 },
      temperature: 28, feelsLike: 31, weatherMain: 'Clear', pm25: 12,
      humidity: 65, windSpeed: 2, uvIndex: 11,
    },
  },
  {
    name: '보통 흐린 날',
    input: {
      total: 72, level: 'good',
      breakdown: { feelsLikeTemp: 65, weather: 11, fineDust: 7, uv: 3, humidity: 5, windPenalty: 0 },
      temperature: 18, feelsLike: 17, weatherMain: 'Clouds', pm25: 25,
      humidity: 55, windSpeed: 3, uvIndex: 4,
    },
  },
];

// ============================================
// API 호출 함수
// ============================================

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  return response.choices[0]?.message?.content?.trim() ?? '';
}

// ============================================
// Eval 실행
// ============================================

const hasApiKey = !!process.env.OPENAI_API_KEY;

describe.skipIf(!hasApiKey)('AI Message Eval', () => {
  const systemPrompt = buildSystemPrompt();
  const results: { name: string; message: string; checks: Record<string, boolean> }[] = [];

  for (const evalCase of EVAL_CASES) {
    it(`[${evalCase.name}] 품질 기준 통과`, async () => {
      const userPrompt = buildUserPrompt(evalCase.input);
      const raw = await callOpenAI(systemPrompt, userPrompt);

      // JSON 파싱
      let message: string;
      try {
        const parsed = JSON.parse(raw) as { message: string };
        expect(parsed.message).toBeDefined();
        message = parsed.message;
      } catch {
        throw new Error(`JSON parse failed: ${raw}`);
      }

      // 체커 실행
      const checkResults: Record<string, boolean> = { 'JSON valid': true };
      const failures: string[] = [];

      for (const check of EVAL_CHECKS) {
        const passed = check.fn(message);
        checkResults[check.name] = passed;
        if (!passed) {
          failures.push(check.name);
        }
      }

      // 결과 저장 (리포트용)
      results.push({ name: evalCase.name, message, checks: checkResults });

      // 로그 출력
      const checkStr = Object.entries(checkResults)
        .map(([k, v]) => `${v ? '✓' : '✗'} ${k}`)
        .join('  ');
      console.log(`  [${evalCase.name}] "${message}" (${message.length}자)`);
      console.log(`    ${checkStr}`);

      // 실패 시 메시지 포함
      if (failures.length > 0) {
        expect.soft(failures, `Failed checks for "${message}"`).toHaveLength(0);
      }
    }, 15000); // API 호출 타임아웃 15초
  }

  it('종합 리포트', () => {
    if (results.length === 0) return;

    console.log('\n  ===== Eval Report =====');

    let totalChecks = 0;
    let passedChecks = 0;

    for (const r of results) {
      const checks = Object.values(r.checks);
      totalChecks += checks.length;
      passedChecks += checks.filter(Boolean).length;
    }

    const passRate = ((passedChecks / totalChecks) * 100).toFixed(1);
    console.log(`  Cases: ${results.length}/${EVAL_CASES.length}`);
    console.log(`  Checks: ${passedChecks}/${totalChecks} (${passRate}%)`);
    console.log('  ========================\n');

    // 체크별 통과율
    const checkNames = ['JSON valid', ...EVAL_CHECKS.map(c => c.name)];
    for (const checkName of checkNames) {
      const passed = results.filter(r => r.checks[checkName]).length;
      console.log(`    ${checkName}: ${passed}/${results.length}`);
    }
  });
});
