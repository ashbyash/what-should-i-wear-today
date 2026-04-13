import { describe, it, expect } from 'vitest';
import {
  parseCurrentWeather,
  parseForecastWeather,
  parseAirKorea,
  parseUVIndex,
  parseLocation,
  parseHourlyForecast,
} from '../type-guards';

describe('parseCurrentWeather', () => {
  it('parses valid object with temperature', () => {
    const data = { temperature: 20, humidity: 50, windSpeed: 2, precipitation: '0', precipitationDescription: '없음' };
    expect(parseCurrentWeather(data)).toEqual(data);
  });

  it('returns null for null input', () => {
    expect(parseCurrentWeather(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(parseCurrentWeather(undefined)).toBeNull();
  });

  it('returns null when temperature is not a number', () => {
    expect(parseCurrentWeather({ temperature: '20' })).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(parseCurrentWeather('string')).toBeNull();
  });
});

describe('parseForecastWeather', () => {
  it('parses valid object with sky string', () => {
    const data = { tempMin: 10, tempMax: 25, sky: 'Clear', skyDescription: '맑음' };
    expect(parseForecastWeather(data)).toEqual(data);
  });

  it('returns null for null input', () => {
    expect(parseForecastWeather(null)).toBeNull();
  });

  it('returns null when sky is not a string', () => {
    expect(parseForecastWeather({ sky: 123 })).toBeNull();
  });
});

describe('parseAirKorea', () => {
  it('parses valid object with pm25 number', () => {
    const data = { stationName: '강남구', stationAddr: '서울', pm10: 30, pm25: 15, pm10Grade: 'good', pm25Grade: 'good', dataTime: '12:00' };
    expect(parseAirKorea(data)).toEqual(data);
  });

  it('returns null for null input', () => {
    expect(parseAirKorea(null)).toBeNull();
  });

  it('returns null when pm25 is not a number', () => {
    expect(parseAirKorea({ pm25: 'bad' })).toBeNull();
  });

  it('returns null for array input', () => {
    expect(parseAirKorea([1, 2, 3])).toBeNull();
  });
});

describe('parseUVIndex', () => {
  it('parses valid object with uvIndex number', () => {
    const data = { uvIndex: 5, uvLevel: 'moderate', uvDescription: '보통' };
    expect(parseUVIndex(data)).toEqual(data);
  });

  it('returns null for null input', () => {
    expect(parseUVIndex(null)).toBeNull();
  });

  it('returns null when uvIndex is not a number', () => {
    expect(parseUVIndex({ uvIndex: 'high' })).toBeNull();
  });
});

describe('parseLocation', () => {
  it('parses valid object with address string', () => {
    const data = { address: '서울특별시 강남구', region1: '서울특별시', region2: '강남구', region3: '역삼동' };
    expect(parseLocation(data)).toEqual(data);
  });

  it('returns null for null input', () => {
    expect(parseLocation(null)).toBeNull();
  });

  it('returns null when address is not a number', () => {
    expect(parseLocation({ address: 123 })).toBeNull();
  });
});

describe('parseHourlyForecast', () => {
  it('parses valid array of forecast items', () => {
    const data = [
      { time: '15:00', temperature: 20, weatherMain: 'Clear' },
      { time: '16:00', temperature: 19, weatherMain: 'Clouds' },
    ];
    expect(parseHourlyForecast(data)).toEqual(data);
  });

  it('returns empty array for empty array input', () => {
    expect(parseHourlyForecast([])).toEqual([]);
  });

  it('returns null for null input', () => {
    expect(parseHourlyForecast(null)).toBeNull();
  });

  it('returns null for non-array input', () => {
    expect(parseHourlyForecast('not an array')).toBeNull();
  });

  it('returns null when first item is missing time', () => {
    expect(parseHourlyForecast([{ temperature: 20, weatherMain: 'Clear' }])).toBeNull();
  });

  it('returns null when first item has non-number temperature', () => {
    expect(parseHourlyForecast([{ time: '15:00', temperature: '20', weatherMain: 'Clear' }])).toBeNull();
  });
});
