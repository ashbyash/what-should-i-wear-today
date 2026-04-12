import { describe, it, expect } from 'vitest';
import {
  getPM25Level,
  getPM25Color,
  getUVLevel,
  getUVColor,
  getHumidityDescription,
  getWindDescription,
} from '../weather-format';

describe('getPM25Level', () => {
  it('returns 좋음 for pm25 <= 15', () => {
    expect(getPM25Level(0)).toBe('좋음');
    expect(getPM25Level(15)).toBe('좋음');
  });
  it('returns 보통 for pm25 16-35', () => {
    expect(getPM25Level(16)).toBe('보통');
    expect(getPM25Level(35)).toBe('보통');
  });
  it('returns 나쁨 for pm25 36-75', () => {
    expect(getPM25Level(36)).toBe('나쁨');
    expect(getPM25Level(75)).toBe('나쁨');
  });
  it('returns 매우나쁨 for pm25 > 75', () => {
    expect(getPM25Level(76)).toBe('매우나쁨');
  });
});

describe('getPM25Color', () => {
  it('returns good color for low pm25', () => {
    expect(getPM25Color(10)).toBe('#4ade80');
  });
  it('returns moderate color for medium pm25', () => {
    expect(getPM25Color(25)).toBe('#fbbf24');
  });
  it('returns bad color for high pm25', () => {
    expect(getPM25Color(50)).toBe('#f87171');
  });
});

describe('getUVLevel', () => {
  it('returns 낮음 for uv <= 2', () => {
    expect(getUVLevel(0)).toBe('낮음');
    expect(getUVLevel(2)).toBe('낮음');
  });
  it('returns 보통 for uv 3-5', () => {
    expect(getUVLevel(3)).toBe('보통');
    expect(getUVLevel(5)).toBe('보통');
  });
  it('returns 높음 for uv 6-7', () => {
    expect(getUVLevel(6)).toBe('높음');
    expect(getUVLevel(7)).toBe('높음');
  });
  it('returns 매우높음 for uv 8-10', () => {
    expect(getUVLevel(8)).toBe('매우높음');
    expect(getUVLevel(10)).toBe('매우높음');
  });
  it('returns 위험 for uv > 10', () => {
    expect(getUVLevel(11)).toBe('위험');
  });
});

describe('getUVColor', () => {
  it('returns good color for low uv', () => {
    expect(getUVColor(1)).toBe('#4ade80');
  });
  it('returns moderate color for medium uv', () => {
    expect(getUVColor(4)).toBe('#fbbf24');
  });
  it('returns bad color for high uv', () => {
    expect(getUVColor(8)).toBe('#f87171');
  });
});

describe('getHumidityDescription', () => {
  it('returns 데이터 없음 for undefined', () => {
    expect(getHumidityDescription(undefined)).toBe('데이터 없음');
  });
  it('returns 건조한 편 for low humidity', () => {
    expect(getHumidityDescription(30)).toBe('건조한 편');
  });
  it('returns 쾌적한 수준 for normal humidity', () => {
    expect(getHumidityDescription(50)).toBe('쾌적한 수준');
  });
  it('returns 습한 편 for high humidity', () => {
    expect(getHumidityDescription(70)).toBe('습한 편');
  });
});

describe('getWindDescription', () => {
  it('returns 데이터 없음 for undefined', () => {
    expect(getWindDescription(undefined)).toBe('데이터 없음');
  });
  it('returns 바람 거의 없음 for < 2', () => {
    expect(getWindDescription(1)).toBe('바람 거의 없음');
  });
  it('returns 산들바람 for 2-4', () => {
    expect(getWindDescription(3)).toBe('산들바람');
  });
  it('returns 약간 강한 바람 for 5-7', () => {
    expect(getWindDescription(6)).toBe('약간 강한 바람');
  });
  it('returns 강풍 for >= 8', () => {
    expect(getWindDescription(10)).toBe('강풍');
  });
});
