import type { WeatherData, HourlyForecastItem } from '@/types/weather';
import type { OutingScore, ScoreInput, OutfitRecommendation } from '@/types/score';

export function makeScoreInput(overrides?: Partial<ScoreInput>): ScoreInput {
  return {
    temperature: 20,
    tempMin: 15,
    tempMax: 25,
    pm25: 10,
    weatherMain: 'Clear',
    uvIndex: 2,
    humidity: 50,
    windSpeed: 2,
    timestamp: new Date('2024-04-15T14:00:00').getTime(),
    ...overrides,
  };
}

export function makeWeatherData(overrides?: Partial<WeatherData>): WeatherData {
  return {
    temperature: 20,
    feelsLike: 18,
    tempMin: 15,
    tempMax: 25,
    humidity: 50,
    weatherMain: 'Clear',
    weatherDescription: '맑음',
    weatherIcon: '01d',
    windSpeed: 2,
    cloudiness: 0,
    locationName: '서울',
    ...overrides,
  };
}

export function makeOutingScore(overrides?: Partial<OutingScore>): OutingScore {
  const defaults: OutingScore = {
    total: 85,
    breakdown: {
      feelsLikeTemp: 65,
      weather: 15,
      fineDust: 10,
      uv: 5,
      humidity: 5,
      windPenalty: 0,
    },
    level: 'excellent',
    message: '외출하기 좋은 날이에요!',
    tips: [],
  };

  return {
    ...defaults,
    ...overrides,
    breakdown: {
      ...defaults.breakdown,
      ...(overrides?.breakdown ?? {}),
    },
  };
}

export function makeOutfitRecommendation(overrides?: Partial<OutfitRecommendation>): OutfitRecommendation {
  const defaults: OutfitRecommendation = {
    categories: {
      top: ['면 긴팔 티셔츠'],
      bottom: ['청바지'],
      shoes: ['운동화'],
    },
    alerts: [],
  };

  return {
    ...defaults,
    ...overrides,
    categories: {
      ...defaults.categories,
      ...(overrides?.categories ?? {}),
    },
  };
}

export function makeHourlyForecastItem(overrides?: Partial<HourlyForecastItem>): HourlyForecastItem {
  return {
    time: '15:00',
    temperature: 20,
    weatherMain: 'Clear',
    date: '2026-04-13',
    ...overrides,
  };
}
