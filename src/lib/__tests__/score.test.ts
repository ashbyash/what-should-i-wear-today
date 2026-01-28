import { describe, it, expect } from 'vitest';
import { calculateOutingScore } from '../score';
import type { ScoreInput } from '@/types/score';

describe('calculateOutingScore', () => {
  // 기본 입력값 (봄/가을 기준, 오후 시간대)
  const baseInput: ScoreInput = {
    temperature: 20,
    tempMin: 15,
    tempMax: 25,
    pm25: 10,
    weatherMain: 'Clear',
    uvIndex: 2,
    humidity: 50,
    windSpeed: 2,
    timestamp: new Date('2024-04-15T14:00:00').getTime(), // 4월 14시 (봄, 오후)
  };

  describe('체감온도 점수 (65점 만점, 계절별 기준)', () => {
    it('봄/가을 쾌적 구간(15~23℃) → 65점', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 20 });
      expect(result.breakdown.feelsLikeTemp).toBe(65);
    });

    it('봄/가을 양호 구간(10~14℃) → 47점', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 12 });
      expect(result.breakdown.feelsLikeTemp).toBe(47);
    });

    it('봄/가을 양호 구간(24~27℃) → 47점', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 25 });
      expect(result.breakdown.feelsLikeTemp).toBe(47);
    });

    it('봄/가을 주의 구간(5~9℃) → 24점', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 7 });
      expect(result.breakdown.feelsLikeTemp).toBe(24);
    });

    it('봄/가을 위험 구간(5℃ 미만) → 0점', () => {
      const result = calculateOutingScore({ ...baseInput, temperature: 2 });
      expect(result.breakdown.feelsLikeTemp).toBe(0);
    });

    it('여름 쾌적 구간(22~28℃) → 65점', () => {
      const summerInput = {
        ...baseInput,
        temperature: 25,
        timestamp: new Date('2024-07-15T14:00:00').getTime(), // 7월 (여름)
      };
      const result = calculateOutingScore(summerInput);
      expect(result.breakdown.feelsLikeTemp).toBe(65);
    });

    it('겨울 쾌적 구간(0~10℃) → 65점', () => {
      const winterInput = {
        ...baseInput,
        temperature: 5,
        timestamp: new Date('2024-01-15T14:00:00').getTime(), // 1월 (겨울)
      };
      const result = calculateOutingScore(winterInput);
      expect(result.breakdown.feelsLikeTemp).toBe(65);
    });
  });

  describe('체감온도 계산 (Wind Chill & Heat Index)', () => {
    it('한랭 + 강풍 → Wind Chill 적용', () => {
      const coldWindyInput = {
        ...baseInput,
        temperature: 5,
        windSpeed: 10, // 강풍
        timestamp: new Date('2024-01-15T14:00:00').getTime(), // 겨울
      };
      const result = calculateOutingScore(coldWindyInput);
      // Wind Chill로 체감온도 낮아짐 → 점수 하락
      expect(result.breakdown.feelsLikeTemp).toBeLessThanOrEqual(47);
    });

    it('무더위 + 고습도 → Heat Index 적용', () => {
      const hotHumidInput = {
        ...baseInput,
        temperature: 32,
        humidity: 80, // 고습도
        timestamp: new Date('2024-07-15T14:00:00').getTime(), // 여름
      };
      const result = calculateOutingScore(hotHumidInput);
      // Heat Index로 체감온도 높아짐 → 점수 하락
      expect(result.breakdown.feelsLikeTemp).toBeLessThanOrEqual(47);
    });
  });

  describe('날씨 점수 (15점 만점)', () => {
    it('맑음(Clear) → 15점', () => {
      const result = calculateOutingScore({ ...baseInput, weatherMain: 'Clear' });
      expect(result.breakdown.weather).toBe(15);
    });

    it('구름(Clouds) → 11점', () => {
      const result = calculateOutingScore({ ...baseInput, weatherMain: 'Clouds' });
      expect(result.breakdown.weather).toBe(11);
    });

    it('흐림(Overcast) → 6점', () => {
      const result = calculateOutingScore({ ...baseInput, weatherMain: 'Overcast' });
      expect(result.breakdown.weather).toBe(6);
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

  describe('미세먼지 점수 (10점 만점, PM2.5 기준)', () => {
    it('좋음(0~15) → 10점', () => {
      const result = calculateOutingScore({ ...baseInput, pm25: 10 });
      expect(result.breakdown.fineDust).toBe(10);
    });

    it('보통(16~35) → 7점', () => {
      const result = calculateOutingScore({ ...baseInput, pm25: 25 });
      expect(result.breakdown.fineDust).toBe(7);
    });

    it('나쁨(36~75) → 3점', () => {
      const result = calculateOutingScore({ ...baseInput, pm25: 50 });
      expect(result.breakdown.fineDust).toBe(3);
    });

    it('매우나쁨(76+) → 0점', () => {
      const result = calculateOutingScore({ ...baseInput, pm25: 100 });
      expect(result.breakdown.fineDust).toBe(0);
    });
  });

  describe('UV 점수 (5점 만점, 시간대 배율 적용)', () => {
    it('오후(12-17시) + 낮은 UV → 배율 적용 후 점수', () => {
      const afternoonInput = {
        ...baseInput,
        uvIndex: 2,
        timestamp: new Date('2024-04-15T14:00:00').getTime(), // 오후
      };
      const result = calculateOutingScore(afternoonInput);
      // UV 2 * 1.5 = 3 → 보통 범위 → 3점
      expect(result.breakdown.uv).toBe(3);
    });

    it('아침(6-11시) + 높은 UV → 배율 낮아서 점수 상승', () => {
      const morningInput = {
        ...baseInput,
        uvIndex: 6, // 원래 높음(6~7) 범위
        timestamp: new Date('2024-04-15T09:00:00').getTime(), // 아침
      };
      const result = calculateOutingScore(morningInput);
      // UV 6 * 0.3 = 1.8 → 낮음 범위(0~2) → 5점
      expect(result.breakdown.uv).toBe(5);
    });

    it('밤(21-5시) → UV 무시 (0배율)', () => {
      const nightInput = {
        ...baseInput,
        uvIndex: 10,
        timestamp: new Date('2024-04-15T23:00:00').getTime(), // 밤
      };
      const result = calculateOutingScore(nightInput);
      // UV 10 * 0 = 0 → 낮음 범위 → 5점
      expect(result.breakdown.uv).toBe(5);
    });

    it('UV 정보 없음 → 3점 (기본값)', () => {
      const result = calculateOutingScore({ ...baseInput, uvIndex: undefined });
      expect(result.breakdown.uv).toBe(3);
    });
  });

  describe('습도 점수 (5점 만점, 계절별 기준)', () => {
    // 봄/가을 기준 (baseInput은 4월)
    it('봄/가을 쾌적 구간(40~60%) → 5점', () => {
      const result = calculateOutingScore({ ...baseInput, humidity: 50 });
      expect(result.breakdown.humidity).toBe(5);
    });

    it('봄/가을 양호 구간(30~39%, 61~70%) → 3점', () => {
      const result = calculateOutingScore({ ...baseInput, humidity: 35 });
      expect(result.breakdown.humidity).toBe(3);
    });

    it('봄/가을 불쾌 구간(30% 미만) → 1점', () => {
      const result = calculateOutingScore({ ...baseInput, humidity: 20 });
      expect(result.breakdown.humidity).toBe(1);
    });

    it('봄/가을 불쾌 구간(70% 초과) → 1점', () => {
      const result = calculateOutingScore({ ...baseInput, humidity: 85 });
      expect(result.breakdown.humidity).toBe(1);
    });

    // 여름 기준 (고습도에 민감)
    it('여름 쾌적 구간(50~65%) → 5점', () => {
      const summerInput = {
        ...baseInput,
        humidity: 55,
        timestamp: new Date('2024-07-15T14:00:00').getTime(),
      };
      const result = calculateOutingScore(summerInput);
      expect(result.breakdown.humidity).toBe(5);
    });

    it('여름 양호 구간(40~49%, 66~75%) → 3점', () => {
      const summerInput = {
        ...baseInput,
        humidity: 70,
        timestamp: new Date('2024-07-15T14:00:00').getTime(),
      };
      const result = calculateOutingScore(summerInput);
      expect(result.breakdown.humidity).toBe(3);
    });

    it('여름 불쾌 구간(75% 초과) → 1점', () => {
      const summerInput = {
        ...baseInput,
        humidity: 80,
        timestamp: new Date('2024-07-15T14:00:00').getTime(),
      };
      const result = calculateOutingScore(summerInput);
      expect(result.breakdown.humidity).toBe(1);
    });

    // 겨울 기준 (건조함에 민감)
    it('겨울 쾌적 구간(35~55%) → 5점', () => {
      const winterInput = {
        ...baseInput,
        humidity: 45,
        timestamp: new Date('2024-01-15T14:00:00').getTime(),
      };
      const result = calculateOutingScore(winterInput);
      expect(result.breakdown.humidity).toBe(5);
    });

    it('겨울 양호 구간(25~34%, 56~65%) → 3점', () => {
      const winterInput = {
        ...baseInput,
        humidity: 30,
        timestamp: new Date('2024-01-15T14:00:00').getTime(),
      };
      const result = calculateOutingScore(winterInput);
      expect(result.breakdown.humidity).toBe(3);
    });

    it('겨울 불쾌 구간(25% 미만) → 1점', () => {
      const winterInput = {
        ...baseInput,
        humidity: 20,
        timestamp: new Date('2024-01-15T14:00:00').getTime(),
      };
      const result = calculateOutingScore(winterInput);
      expect(result.breakdown.humidity).toBe(1);
    });

    it('습도 정보 없음 → 3점 (기본값)', () => {
      const result = calculateOutingScore({ ...baseInput, humidity: undefined });
      expect(result.breakdown.humidity).toBe(3);
    });
  });

  describe('풍속 페널티 (0 ~ -10점)', () => {
    it('약풍(5m/s 미만) → 0점 (페널티 없음)', () => {
      const result = calculateOutingScore({ ...baseInput, windSpeed: 3 });
      expect(result.breakdown.windPenalty).toBe(0);
    });

    it('중풍(5~7m/s) → -5점', () => {
      const result = calculateOutingScore({ ...baseInput, windSpeed: 6 });
      expect(result.breakdown.windPenalty).toBe(-5);
    });

    it('강풍(8m/s 이상) → -10점', () => {
      const result = calculateOutingScore({ ...baseInput, windSpeed: 10 });
      expect(result.breakdown.windPenalty).toBe(-10);
    });

    it('풍속 정보 없음 → 0점 (페널티 없음)', () => {
      const result = calculateOutingScore({ ...baseInput, windSpeed: undefined });
      expect(result.breakdown.windPenalty).toBe(0);
    });
  });

  describe('랜덤 변동 (±2점)', () => {
    it('같은 분 내 동일 timestamp → 같은 점수', () => {
      const timestamp = new Date('2024-04-15T14:30:00').getTime();
      const result1 = calculateOutingScore({ ...baseInput, timestamp });
      const result2 = calculateOutingScore({ ...baseInput, timestamp });
      expect(result1.total).toBe(result2.total);
    });

    it('1분 차이 timestamp → 다른 점수 가능', () => {
      const timestamp1 = new Date('2024-04-15T14:30:00').getTime();
      const timestamp2 = new Date('2024-04-15T14:31:00').getTime();
      const result1 = calculateOutingScore({ ...baseInput, timestamp: timestamp1 });
      const result2 = calculateOutingScore({ ...baseInput, timestamp: timestamp2 });
      // 변동 범위가 ±2이므로 최대 4점 차이
      expect(Math.abs(result1.total - result2.total)).toBeLessThanOrEqual(4);
    });

    it('점수는 0-100 범위 내', () => {
      // 악조건으로 기본 점수가 낮아도 음수가 되면 안됨
      const badInput = {
        ...baseInput,
        temperature: 40,
        weatherMain: 'Rain',
        pm25: 100,
        uvIndex: 12,
        humidity: 90,
        windSpeed: 15,
      };
      const result = calculateOutingScore(badInput);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.total).toBeLessThanOrEqual(100);
    });
  });

  describe('메시지 다양성', () => {
    it('같은 레벨이라도 시간에 따라 다른 메시지 가능', () => {
      const messages = new Set<string>();
      // 3분 동안의 메시지 수집
      for (let i = 0; i < 3; i++) {
        const timestamp = new Date('2024-04-15T14:00:00').getTime() + i * 60000;
        const result = calculateOutingScore({ ...baseInput, timestamp });
        messages.add(result.message);
      }
      // 레벨당 3개 메시지이므로 최대 3개
      expect(messages.size).toBeGreaterThanOrEqual(1);
      expect(messages.size).toBeLessThanOrEqual(3);
    });
  });

  describe('레벨 판정', () => {
    it('90점 이상 → perfect', () => {
      const result = calculateOutingScore({
        ...baseInput,
        temperature: 20,
        weatherMain: 'Clear',
        pm25: 10,
        uvIndex: 1,
        humidity: 50,
        windSpeed: 0,
      });
      // 기본 점수가 높을 때
      expect(['perfect', 'excellent']).toContain(result.level);
    });

    it('악조건 → bad', () => {
      const result = calculateOutingScore({
        ...baseInput,
        temperature: 45,
        weatherMain: 'Rain',
        pm25: 100,
        uvIndex: 12,
        humidity: 95,
        windSpeed: 15,
      });
      expect(result.level).toBe('bad');
    });
  });

  describe('팁 메시지', () => {
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

  describe('하위 호환성', () => {
    it('신규 필드 없이도 동작', () => {
      const minimalInput: ScoreInput = {
        temperature: 22,
        tempMin: 18,
        tempMax: 26,
        pm25: 10,
        weatherMain: 'Clear',
      };
      const result = calculateOutingScore(minimalInput);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.level).toBeDefined();
      expect(result.message).toBeDefined();
    });
  });
});
