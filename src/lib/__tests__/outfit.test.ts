import { describe, it, expect } from 'vitest';
import { getOutfitRecommendation } from '../outfit';
import type { OutfitInput } from '@/types/score';

// 특정 월의 timestamp 생성 헬퍼
function timestampForMonth(month: number): number {
  return new Date(2026, month - 1, 15).getTime();
}

describe('getOutfitRecommendation', () => {
  // 기본 입력값 (2월 = 겨울)
  const baseInput: OutfitInput = {
    temperature: 22,
    tempMin: 18,
    tempMax: 26,
    pm25: 10,
    weatherMain: 'Clear',
    timestamp: timestampForMonth(4), // 4월 = 봄
  };

  describe('temperature-based recommendations', () => {
    it('28℃ 이상 (한여름) → 반팔/린넨/샌들', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 30 });
      expect(result.categories.top).toContain('반팔 티셔츠');
      expect(result.categories.top).toContain('린넨 반팔 셔츠');
      expect(result.categories.bottom).toContain('반바지');
      expect(result.categories.bottom).toContain('린넨 긴바지');
      expect(result.categories.shoes).toContain('샌들');
      expect(result.categories.outer).toBeUndefined();
    });

    it('23~27℃ (초여름) → 반팔 + 얇은 가디건', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 25 });
      expect(result.categories.top).toContain('반팔 티셔츠');
      expect(result.categories.top).toContain('반팔 셔츠');
      expect(result.categories.outer).toContain('얇은 가디건');
      expect(result.categories.bottom).toContain('얇은 청바지');
    });

    it('17~22℃ (봄) → 긴팔 + 바람막이/청자켓', () => {
      const result = getOutfitRecommendation({
        ...baseInput,
        temperature: 20,
        timestamp: timestampForMonth(4),
      });
      expect(result.categories.top).toContain('긴팔 티셔츠');
      expect(result.categories.top).toContain('맨투맨');
      expect(result.categories.outer).toContain('바람막이');
      expect(result.categories.outer).toContain('청자켓');
      expect(result.categories.bottom).toContain('청바지');
    });

    it('12~16℃ (봄 환절기) → 자켓/청자켓/바람막이', () => {
      const result = getOutfitRecommendation({
        ...baseInput,
        temperature: 14,
        timestamp: timestampForMonth(4),
      });
      expect(result.categories.outer).toContain('자켓');
      expect(result.categories.outer).toContain('청자켓');
      expect(result.categories.top).toContain('맨투맨');
    });

    it('6~11℃ (초겨울) → 코트/경량패딩/야상 + 목도리', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 8 });
      expect(result.categories.outer).toContain('울 코트');
      expect(result.categories.outer).toContain('경량패딩');
      expect(result.categories.outer).toContain('야상');
      expect(result.categories.top).toContain('기모 맨투맨');
      expect(result.categories.bottom).toContain('기모 청바지');
      expect(result.categories.accessory).toContain('목도리');
    });

    it('-1℃ (한겨울) → 롱패딩 + 방한용품', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: -1 });
      expect(result.categories.outer).toContain('다운 롱패딩');
      expect(result.categories.accessory).toContain('두꺼운 목도리');
      expect(result.categories.accessory).toContain('장갑');
      expect(result.categories.accessory).toContain('비니');
    });
  });

  describe('seasonal branching', () => {
    it('MILD(20℃) + 봄 → 바람막이, 가디건, 청자켓', () => {
      const result = getOutfitRecommendation({
        ...baseInput,
        temperature: 20,
        timestamp: timestampForMonth(4),
      });
      expect(result.categories.outer).toContain('바람막이');
      expect(result.categories.outer).toContain('가디건');
      expect(result.categories.outer).toContain('청자켓');
      expect(result.categories.top).toContain('셔츠');
    });

    it('MILD(20℃) + 가을 → 니트 가디건, 후드집업, 청자켓', () => {
      const result = getOutfitRecommendation({
        ...baseInput,
        temperature: 20,
        timestamp: timestampForMonth(10),
      });
      expect(result.categories.outer).toContain('니트 가디건');
      expect(result.categories.outer).toContain('후드집업');
      expect(result.categories.outer).toContain('청자켓');
      expect(result.categories.top).toContain('얇은 니트');
      expect(result.categories.bottom).toContain('코듀로이 팬츠');
    });

    it('COOL(14℃) + 봄 → 자켓, 청자켓, 바람막이', () => {
      const result = getOutfitRecommendation({
        ...baseInput,
        temperature: 14,
        timestamp: timestampForMonth(4),
      });
      expect(result.categories.outer).toContain('자켓');
      expect(result.categories.outer).toContain('청자켓');
      expect(result.categories.outer).toContain('바람막이');
      expect(result.categories.top).toContain('후드티');
    });

    it('COOL(14℃) + 가을 → 자켓, 야상, 니트 가디건', () => {
      const result = getOutfitRecommendation({
        ...baseInput,
        temperature: 14,
        timestamp: timestampForMonth(10),
      });
      expect(result.categories.outer).toContain('자켓');
      expect(result.categories.outer).toContain('야상');
      expect(result.categories.outer).toContain('니트 가디건');
      expect(result.categories.top).toContain('울 니트');
      expect(result.categories.bottom).toContain('코듀로이 팬츠');
    });

    it('여름/겨울 fallback → 봄 아이템 사용', () => {
      const resultSummer = getOutfitRecommendation({
        ...baseInput,
        temperature: 20,
        timestamp: timestampForMonth(7),
      });
      expect(resultSummer.categories.outer).toContain('바람막이');

      const resultWinter = getOutfitRecommendation({
        ...baseInput,
        temperature: 14,
        timestamp: timestampForMonth(12),
      });
      expect(resultWinter.categories.outer).toContain('자켓');
    });
  });

  describe('rain gear', () => {
    it('비 올 때 → 방수 자켓 + 레인부츠 추가', () => {
      const result = getOutfitRecommendation({ ...baseInput, weatherMain: 'Rain' });
      expect(result.categories.outer).toContain('방수 자켓');
      expect(result.categories.shoes).toContain('레인부츠');
    });

    it('소나기 → 방수 자켓 + 레인부츠', () => {
      const result = getOutfitRecommendation({ ...baseInput, weatherMain: 'Shower' });
      expect(result.categories.outer).toContain('방수 자켓');
      expect(result.categories.shoes).toContain('레인부츠');
    });

    it('맑음 → 레인부츠 없음', () => {
      const result = getOutfitRecommendation({ ...baseInput, weatherMain: 'Clear' });
      expect(result.categories.shoes).not.toContain('레인부츠');
    });
  });

  describe('alerts', () => {
    it('일교차 10℃ 이상 → 겉옷 알림', () => {
      const result = getOutfitRecommendation({
        ...baseInput,
        tempMin: 10,
        tempMax: 25,
      });
      expect(result.alerts.some((a) => a.includes('아침엔') || a.includes('일교차'))).toBe(true);
    });

    it('일교차 10℃ 미만 → 일교차 알림 없음', () => {
      const result = getOutfitRecommendation({
        ...baseInput,
        tempMin: 18,
        tempMax: 25,
      });
      expect(result.alerts.some((a) => a.includes('아침엔') || a.includes('일교차'))).toBe(false);
    });

    it('PM2.5 36 이상 → 마스크 알림', () => {
      const result = getOutfitRecommendation({ ...baseInput, pm25: 50 });
      expect(result.alerts).toContain('마스크 착용 권장');
    });

    it('PM2.5 35 이하 → 마스크 알림 없음', () => {
      const result = getOutfitRecommendation({ ...baseInput, pm25: 30 });
      expect(result.alerts).not.toContain('마스크 착용 권장');
    });
  });

  describe('edge cases', () => {
    it('경계값 테스트: 28℃ (한여름 시작)', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 28 });
      expect(result.categories.top).toContain('린넨 반팔 셔츠');
    });

    it('경계값 테스트: 27℃ (초여름)', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 27 });
      expect(result.categories.top).toContain('반팔 티셔츠');
    });

    it('경계값 테스트: 5℃ (겨울)', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 5 });
      expect(result.categories.outer).toContain('다운 패딩');
    });

    it('경계값 테스트: 6℃ (초겨울)', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 6 });
      expect(result.categories.outer).toContain('울 코트');
    });

    it('timestamp 없을 때 fallback 동작', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { timestamp: _, ...inputWithoutTimestamp } = baseInput;
      const result = getOutfitRecommendation(inputWithoutTimestamp);
      expect(result.categories).toBeDefined();
    });
  });
});
