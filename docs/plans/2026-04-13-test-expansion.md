# Test Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand test coverage from 4 files (~73 tests) to 16 files (~145 tests) by adding lib unit tests, component tests, and test infrastructure.

**Architecture:** Bottom-up approach — test infrastructure first (jsdom, jest-dom, coverage, factories), then lib unit tests for 7 untested modules, then component tests for 5 core UI components. Factory functions centralize test data creation.

**Tech Stack:** Vitest, @testing-library/react, @testing-library/jest-dom, @vitest/coverage-v8

---

### Task 1: Test Infrastructure Setup

**Files:**
- Modify: `package.json` (scripts + devDependencies)
- Modify: `vitest.config.ts`
- Create: `src/lib/__tests__/setup.ts`
- Create: `src/lib/__tests__/helpers/factories.ts`

- [ ] **Step 1: Install new dev dependencies**

Run:
```bash
npm install -D @testing-library/jest-dom @vitest/coverage-v8
```
Expected: packages added to devDependencies

- [ ] **Step 2: Add test:coverage script to package.json**

In `package.json`, add to scripts:
```json
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 3: Update vitest.config.ts**

Replace the entire file content:
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/lib/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**/*.ts', 'src/components/**/*.tsx'],
      exclude: [
        'src/lib/__tests__/**',
        'src/components/__tests__/**',
        'src/lib/prompts/**',
        'src/lib/useAIMessage.ts',
        'src/lib/useAIStylingTip.ts',
        'src/lib/useWeatherData.ts',
        'src/lib/useLocationSearch.ts',
        'src/lib/useClientHour.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 4: Create setup file**

Create `src/lib/__tests__/setup.ts`:
```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Create factories helper**

Create `src/lib/__tests__/helpers/factories.ts`:
```typescript
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
  return {
    total: 85,
    breakdown: {
      feelsLikeTemp: 65,
      weather: 15,
      fineDust: 10,
      uv: 5,
      humidity: 5,
      windPenalty: 0,
      ...(overrides?.breakdown ?? {}),
    },
    level: 'excellent',
    message: '외출하기 좋은 날이에요!',
    tips: [],
    ...overrides,
    // breakdown needs special handling since it's nested
    ...(overrides?.breakdown ? { breakdown: { ...makeOutingScore().breakdown, ...overrides.breakdown } } : {}),
  };
}

export function makeOutfitRecommendation(overrides?: Partial<OutfitRecommendation>): OutfitRecommendation {
  return {
    categories: {
      top: ['면 긴팔 티셔츠'],
      bottom: ['청바지'],
      shoes: ['운동화'],
      ...(overrides?.categories ?? {}),
    },
    alerts: [],
    ...overrides,
    ...(overrides?.categories ? { categories: { ...makeOutfitRecommendation().categories, ...overrides.categories } } : {}),
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
```

- [ ] **Step 6: Verify existing tests still pass with new config**

Run:
```bash
npx vitest run
```
Expected: All existing tests pass (score, outfit, weather-format). ai-message.eval tests may be skipped (no API key).

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts package.json package-lock.json src/lib/__tests__/setup.ts src/lib/__tests__/helpers/factories.ts
git commit -m "test: add test infrastructure (jsdom, jest-dom, coverage, factories)"
```

---

### Task 2: design-tokens unit tests

**Files:**
- Create: `src/lib/__tests__/design-tokens.test.ts`
- Reference: `src/lib/design-tokens.ts`

- [ ] **Step 1: Write tests**

Create `src/lib/__tests__/design-tokens.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import {
  getScoreGradient,
  SCORE_GRADIENTS,
  STATUS_COLORS,
  SPRING,
  DURATION,
  EASING,
  STAGGER_STEP,
} from '../design-tokens';

describe('getScoreGradient', () => {
  it('returns good gradient for percentage >= 70', () => {
    expect(getScoreGradient(70)).toBe(SCORE_GRADIENTS.good.gradient);
    expect(getScoreGradient(100)).toBe(SCORE_GRADIENTS.good.gradient);
  });

  it('returns moderate gradient for percentage >= 40 and < 70', () => {
    expect(getScoreGradient(40)).toBe(SCORE_GRADIENTS.moderate.gradient);
    expect(getScoreGradient(69)).toBe(SCORE_GRADIENTS.moderate.gradient);
  });

  it('returns bad gradient for percentage < 40', () => {
    expect(getScoreGradient(0)).toBe(SCORE_GRADIENTS.bad.gradient);
    expect(getScoreGradient(39)).toBe(SCORE_GRADIENTS.bad.gradient);
  });

  it('handles boundary value 69.999 as moderate', () => {
    expect(getScoreGradient(69.999)).toBe(SCORE_GRADIENTS.moderate.gradient);
  });
});

describe('design token constants', () => {
  it('STATUS_COLORS has good, moderate, bad keys', () => {
    expect(STATUS_COLORS).toHaveProperty('good');
    expect(STATUS_COLORS).toHaveProperty('moderate');
    expect(STATUS_COLORS).toHaveProperty('bad');
  });

  it('SPRING has gentle and bouncy presets', () => {
    expect(SPRING.gentle.type).toBe('spring');
    expect(SPRING.bouncy.type).toBe('spring');
  });

  it('DURATION values are positive numbers', () => {
    expect(DURATION.fast).toBeGreaterThan(0);
    expect(DURATION.normal).toBeGreaterThan(0);
    expect(DURATION.slow).toBeGreaterThan(0);
    expect(DURATION.pulse).toBeGreaterThan(0);
  });

  it('EASING arrays have 4 elements', () => {
    expect(EASING.out).toHaveLength(4);
    expect(EASING.inOut).toHaveLength(4);
  });

  it('STAGGER_STEP is a positive number', () => {
    expect(STAGGER_STEP).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/lib/__tests__/design-tokens.test.ts`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/design-tokens.test.ts
git commit -m "test: add design-tokens unit tests"
```

---

### Task 3: coordinates unit tests

**Files:**
- Create: `src/lib/__tests__/coordinates.test.ts`
- Reference: `src/lib/coordinates.ts`

- [ ] **Step 1: Write tests**

Create `src/lib/__tests__/coordinates.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { toGridCoordinate, toTMCoordinate } from '../coordinates';

describe('toGridCoordinate', () => {
  it('converts Seoul coordinates to known grid values (60, 127)', () => {
    const result = toGridCoordinate(37.5665, 126.978);
    expect(result.nx).toBe(60);
    expect(result.ny).toBe(127);
  });

  it('converts Busan coordinates to known grid values (98, 76)', () => {
    const result = toGridCoordinate(35.1796, 129.0756);
    expect(result.nx).toBe(98);
    expect(result.ny).toBe(76);
  });

  it('returns integer values for nx and ny', () => {
    const result = toGridCoordinate(37.5665, 126.978);
    expect(Number.isInteger(result.nx)).toBe(true);
    expect(Number.isInteger(result.ny)).toBe(true);
  });

  it('converts Jeju coordinates', () => {
    const result = toGridCoordinate(33.4996, 126.5312);
    // Jeju is in the lower-left area of the grid
    expect(result.nx).toBeGreaterThan(40);
    expect(result.nx).toBeLessThan(80);
    expect(result.ny).toBeGreaterThan(20);
    expect(result.ny).toBeLessThan(50);
  });
});

describe('toTMCoordinate', () => {
  it('converts Seoul coordinates to TM values in expected range', () => {
    const result = toTMCoordinate(37.5665, 126.978);
    // Seoul TM coordinates: tmX ~198000, tmY ~450000 area
    expect(result.tmX).toBeGreaterThan(190000);
    expect(result.tmX).toBeLessThan(210000);
    expect(result.tmY).toBeGreaterThan(440000);
    expect(result.tmY).toBeLessThan(460000);
  });

  it('returns numeric values for tmX and tmY', () => {
    const result = toTMCoordinate(37.5665, 126.978);
    expect(typeof result.tmX).toBe('number');
    expect(typeof result.tmY).toBe('number');
    expect(Number.isNaN(result.tmX)).toBe(false);
    expect(Number.isNaN(result.tmY)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/lib/__tests__/coordinates.test.ts`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/coordinates.test.ts
git commit -m "test: add coordinates unit tests"
```

---

### Task 4: kst-time unit tests

**Files:**
- Create: `src/lib/__tests__/kst-time.test.ts`
- Reference: `src/lib/kst-time.ts`

- [ ] **Step 1: Write tests**

Create `src/lib/__tests__/kst-time.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import {
  getKSTDate,
  formatKSTDate,
  formatKSTTime,
  getKSTHour,
  getKSTMinutes,
  getKSTYesterday,
} from '../kst-time';

describe('formatKSTDate', () => {
  it('formats UTC midnight as KST same-day date', () => {
    // UTC 2026-04-13 00:00 = KST 2026-04-13 09:00
    const utcMidnight = new Date('2026-04-13T00:00:00Z');
    const kstDate = new Date(utcMidnight.getTime() + 9 * 60 * 60 * 1000);
    expect(formatKSTDate(kstDate)).toBe('20260413');
  });

  it('formats UTC 15:00 as KST next-day date', () => {
    // UTC 2026-04-13 15:00 = KST 2026-04-14 00:00
    const utc15 = new Date('2026-04-13T15:00:00Z');
    const kstDate = new Date(utc15.getTime() + 9 * 60 * 60 * 1000);
    expect(formatKSTDate(kstDate)).toBe('20260414');
  });

  it('pads single-digit month and day with zeros', () => {
    // KST 2026-01-05
    const kstDate = new Date('2025-12-31T16:00:00Z'); // +9h = 2026-01-01 01:00
    const adjusted = new Date(kstDate.getTime() + 9 * 60 * 60 * 1000);
    const result = formatKSTDate(adjusted);
    expect(result).toMatch(/^\d{8}$/);
  });
});

describe('formatKSTTime', () => {
  it('formats UTC midnight as KST 0900', () => {
    const utcMidnight = new Date('2026-04-13T00:00:00Z');
    const kstDate = new Date(utcMidnight.getTime() + 9 * 60 * 60 * 1000);
    expect(formatKSTTime(kstDate)).toBe('0900');
  });

  it('formats UTC 15:00 as KST 0000', () => {
    const utc15 = new Date('2026-04-13T15:00:00Z');
    const kstDate = new Date(utc15.getTime() + 9 * 60 * 60 * 1000);
    expect(formatKSTTime(kstDate)).toBe('0000');
  });

  it('formats UTC 03:30 as KST 1230', () => {
    const utc0330 = new Date('2026-04-13T03:30:00Z');
    const kstDate = new Date(utc0330.getTime() + 9 * 60 * 60 * 1000);
    expect(formatKSTTime(kstDate)).toBe('1230');
  });
});

describe('getKSTHour', () => {
  it('returns 9 for UTC midnight', () => {
    const utcMidnight = new Date('2026-04-13T00:00:00Z');
    const kstDate = new Date(utcMidnight.getTime() + 9 * 60 * 60 * 1000);
    expect(getKSTHour(kstDate)).toBe(9);
  });

  it('returns 0 for UTC 15:00', () => {
    const utc15 = new Date('2026-04-13T15:00:00Z');
    const kstDate = new Date(utc15.getTime() + 9 * 60 * 60 * 1000);
    expect(getKSTHour(kstDate)).toBe(0);
  });
});

describe('getKSTMinutes', () => {
  it('returns correct minutes', () => {
    const utc0330 = new Date('2026-04-13T03:30:00Z');
    const kstDate = new Date(utc0330.getTime() + 9 * 60 * 60 * 1000);
    expect(getKSTMinutes(kstDate)).toBe(30);
  });
});

describe('getKSTYesterday', () => {
  it('returns a date one day before KST now', () => {
    const today = getKSTDate();
    const yesterday = getKSTYesterday();
    const diffMs = today.getTime() - yesterday.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
    expect(diffDays).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/lib/__tests__/kst-time.test.ts`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/kst-time.test.ts
git commit -m "test: add kst-time unit tests"
```

---

### Task 5: format-location unit tests

**Files:**
- Create: `src/lib/__tests__/format-location.test.ts`
- Reference: `src/lib/format-location.ts`

- [ ] **Step 1: Write tests**

Create `src/lib/__tests__/format-location.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/lib/__tests__/format-location.test.ts`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/format-location.test.ts
git commit -m "test: add format-location unit tests"
```

---

### Task 6: type-guards unit tests

**Files:**
- Create: `src/lib/__tests__/type-guards.test.ts`
- Reference: `src/lib/type-guards.ts`

- [ ] **Step 1: Write tests**

Create `src/lib/__tests__/type-guards.test.ts`:
```typescript
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

  it('returns null when address is not a string', () => {
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
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/lib/__tests__/type-guards.test.ts`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/type-guards.test.ts
git commit -m "test: add type-guards unit tests"
```

---

### Task 7: weather-utils unit tests

**Files:**
- Create: `src/lib/__tests__/weather-utils.test.ts`
- Reference: `src/lib/weather-utils.ts`

- [ ] **Step 1: Write tests**

Create `src/lib/__tests__/weather-utils.test.ts`:
```typescript
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
  // Seoul coordinates
  const SEOUL_LAT = 37.5665;
  const SEOUL_LON = 126.978;
  const KST_OFFSET = 9;

  it('returns "day" for afternoon hours (14:00)', () => {
    const result = getTimeCategoryForHour('14:00', SEOUL_LAT, SEOUL_LON, KST_OFFSET);
    expect(result).toBe('day');
  });

  it('returns "night" for late night hours (02:00)', () => {
    const result = getTimeCategoryForHour('02:00', SEOUL_LAT, SEOUL_LON, KST_OFFSET);
    expect(result).toBe('night');
  });

  it('returns "day" for midday (12:00)', () => {
    const result = getTimeCategoryForHour('12:00', SEOUL_LAT, SEOUL_LON, KST_OFFSET);
    expect(result).toBe('day');
  });

  it('returns "night" for late evening (23:00)', () => {
    const result = getTimeCategoryForHour('23:00', SEOUL_LAT, SEOUL_LON, KST_OFFSET);
    expect(result).toBe('night');
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/lib/__tests__/weather-utils.test.ts`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/weather-utils.test.ts
git commit -m "test: add weather-utils unit tests"
```

---

### Task 8: theme unit tests

**Files:**
- Create: `src/lib/__tests__/theme.test.ts`
- Reference: `src/lib/theme.ts`

- [ ] **Step 1: Write tests**

Create `src/lib/__tests__/theme.test.ts`:
```typescript
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
    const result = getTimeOfDay(12);
    expect(result).toBe('day');
  });

  it('returns "night" for late night hour (2)', () => {
    const result = getTimeOfDay(2);
    expect(result).toBe('night');
  });
});

describe('getThemeConfig', () => {
  it('returns correct config for daytime clear weather', () => {
    const config = getThemeConfig('Clear', 12);
    expect(config.timeOfDay).toBe('day');
    expect(config.gradient).toEqual(TIME_GRADIENTS.day);
    expect(config.overlay).toBe(WEATHER_OVERLAYS.clear);
    expect(config.isLight).toBe(false); // day has dark text
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
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/lib/__tests__/theme.test.ts`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/theme.test.ts
git commit -m "test: add theme unit tests"
```

---

### Task 9: HeroCard component test

**Files:**
- Create: `src/components/__tests__/HeroCard.test.tsx`
- Reference: `src/components/HeroCard.tsx`

- [ ] **Step 1: Write tests**

Create `src/components/__tests__/HeroCard.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroCard from '../HeroCard';
import { makeWeatherData, makeOutingScore } from '@/lib/__tests__/helpers/factories';

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    m: new Proxy({}, {
      get: (_: unknown, tag: string) => {
        return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
          const filtered = Object.fromEntries(
            Object.entries(props).filter(([key]) =>
              !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'variants', 'layout'].includes(key)
            )
          );
          return React.createElement(tag, { ...filtered, ref });
        });
      },
    }),
  };
});

// Mock GlassCard — render children directly
vi.mock('../GlassCard', () => {
  const React = require('react');
  return {
    default: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      React.createElement('div', { 'data-testid': 'glass-card', className }, children),
    GlassInner: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      React.createElement('div', { 'data-testid': 'glass-inner', className }, children),
  };
});

// Mock useAIMessage
vi.mock('@/lib/useAIMessage', () => ({
  useAIMessage: () => ({ message: '오늘 외출하기 좋아요!', isLoading: false }),
}));

describe('HeroCard', () => {
  const defaultProps = {
    locationName: '서울 강남구',
    weather: makeWeatherData({ temperature: 22, feelsLike: 20, weatherMain: 'Clear' }),
    score: makeOutingScore({ total: 85, level: 'excellent', message: '좋은 날씨!' }),
  };

  it('renders location name', () => {
    render(<HeroCard {...defaultProps} />);
    expect(screen.getByText('서울 강남구')).toBeInTheDocument();
  });

  it('renders temperature', () => {
    render(<HeroCard {...defaultProps} />);
    expect(screen.getByText('22°')).toBeInTheDocument();
  });

  it('renders feels-like temperature', () => {
    render(<HeroCard {...defaultProps} />);
    expect(screen.getByText('체감 20°')).toBeInTheDocument();
  });

  it('renders score total', () => {
    render(<HeroCard {...defaultProps} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders weather label in Korean', () => {
    render(<HeroCard {...defaultProps} />);
    expect(screen.getByText('맑음')).toBeInTheDocument();
  });

  it('renders AI message', () => {
    render(<HeroCard {...defaultProps} weatherContext={{ temperature: 22, feelsLike: 20, weatherMain: 'Clear', pm25: 10 }} />);
    expect(screen.getByText('오늘 외출하기 좋아요!')).toBeInTheDocument();
  });

  it('renders fallback message when no weatherContext', () => {
    render(<HeroCard {...defaultProps} />);
    expect(screen.getByText('좋은 날씨!')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/components/__tests__/HeroCard.test.tsx`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/__tests__/HeroCard.test.tsx
git commit -m "test: add HeroCard component tests"
```

---

### Task 10: OutfitCard component test

**Files:**
- Create: `src/components/__tests__/OutfitCard.test.tsx`
- Reference: `src/components/OutfitCard.tsx`

- [ ] **Step 1: Write tests**

Create `src/components/__tests__/OutfitCard.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OutfitCard from '../OutfitCard';
import { makeOutfitRecommendation } from '@/lib/__tests__/helpers/factories';

// Mock GlassCard
vi.mock('../GlassCard', () => {
  const React = require('react');
  return {
    default: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      React.createElement('div', { 'data-testid': 'glass-card', className }, children),
  };
});

// Mock useAIStylingTip
vi.mock('@/lib/useAIStylingTip', () => ({
  useAIStylingTip: () => ({ tip: null, isLoading: false }),
}));

describe('OutfitCard', () => {
  it('renders category labels', () => {
    const outfit = makeOutfitRecommendation({
      categories: {
        top: ['면 반팔 티셔츠'],
        bottom: ['면 반바지'],
        shoes: ['샌들'],
      },
    });
    render(<OutfitCard outfit={outfit} />);
    expect(screen.getByText('상의')).toBeInTheDocument();
    expect(screen.getByText('하의')).toBeInTheDocument();
    expect(screen.getByText('신발')).toBeInTheDocument();
  });

  it('renders item names within categories', () => {
    const outfit = makeOutfitRecommendation({
      categories: {
        top: ['면 반팔 티셔츠', '얇은 가디건'],
        bottom: ['청바지'],
      },
    });
    render(<OutfitCard outfit={outfit} />);
    expect(screen.getByText('면 반팔 티셔츠, 얇은 가디건')).toBeInTheDocument();
    expect(screen.getByText('청바지')).toBeInTheDocument();
  });

  it('renders alerts when present', () => {
    const outfit = makeOutfitRecommendation({
      alerts: ['마스크 착용 권장', '일교차가 커요, 겉옷 챙기세요'],
    });
    render(<OutfitCard outfit={outfit} />);
    expect(screen.getByText('마스크 착용 권장')).toBeInTheDocument();
    expect(screen.getByText('일교차가 커요, 겉옷 챙기세요')).toBeInTheDocument();
  });

  it('does not render empty categories', () => {
    const outfit = makeOutfitRecommendation({
      categories: {
        top: ['면 긴팔 티셔츠'],
        bottom: ['청바지'],
        outer: undefined,
        accessory: undefined,
      },
    });
    render(<OutfitCard outfit={outfit} />);
    expect(screen.queryByText('아우터')).not.toBeInTheDocument();
    expect(screen.queryByText('악세서리')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/components/__tests__/OutfitCard.test.tsx`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/__tests__/OutfitCard.test.tsx
git commit -m "test: add OutfitCard component tests"
```

---

### Task 11: HourlyForecast component test

**Files:**
- Create: `src/components/__tests__/HourlyForecast.test.tsx`
- Reference: `src/components/HourlyForecast.tsx`

- [ ] **Step 1: Write tests**

Create `src/components/__tests__/HourlyForecast.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HourlyForecast from '../HourlyForecast';
import { makeHourlyForecastItem } from '@/lib/__tests__/helpers/factories';

// Mock GlassCard
vi.mock('../GlassCard', () => {
  const React = require('react');
  return {
    default: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      React.createElement('div', { 'data-testid': 'glass-card', className }, children),
    GlassInner: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      React.createElement('div', { 'data-testid': 'glass-inner', className }, children),
  };
});

// Mock weather-utils — return stable emoji
vi.mock('@/lib/weather-utils', () => ({
  getWeatherEmoji: (weatherMain: string) => {
    if (weatherMain === 'Clear') return '☀️';
    if (weatherMain === 'Rain') return '🌧️';
    return '🌤️';
  },
  getTimeCategoryForHour: () => 'day',
}));

describe('HourlyForecast', () => {
  it('renders time and temperature for each item', () => {
    const data = [
      makeHourlyForecastItem({ time: '15:00', temperature: 22, weatherMain: 'Clear' }),
      makeHourlyForecastItem({ time: '16:00', temperature: 21, weatherMain: 'Clear' }),
      makeHourlyForecastItem({ time: '17:00', temperature: 19, weatherMain: 'Rain' }),
    ];
    render(<HourlyForecast data={data} loading={false} />);

    // First item shows "지금" instead of time
    expect(screen.getByText('지금')).toBeInTheDocument();
    expect(screen.getByText('16:00')).toBeInTheDocument();
    expect(screen.getByText('17:00')).toBeInTheDocument();

    expect(screen.getByText('22°')).toBeInTheDocument();
    expect(screen.getByText('21°')).toBeInTheDocument();
    expect(screen.getByText('19°')).toBeInTheDocument();
  });

  it('renders nothing when data is null', () => {
    const { container } = render(<HourlyForecast data={null} loading={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when data is empty array', () => {
    const { container } = render(<HourlyForecast data={[]} loading={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows skeleton when loading', () => {
    render(<HourlyForecast data={null} loading={true} />);
    // Skeleton renders glass-card with pulse elements
    expect(screen.getByTestId('glass-card')).toBeInTheDocument();
  });

  it('renders precipitation probability when > 0', () => {
    const data = [
      makeHourlyForecastItem({ time: '15:00', temperature: 18, weatherMain: 'Rain', precipitationProbability: 70 }),
    ];
    render(<HourlyForecast data={data} loading={false} />);
    expect(screen.getByText(/70%/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/components/__tests__/HourlyForecast.test.tsx`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/__tests__/HourlyForecast.test.tsx
git commit -m "test: add HourlyForecast component tests"
```

---

### Task 12: WeatherModule component test

**Files:**
- Create: `src/components/__tests__/WeatherModule.test.tsx`
- Reference: `src/components/WeatherModule.tsx`, `src/components/WeatherModuleGrid.tsx`

Note: `WeatherModuleGrid` is a simple grid layout wrapper (`<div className="grid">`) with no logic to test. Testing `WeatherModule` instead, which contains the actual rendering logic for weather data display.

- [ ] **Step 1: Write tests**

Create `src/components/__tests__/WeatherModule.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeatherModule from '../WeatherModule';

// Mock GlassCard
vi.mock('../GlassCard', () => {
  const React = require('react');
  return {
    default: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      React.createElement('div', { 'data-testid': 'glass-card', className }, children),
    GlassInner: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      React.createElement('div', { 'data-testid': 'glass-inner', className }, children),
  };
});

describe('WeatherModule', () => {
  it('renders icon, label, value, and description', () => {
    render(
      <WeatherModule
        icon="💨"
        label="미세먼지"
        value="15"
        unit="㎍/㎥"
        description="좋음"
      />
    );
    expect(screen.getByText('💨')).toBeInTheDocument();
    expect(screen.getByText('미세먼지')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('㎍/㎥')).toBeInTheDocument();
    expect(screen.getByText('좋음')).toBeInTheDocument();
  });

  it('renders without unit when not provided', () => {
    render(
      <WeatherModule
        icon="☀️"
        label="자외선"
        value="3"
        description="보통"
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('㎍/㎥')).not.toBeInTheDocument();
  });

  it('applies custom color to value', () => {
    render(
      <WeatherModule
        icon="💨"
        label="미세먼지"
        value="80"
        description="매우 나쁨"
        color="#f87171"
      />
    );
    const valueEl = screen.getByText('80');
    expect(valueEl).toHaveStyle({ color: '#f87171' });
  });

  it('uses default color when no color prop', () => {
    render(
      <WeatherModule
        icon="💧"
        label="습도"
        value="55"
        unit="%"
        description="적정"
      />
    );
    const valueEl = screen.getByText('55');
    expect(valueEl).toHaveStyle({ color: 'var(--text-primary)' });
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/components/__tests__/WeatherModule.test.tsx`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/__tests__/WeatherModule.test.tsx
git commit -m "test: add WeatherModule component tests"
```

---

### Task 13: CitiesTabs component test

**Files:**
- Create: `src/components/__tests__/CitiesTabs.test.tsx`
- Reference: `src/components/CitiesTabs.tsx`

- [ ] **Step 1: Write tests**

Create `src/components/__tests__/CitiesTabs.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CitiesTabs from '../CitiesTabs';
import type { CityData } from '@/lib/cities';

// Mock GlassCard
vi.mock('../GlassCard', () => {
  const React = require('react');
  return {
    default: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      React.createElement('div', { 'data-testid': 'glass-card', className }, children),
  };
});

// Mock next/link
vi.mock('next/link', () => {
  const React = require('react');
  return {
    default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) =>
      React.createElement('a', { href, className }, children),
  };
});

const makeCity = (name: string, slug: string): CityData => ({
  slug,
  name,
  nameEn: slug.charAt(0).toUpperCase() + slug.slice(1),
  lat: 37.5665,
  lon: 126.978,
  description: `${name} 설명`,
});

describe('CitiesTabs', () => {
  const domesticRegions: [string, CityData[]][] = [
    ['수도권', [makeCity('서울', 'seoul'), makeCity('인천', 'incheon')]],
    ['영남권', [makeCity('부산', 'busan')]],
  ];
  const overseasRegions: [string, CityData[]][] = [
    ['동남아', [makeCity('방콕', 'bangkok')]],
  ];

  const defaultProps = {
    domesticRegions,
    overseasRegions,
    domesticCount: 3,
    overseasCount: 1,
  };

  it('renders domestic and overseas tab buttons with counts', () => {
    render(<CitiesTabs {...defaultProps} />);
    expect(screen.getByText('국내 3')).toBeInTheDocument();
    expect(screen.getByText('해외 1')).toBeInTheDocument();
  });

  it('renders domestic city names by default', () => {
    render(<CitiesTabs {...defaultProps} />);
    expect(screen.getByText('서울')).toBeInTheDocument();
    expect(screen.getByText('인천')).toBeInTheDocument();
    expect(screen.getByText('부산')).toBeInTheDocument();
  });

  it('renders region headings', () => {
    render(<CitiesTabs {...defaultProps} />);
    expect(screen.getByText('수도권')).toBeInTheDocument();
    expect(screen.getByText('영남권')).toBeInTheDocument();
  });

  it('renders city links with correct href', () => {
    render(<CitiesTabs {...defaultProps} />);
    const seoulLink = screen.getByText('서울').closest('a');
    expect(seoulLink).toHaveAttribute('href', '/seoul');
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/components/__tests__/CitiesTabs.test.tsx`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/__tests__/CitiesTabs.test.tsx
git commit -m "test: add CitiesTabs component tests"
```

---

### Task 14: Full test suite verification

- [ ] **Step 1: Run all tests**

Run:
```bash
npx vitest run
```
Expected: All tests pass (score, outfit, weather-format + 7 new lib tests + 5 new component tests). ai-message.eval may be skipped.

- [ ] **Step 2: Run coverage report**

Run:
```bash
npx vitest run --coverage
```
Expected: Coverage report printed to terminal. No specific threshold required, but verify it runs without errors.

- [ ] **Step 3: Final commit (if any adjustments were needed)**

Only if fixes were needed in previous steps:
```bash
git add -A
git commit -m "test: fix test suite issues from full verification"
```
