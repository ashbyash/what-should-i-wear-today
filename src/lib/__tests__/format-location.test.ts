import { describe, it, expect } from 'vitest';
import { formatLocation } from '../format-location';
import type { LocationData } from '@/types/weather';

describe('formatLocation', () => {
  it('abbreviates 특별시 from region1 when location data exists', () => {
    const location: LocationData = {
      address: '서울특별시 강남구 역삼동',
      region1: '서울특별시',
      region2: '강남구',
      region3: '역삼동',
    };
    expect(formatLocation(location, null)).toBe('서울 강남구 역삼동');
  });

  it('abbreviates 광역시 from region1', () => {
    const location: LocationData = {
      address: '부산광역시 해운대구 우동',
      region1: '부산광역시',
      region2: '해운대구',
      region3: '우동',
    };
    expect(formatLocation(location, null)).toBe('부산 해운대구 우동');
  });

  it('abbreviates 특별자치시 from region1', () => {
    const location: LocationData = {
      address: '세종특별자치시',
      region1: '세종특별자치시',
      region2: '',
      region3: '',
    };
    expect(formatLocation(location, null)).toBe('세종');
  });

  it('falls back to airQuality stationAddr when location is null', () => {
    const airQuality = {
      stationName: '강남구',
      stationAddr: '서울특별시 강남구 학동로',
      pm10: 30,
      pm25: 15,
      pm10Grade: 'good' as const,
      pm25Grade: 'good' as const,
      dataTime: '2026-04-13 12:00',
    };
    expect(formatLocation(null, airQuality)).toBe('서울 강남구 학동로');
  });

  it('returns "현재 위치" when both are null', () => {
    expect(formatLocation(null, null)).toBe('현재 위치');
  });
});
