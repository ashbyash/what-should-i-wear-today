import { describe, it, expect } from 'vitest';
import { getOutfitRecommendation } from '../outfit';
import type { OutfitInput } from '@/types/score';

describe('getOutfitRecommendation', () => {
  // 기본 입력값
  const baseInput: OutfitInput = {
    temperature: 22,
    tempMin: 18,
    tempMax: 26,
    pm25: 10,
    weatherMain: 'Clear',
  };

  describe('temperature-based recommendations', () => {
    it('28℃ 이상 (한여름) → 린넨/반팔/샌들', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 30 });
      expect(result.categories.top).toContain('린넨 반팔 셔츠');
      expect(result.categories.bottom).toContain('면 반바지');
      expect(result.categories.shoes).toContain('샌들');
      expect(result.categories.outer).toBeUndefined();
    });

    it('23~27℃ (초여름) → 반팔 + 얇은 가디건', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 25 });
      expect(result.categories.top).toContain('면 반팔 티셔츠');
      expect(result.categories.outer).toContain('얇은 가디건');
    });

    it('17~22℃ (봄/가을) → 긴팔 + 바람막이', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 20 });
      expect(result.categories.top).toContain('면 긴팔 티셔츠');
      expect(result.categories.outer).toContain('나일론 바람막이');
      expect(result.categories.bottom).toContain('청바지');
    });

    it('12~16℃ (환절기) → 맨투맨 + 자켓', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 14 });
      expect(result.categories.top).toContain('쭈리 맨투맨');
      expect(result.categories.outer).toContain('면 자켓');
    });

    it('6~11℃ (초겨울) → 코트 + 목도리', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 8 });
      expect(result.categories.outer).toContain('울 코트');
      expect(result.categories.top).toContain('기모 맨투맨');
      expect(result.categories.accessory).toContain('목도리');
    });

    it('5℃ 이하 (한겨울) → 롱패딩 + 방한용품', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 0 });
      expect(result.categories.outer).toContain('다운 롱패딩');
      expect(result.categories.accessory).toContain('목도리');
      expect(result.categories.accessory).toContain('장갑');
      expect(result.categories.accessory).toContain('비니');
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
      expect(result.alerts).toContain('일교차가 커요, 겉옷 챙기세요');
    });

    it('일교차 10℃ 미만 → 알림 없음', () => {
      const result = getOutfitRecommendation({
        ...baseInput,
        tempMin: 18,
        tempMax: 25,
      });
      expect(result.alerts).not.toContain('일교차가 커요, 겉옷 챙기세요');
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
      expect(result.categories.top).toContain('면 반팔 티셔츠');
    });

    it('경계값 테스트: 5℃ (한겨울 시작)', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 5 });
      expect(result.categories.outer).toContain('다운 롱패딩');
    });

    it('경계값 테스트: 6℃ (초겨울)', () => {
      const result = getOutfitRecommendation({ ...baseInput, temperature: 6 });
      expect(result.categories.outer).toContain('울 코트');
    });
  });
});
