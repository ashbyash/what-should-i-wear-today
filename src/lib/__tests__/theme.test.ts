import { describe, it, expect } from 'vitest';
import {
  getSeason,
  getWeatherType,
  getTimeOfDay,
  getTimeGreeting,
  getSeasonGreeting,
  getThemeConfig,
  getGradientStyle,
  TIME_GRADIENTS,
  WEATHER_OVERLAYS,
} from '../theme';

describe('getSeason', () => {
  it('returns spring for months 3, 4, 5', () => {
    expect(getSeason(3)).toBe('spring');
    expect(getSeason(4)).toBe('spring');
    expect(getSeason(5)).toBe('spring');
  });

  it('returns summer for months 6, 7, 8', () => {
    expect(getSeason(6)).toBe('summer');
    expect(getSeason(7)).toBe('summer');
    expect(getSeason(8)).toBe('summer');
  });

  it('returns autumn for months 9, 10, 11', () => {
    expect(getSeason(9)).toBe('autumn');
    expect(getSeason(10)).toBe('autumn');
    expect(getSeason(11)).toBe('autumn');
  });

  it('returns winter for months 12, 1, 2', () => {
    expect(getSeason(12)).toBe('winter');
    expect(getSeason(1)).toBe('winter');
    expect(getSeason(2)).toBe('winter');
  });
});

describe('getWeatherType', () => {
  it('returns "clear" for Clear', () => {
    expect(getWeatherType('Clear')).toBe('clear');
  });

  it('returns "clouds" for Clouds', () => {
    expect(getWeatherType('Clouds')).toBe('clouds');
  });

  it('returns "rain" for Rain, Drizzle, Thunderstorm', () => {
    expect(getWeatherType('Rain')).toBe('rain');
    expect(getWeatherType('Drizzle')).toBe('rain');
    expect(getWeatherType('Thunderstorm')).toBe('rain');
  });

  it('returns "snow" for Snow', () => {
    expect(getWeatherType('Snow')).toBe('snow');
  });

  it('returns "mist" for unknown weather', () => {
    expect(getWeatherType('Unknown')).toBe('mist');
    expect(getWeatherType('Haze')).toBe('mist');
  });
});

describe('getTimeGreeting', () => {
  it('returns correct greeting for each time of day', () => {
    expect(getTimeGreeting('dawn')).toBe('좋은 새벽이에요');
    expect(getTimeGreeting('morning')).toBe('좋은 아침이에요');
    expect(getTimeGreeting('day')).toBe('좋은 하루 보내세요');
    expect(getTimeGreeting('evening')).toBe('좋은 저녁이에요');
    expect(getTimeGreeting('night')).toBe('편안한 밤 되세요');
  });
});

describe('getSeasonGreeting', () => {
  it('returns correct greeting for each season', () => {
    expect(getSeasonGreeting('spring')).toBe('따스한 봄');
    expect(getSeasonGreeting('summer')).toBe('무더운 여름');
    expect(getSeasonGreeting('autumn')).toBe('선선한 가을');
    expect(getSeasonGreeting('winter')).toBe('추운 겨울');
  });
});

describe('getTimeOfDay', () => {
  it('returns "day" for midday hour (12)', () => {
    expect(getTimeOfDay(12)).toBe('day');
  });

  it('returns "night" for late night hour (2)', () => {
    expect(getTimeOfDay(2)).toBe('night');
  });
});

describe('getThemeConfig', () => {
  it('returns correct config for daytime clear weather', () => {
    const config = getThemeConfig('Clear', 12);
    expect(config.timeOfDay).toBe('day');
    expect(config.gradient).toEqual(TIME_GRADIENTS.day);
    expect(config.overlay).toBe(WEATHER_OVERLAYS.clear);
    expect(config.isLight).toBe(false);
  });

  it('returns rain overlay for rainy weather', () => {
    const config = getThemeConfig('Rain', 12);
    expect(config.overlay).toBe(WEATHER_OVERLAYS.rain);
  });

  it('returns night config for late hour', () => {
    const config = getThemeConfig('Clear', 2);
    expect(config.timeOfDay).toBe('night');
    expect(config.isLight).toBe(false);
  });
});

describe('getGradientStyle', () => {
  it('returns CSS properties with linear-gradient background', () => {
    const gradient = { from: '#aaa', via: '#bbb', to: '#ccc' };
    const style = getGradientStyle(gradient);
    expect(style.background).toBe('linear-gradient(to bottom, #aaa, #bbb, #ccc)');
  });
});
