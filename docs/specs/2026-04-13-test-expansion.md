# Test Expansion Spec

## Overview

기존 lib 유닛 테스트 4개(score, outfit, weather-format, ai-message eval)에서 lib 7개 + 컴포넌트 5개를 추가하여 전체 테스트 커버리지를 확장한다.

## Goals

- 테스트 안 된 lib 모듈 7개에 유닛 테스트 추가 (~50개)
- 핵심 컴포넌트 5개에 렌더링+데이터 표시 테스트 추가 (~22개)
- 테스트 인프라 정비 (jsdom, jest-dom, coverage, 팩토리 함수)
- 기존 ~73개 → ~145개 테스트로 확장

## Non-Goals

- 인터랙션 테스트 (클릭, 모달 열기/닫기 등)
- E2E 테스트
- CI/CD 파이프라인 연동
- 핵심 5개 외 컴포넌트 테스트 (Skeleton, Footer, ErrorState 등)

---

## 1. 테스트 인프라

### 1-1. 패키지 추가

| 패키지 | 용도 |
|--------|------|
| `@testing-library/jest-dom` | DOM 매처 (toBeInTheDocument, toHaveTextContent 등) |
| `@vitest/coverage-v8` | 커버리지 리포팅 |

### 1-2. vitest.config.ts 변경

```typescript
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

커버리지 exclude 근거:
- `__tests__/`: 테스트 파일 자체
- `prompts/`: AI 프롬프트 텍스트 (로직 없음)
- `use*.ts` hooks: React hook으로 컴포넌트 테스트에서 모킹됨. 단독 테스트 가치 낮음

### 1-3. NPM 스크립트

```json
"test:coverage": "vitest run --coverage"
```

### 1-4. 셋업 파일: `src/lib/__tests__/setup.ts`

```typescript
import '@testing-library/jest-dom/vitest';
```

### 1-5. 팩토리 함수: `src/lib/__tests__/helpers/factories.ts`

taste-like 패턴 차용. `overrides` 파라미터로 부분 오버라이드 가능.

```typescript
function makeWeatherData(overrides?: Partial<WeatherData>): WeatherData
function makeOutingScore(overrides?: Partial<OutingScore>): OutingScore
function makeOutfitRecommendation(overrides?: Partial<OutfitRecommendation>): OutfitRecommendation
function makeScoreInput(overrides?: Partial<ScoreInput>): ScoreInput
function makeHourlyForecastItem(overrides?: Partial<HourlyForecastItem>): HourlyForecastItem
```

기본값은 서울, 맑은 날, 봄, 20도 기준. 기존 score.test.ts의 `baseInput`과 동일한 값을 기반으로 하되 팩토리 함수로 래핑.

---

## 2. Lib 유닛 테스트

### 2-1. `design-tokens.test.ts` (3-5개)

| 테스트 | 검증 내용 |
|--------|----------|
| getScoreGradient — good 구간 | 70 이상 → good gradient 반환 |
| getScoreGradient — moderate 구간 | 40~69 → moderate gradient 반환 |
| getScoreGradient — bad 구간 | 0~39 → bad gradient 반환 |
| getScoreGradient — 경계값 | 70 정확히, 40 정확히, 69.999 |
| 상수 검증 | STATUS_COLORS 키 존재 (good, moderate, bad) |

### 2-2. `coordinates.test.ts` (4-6개)

| 테스트 | 검증 내용 |
|--------|----------|
| toGridCoordinate — 서울 | (37.5665, 126.978) → nx=60, ny=127 (알려진 값) |
| toGridCoordinate — 부산 | (35.1796, 129.0756) → 알려진 격자값 |
| toGridCoordinate — 반환 타입 | nx, ny가 정수 |
| toTMCoordinate — 서울 | TM 좌표 범위 검증 (tmX ~198000, tmY ~450000 근처) |
| toTMCoordinate — 반환 타입 | tmX, tmY가 숫자 |

### 2-3. `kst-time.test.ts` (6-8개)

| 테스트 | 검증 내용 |
|--------|----------|
| formatKSTDate — UTC 자정 | UTC 2026-04-13T00:00:00 → "20260413" (KST 09시) |
| formatKSTDate — UTC 15시 | UTC 15:00 → 다음날 날짜 (KST 00시) |
| formatKSTTime — UTC 자정 | → "0900" |
| formatKSTTime — UTC 15시 | → "0000" |
| getKSTHour — UTC 자정 | → 9 |
| getKSTMinutes | 분 값 정확성 |
| getKSTYesterday | 어제 날짜 차이 검증 |

### 2-4. `format-location.test.ts` (3-4개)

| 테스트 | 검증 내용 |
|--------|----------|
| 카카오 데이터 있을 때 | "서울특별시" → "서울" 축약 |
| 카카오 없고 에어코리아 있을 때 | stationAddr 폴백 |
| 둘 다 null | "현재 위치" 반환 |
| 광역시/특별자치시 축약 | "부산광역시" → "부산" |

### 2-5. `type-guards.test.ts` (12-15개)

각 파서 함수별 happy path + null/undefined/잘못된 타입:

| 함수 | happy | null 입력 | 잘못된 타입 |
|------|-------|----------|-----------|
| parseCurrentWeather | temperature가 number인 객체 → 성공 | null → null | string → null |
| parseForecastWeather | sky가 string인 객체 → 성공 | null → null | number → null |
| parseAirKorea | pm25가 number인 객체 → 성공 | null → null | 배열 → null |
| parseUVIndex | uvIndex가 number인 객체 → 성공 | null → null | - |
| parseLocation | address가 string인 객체 → 성공 | null → null | - |
| parseHourlyForecast | 유효 배열 → 성공 | null → null | 빈 배열 → [] |

### 2-6. `weather-utils.test.ts` (8-10개)

| 테스트 | 검증 내용 |
|--------|----------|
| getWeatherEmoji — Rain | → "🌧️" |
| getWeatherEmoji — Clear (day) | → "☀️" |
| getWeatherEmoji — Clear (night) | → "🌙" |
| getWeatherEmoji — Snow | → "❄️" |
| getWeatherEmoji — Clouds | → "☁️" |
| getWeatherEmoji — 알 수 없는 날씨 | → 기본값 |
| getTimeCategoryForHour — 낮 시간 | 서울 좌표, "14:00" → "day" |
| getTimeCategoryForHour — 밤 시간 | 서울 좌표, "02:00" → "night" |

### 2-7. `theme.test.ts` (10-12개)

| 테스트 | 검증 내용 |
|--------|----------|
| getSeason — 봄 | month=3,4,5 → "spring" |
| getSeason — 여름 | month=6,7,8 → "summer" |
| getSeason — 가을 | month=9,10,11 → "autumn" |
| getSeason — 겨울 | month=12,1,2 → "winter" |
| getWeatherType — clear | → "clear" |
| getWeatherType — rain/drizzle/thunderstorm | → "rain" |
| getWeatherType — snow | → "snow" |
| getWeatherType — 알 수 없는 값 | → "mist" |
| getTimeGreeting — 각 시간대 | 5개 TimeOfDay → 한국어 인사말 |
| getSeasonGreeting — 각 계절 | 4개 Season → 한국어 계절명 |
| getThemeConfig — 낮+맑음 | hour=12 → day gradient, isLight=false, clear overlay |
| getGradientStyle | gradient 객체 → CSS background 문자열 |

---

## 3. 컴포넌트 테스트

### 공통 모킹

```typescript
// framer-motion 모킹 — m.div 등을 일반 HTML로 대체
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => children,
  m: new Proxy({}, {
    get: (_, tag) => (props) => createElement(tag, filterMotionProps(props)),
  }),
  useReducedMotion: () => false,
}));
```

### 3-1. `HeroCard.test.tsx` (5-7개)

모킹: `useAIMessage` → `{ message: '테스트 메시지', isLoading: false }`

| 테스트 | 검증 내용 |
|--------|----------|
| 위치명 표시 | locationName이 렌더링됨 |
| 온도 표시 | weather.temperature 값이 화면에 있음 |
| 점수 표시 | score.total 값이 화면에 있음 |
| 레벨 텍스트 | score.level에 따른 한국어 텍스트 |
| 날씨 라벨 | weatherMain → 한국어 라벨 (Clear → 맑음) |
| 업데이트 시간 | lastUpdated 전달 시 상대시간 표시 |
| AI 메시지 | 모킹된 메시지 텍스트 표시 |

### 3-2. `OutfitCard.test.tsx` (4-5개)

모킹: `useAIStylingTip` → `{ tip: null, isLoading: false }`

| 테스트 | 검증 내용 |
|--------|----------|
| 카테고리 렌더링 | 상의, 하의 등 카테고리 라벨 표시 |
| 아이템 목록 | 각 카테고리의 아이템들이 텍스트로 존재 |
| 알림 표시 | alerts 배열의 내용 렌더링 |
| 빈 카테고리 | 아이템 없는 카테고리는 렌더링 안 됨 |

### 3-3. `HourlyForecast.test.tsx` (4-5개)

| 테스트 | 검증 내용 |
|--------|----------|
| 시간 표시 | 각 아이템의 시간 텍스트 |
| 온도 표시 | 각 아이템의 온도 값 |
| 날씨 이모지 | 날씨에 맞는 이모지 표시 |
| 빈 배열 | 데이터 없을 때 빈 상태 처리 |

### 3-4. `WeatherModuleGrid.test.tsx` (4-5개)

| 테스트 | 검증 내용 |
|--------|----------|
| 4개 모듈 렌더링 | 미세먼지, 자외선, 습도, 바람 모듈 존재 |
| PM2.5 값 표시 | 수치와 등급 텍스트 |
| UV 값 표시 | 수치와 등급 텍스트 |
| null 데이터 | 데이터 없는 모듈의 처리 |

### 3-5. `CitiesTabs.test.tsx` (3-4개)

| 테스트 | 검증 내용 |
|--------|----------|
| 도시 탭 렌더링 | 전달된 도시명들이 표시됨 |
| 활성 탭 표시 | 선택된 도시에 활성 스타일 |
| 도시 수 | 전달된 수만큼 탭 렌더링 |

---

## 4. 파일 구조

```
src/lib/__tests__/
  setup.ts                    (신규)
  helpers/
    factories.ts              (신규)
  design-tokens.test.ts       (신규)
  coordinates.test.ts         (신규)
  kst-time.test.ts            (신규)
  format-location.test.ts     (신규)
  type-guards.test.ts         (신규)
  weather-utils.test.ts       (신규)
  theme.test.ts               (신규)
  score.test.ts               (기존)
  outfit.test.ts              (기존)
  weather-format.test.ts      (기존)
  ai-message.eval.test.ts     (기존)

src/components/__tests__/
  HeroCard.test.tsx            (신규)
  OutfitCard.test.tsx          (신규)
  HourlyForecast.test.tsx      (신규)
  WeatherModuleGrid.test.tsx   (신규)
  CitiesTabs.test.tsx          (신규)
```

## 5. 실행 방식

| 명령어 | 용도 |
|--------|------|
| `npm run test:run` | 전체 테스트 실행 (기존) |
| `npm run test:coverage` | 커버리지 포함 실행 (신규) |
| `npm run eval` | AI eval 테스트만 (기존, 변경 없음) |
