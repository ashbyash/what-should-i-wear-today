import { describe, it, expect } from 'vitest';
import { getWeatherEmoji, getTimeCategoryForHour } from '../weather-utils';

describe('getWeatherEmoji', () => {
  it('returns rain emoji for Rain', () => {
    expect(getWeatherEmoji('Rain')).toBe('🌧️');
  });

  it('returns rain emoji for Drizzle', () => {
    expect(getWeatherEmoji('Drizzle')).toBe('🌧️');
  });

  it('returns thunderstorm emoji', () => {
    expect(getWeatherEmoji('Thunderstorm')).toBe('⛈️');
  });

  it('returns snow emoji', () => {
    expect(getWeatherEmoji('Snow')).toBe('❄️');
  });

  it('returns cloud emoji for Mist', () => {
    expect(getWeatherEmoji('Mist')).toBe('☁️');
  });

  it('returns sun emoji for Clear without timeCategory', () => {
    expect(getWeatherEmoji('Clear')).toBe('☀️');
  });

  it('returns moon emoji for Clear at night', () => {
    expect(getWeatherEmoji('Clear', 'night')).toBe('🌙');
  });

  it('returns partly cloudy for Clear at sunrise/sunset', () => {
    expect(getWeatherEmoji('Clear', 'sunrise')).toBe('🌤️');
    expect(getWeatherEmoji('Clear', 'sunset')).toBe('🌤️');
  });

  it('returns cloud emoji for Clouds', () => {
    expect(getWeatherEmoji('Clouds')).toBe('☁️');
  });

  it('returns default emoji for unknown weather without timeCategory', () => {
    expect(getWeatherEmoji('Unknown')).toBe('🌤️');
  });

  it('returns moon for unknown weather at night', () => {
    expect(getWeatherEmoji('Unknown', 'night')).toBe('🌙');
  });
});

describe('getTimeCategoryForHour', () => {
  const SEOUL_LAT = 37.5665;
  const SEOUL_LON = 126.978;
  const KST_OFFSET = 9;

  it('returns "day" for afternoon hours (14:00)', () => {
    expect(getTimeCategoryForHour('14:00', SEOUL_LAT, SEOUL_LON, KST_OFFSET)).toBe('day');
  });

  it('returns "night" for late night hours (02:00)', () => {
    expect(getTimeCategoryForHour('02:00', SEOUL_LAT, SEOUL_LON, KST_OFFSET)).toBe('night');
  });

  it('returns "day" for midday (12:00)', () => {
    expect(getTimeCategoryForHour('12:00', SEOUL_LAT, SEOUL_LON, KST_OFFSET)).toBe('day');
  });

  it('returns "night" for late evening (23:00)', () => {
    expect(getTimeCategoryForHour('23:00', SEOUL_LAT, SEOUL_LON, KST_OFFSET)).toBe('night');
  });
});
