import { describe, it, expect } from 'vitest';
import { calculateOutingScore } from '../score';
import type { ScoreInput } from '@/types/score';

describe('calculateOutingScore', () => {
  // 기본 입력값
  const baseInput: ScoreInput = {
    temperature: 22,
    tempMin: 18,
    tempMax: 26,
    pm25: 10,
    weatherMain: 'Clear',
    uvIndex: 2,
  };

  describe('temperature scoring (60점 만점)', () => {
    it('쾌적 구간(20~26℃) → 60점', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 23 });
      expect(result.breakdown.temperature).toBe(60);
    });

    it('양호 구간(12~19℃) → 40점', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 15 });
      expect(result.breakdown.temperature).toBe(40);
    });

    it('양호 구간(27~32℃) → 40점', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 30 });
      expect(result.breakdown.temperature).toBe(40);
    });

    it('주의 구간(5~11℃) → 20점', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 8 });
      expect(result.breakdown.temperature).toBe(20);
    });

    it('주의 구간(33~36℃) → 20점', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 35 });
      expect(result.breakdown.temperature).toBe(20);
    });

    it('극한 온도(5℃ 미만) → 0점', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 0 });
      expect(result.breakdown.temperature).toBe(0);
    });

    it('극한 온도(37℃ 이상) → 0점', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 40 });
      expect(result.breakdown.temperature).toBe(0);
    });
  });

  describe('weather scoring (20점 만점)', () => {
    it('맑음(Clear) → 20점', () => {
      const result = calculateOutingScore({ ...baseInput, weatherMain: 'Clear' });
      expect(result.breakdown.weather).toBe(20);
    });

    it('구름(Clouds) → 14점', () => {
      const result = calculateOutingScore({ ...baseInput, weatherMain: 'Clouds' });
      expect(result.breakdown.weather).toBe(14);
    });

    it('흐림(Overcast) → 8점', () => {
      const result = calculateOutingScore({ ...baseInput, weatherMain: 'Overcast' });
      expect(result.breakdown.weather).toBe(8);
    });

    it('비(Rain) → 0점', () => {
      const result = calculateOutingScore({ ...baseInput, weatherMain: 'Rain' });
      expect(result.breakdown.weather).toBe(0);
    });

    it('눈(Snow) → 0점', () => {
      const result = calculateOutingScore({ ...baseInput, weatherMain: 'Snow' });
      expect(result.breakdown.weather).toBe(0);
    });
  });

  describe('fine dust scoring (15점 만점, PM2.5 기준)', () => {
    it('좋음(0~15) → 15점', () => {
      const result = calculateOutingScore({ ...baseInput, pm25: 10 });
      expect(result.breakdown.fineDust).toBe(15);
    });

    it('보통(16~35) → 10점', () => {
      const result = calculateOutingScore({ ...baseInput, pm25: 25 });
      expect(result.breakdown.fineDust).toBe(10);
    });

    it('나쁨(36~75) → 5점', () => {
      const result = calculateOutingScore({ ...baseInput, pm25: 50 });
      expect(result.breakdown.fineDust).toBe(5);
    });

    it('매우나쁨(76+) → 0점', () => {
      const result = calculateOutingScore({ ...baseInput, pm25: 100 });
      expect(result.breakdown.fineDust).toBe(0);
    });
  });

  describe('UV scoring (5점 만점)', () => {
    it('낮음(0~2) → 5점', () => {
      const result = calculateOutingScore({ ...baseInput, uvIndex: 2 });
      expect(result.breakdown.uv).toBe(5);
    });

    it('보통(3~5) → 3점', () => {
      const result = calculateOutingScore({ ...baseInput, uvIndex: 4 });
      expect(result.breakdown.uv).toBe(3);
    });

    it('높음(6~7) → 2점', () => {
      const result = calculateOutingScore({ ...baseInput, uvIndex: 7 });
      expect(result.breakdown.uv).toBe(2);
    });

    it('매우높음(8~10) → 1점', () => {
      const result = calculateOutingScore({ ...baseInput, uvIndex: 9 });
      expect(result.breakdown.uv).toBe(1);
    });

    it('위험(11+) → 0점', () => {
      const result = calculateOutingScore({ ...baseInput, uvIndex: 12 });
      expect(result.breakdown.uv).toBe(0);
    });

    it('UV 정보 없음 → 3점 (기본값)', () => {
      const result = calculateOutingScore({ ...baseInput, uvIndex: undefined });
      expect(result.breakdown.uv).toBe(3);
    });
  });

  describe('total score & level', () => {
    it('최적 조건 → 100점, perfect', () => {
      const result = calculateOutingScore({
        ...baseInput,
        temperature: 23,
        weatherMain: 'Clear',
        pm25: 10,
        uvIndex: 1,
      });
      expect(result.total).toBe(100);
      expect(result.level).toBe('perfect');
    });

    it('90점 이상 → perfect', () => {
      const result = calculateOutingScore({
        ...baseInput,
        temperature: 23,
        weatherMain: 'Clear',
        pm25: 20, // 보통 → 10점
        uvIndex: 1,
      });
      expect(result.total).toBe(95);
      expect(result.level).toBe('perfect');
    });

    it('80~89점 → excellent', () => {
      const result = calculateOutingScore({
        ...baseInput,
        temperature: 23,
        weatherMain: 'Clouds', // 14점
        pm25: 10,
        uvIndex: 1,
      });
      expect(result.total).toBe(94);
      expect(result.level).toBe('perfect');
    });

    it('악조건 → bad', () => {
      const result = calculateOutingScore({
        ...baseInput,
        temperature: 40, // 0점
        weatherMain: 'Rain', // 0점
        pm25: 100, // 0점
        uvIndex: 12, // 0점
      });
      expect(result.total).toBe(0);
      expect(result.level).toBe('bad');
    });
  });

  describe('tips', () => {
    it('저온(5℃ 이하) → 방한용품 팁', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 3 });
      expect(result.tips).toContain('방한용품 챙기세요');
    });

    it('고온(33℃ 이상) → 수분 섭취 팁', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 35 });
      expect(result.tips).toContain('수분 섭취에 신경 쓰세요');
    });

    it('미세먼지 나쁨(36+) → 마스크 팁', () => {
      const result = calculateOutingScore({ ...baseInput, pm25: 50 });
      expect(result.tips).toContain('마스크 챙기세요');
    });

    it('자외선 높음(6+) → 선크림 팁', () => {
      const result = calculateOutingScore({ ...baseInput, uvIndex: 7 });
      expect(result.tips).toContain('선크림 바르세요');
    });

    it('비 → 우산 팁', () => {
      const result = calculateOutingScore({ ...baseInput, weatherMain: 'Rain' });
      expect(result.tips).toContain('우산 챙기세요');
    });
  });
});
