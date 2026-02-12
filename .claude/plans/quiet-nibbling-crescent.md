# Plan: 카드 레이아웃 변경 + 시간별 예보 UX 개선 (상세)

## Context
시간별 예보 기능 구현 완료(미커밋) 후, 4가지 UX 개선:
1. CityWeatherPage 카드 레이아웃을 page.tsx와 동일하게
2. 밤/낮/일출/일몰 시간대별 이모지
3. 날짜 경계(23:00→00:00) 구분 표시
4. 강수확률 표시

### 발견된 핵심 이슈: 해외 도시 타임존
- `getSunTimes()` (theme.ts:50-70)는 항상 KST(UTC+9)로 반환
- Open-Meteo hourly는 `timezone=auto`로 현지 시간 반환
- 태국(UTC+7), 하와이(UTC-10) 등에서 시간 불일치 발생
- **해결**: `CityData`에 `utcOffset` 필드 추가

---

## Step 1: 타입 확장 — `src/types/weather.ts` (line 93-98)

```ts
export interface HourlyForecastItem {
  time: string;                        // "15:00"
  temperature: number;                 // 15
  weatherMain: string;                 // "Clear", "Rain", etc.
  date?: string;                       // NEW "2026-02-12"
  precipitationProbability?: number;   // NEW 0-100
}
```

- optional(`?`)로 유지 → 기존 ISR 캐시 데이터 호환
- type-guards.ts 수정 불필요 (optional이므로 기존 검증 통과)

---

## Step 2: CityData에 utcOffset 추가 — `src/lib/cities.ts`

### 인터페이스 (line 2-11)
```ts
export interface CityData {
  // ...기존 필드
  utcOffset?: number; // NEW - UTC 기준 오프셋 (예: 9=한국, 7=태국)
}
```

### 해외 도시에 값 추가
| 도시 | utcOffset |
|------|-----------|
| 일본 5개 (osaka, tokyo, fukuoka, kyoto, sapporo) | 9 |
| 태국 (bangkok) | 7 |
| 베트남 (danang, ho-chi-minh) | 7 |
| 필리핀 (cebu) | 8 |
| 인도네시아 (bali) | 8 |
| 대만 (taipei) | 8 |
| 싱가포르 (singapore) | 8 |
| 괌 (guam) | 10 |
| 하와이 (honolulu) | -10 |

한국 도시는 생략 (기본값 9로 처리)

---

## Step 3: KMA API 강수확률+날짜 추출 — `src/lib/kma-api.ts`

### parseHourlyItems() (line 847-911) 변경 3곳

**3-1. timeMap 타입 확장 (line 860)**
```ts
const timeMap = new Map<string, {
  tmp?: number; sky?: SkyCode; pty?: PtyCode;
  pop?: number; // NEW
}>();
```

**3-2. POP 카테고리 추출 (line 873-883 switch문)**
```ts
case 'POP':
  entry.pop = parseInt(item.fcstValue, 10);
  break;
```

**3-3. result.push에 date + precipitationProbability 추가 (line 903-907)**
```ts
result.push({
  time: `${hour}:00`,
  temperature: entry.tmp,
  weatherMain,
  date: `${key.substring(0, 4)}-${key.substring(4, 6)}-${key.substring(6, 8)}`, // "20260212" → "2026-02-12"
  precipitationProbability: entry.pop,
});
```

---

## Step 4: Open-Meteo 강수확률+날짜 추출 — `src/lib/open-meteo-api.ts`

### fetchOpenMeteoHourly() (line 185-210) 변경 2곳

**4-1. URL에 precipitation_probability 추가 (line 186)**
```ts
const url = `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code,precipitation_probability&forecast_hours=36&timezone=auto`;
```

**4-2. result.push에 date + precipitationProbability 추가 (line 202-206)**
```ts
const parts = timeStr.split('T');
const date = parts[0]; // "2026-02-12"
const hour = parts[1]?.substring(0, 2);

result.push({
  time: `${hour}:00`,
  temperature: Math.round(hourly.temperature_2m[i]),
  weatherMain: wmoCodeToWeatherMain(hourly.weather_code[i]),
  date,
  precipitationProbability: hourly.precipitation_probability?.[i],
});
```

---

## Step 5: 이모지 시스템 확장 — `src/lib/weather-utils.ts`

### 5-1. 시간대 판정 함수 추가

```ts
import SunCalc from 'suncalc';

export type TimeCategory = 'sunrise' | 'day' | 'sunset' | 'night';

/**
 * 시간별 아이템의 시간대 판정
 * - getSunTimes()는 KST 반환 → 해외 도시는 utcOffset으로 변환
 */
export function getTimeCategoryForHour(
  hourStr: string,        // "15:00"
  lat: number,
  lon: number,
  utcOffset?: number      // 도시의 UTC offset (없으면 KST=9 가정)
): TimeCategory {
  const hour = parseInt(hourStr.split(':')[0], 10);
  const times = SunCalc.getTimes(new Date(), lat, lon);

  // SunCalc → UTC → 대상 타임존으로 변환
  const offset = utcOffset ?? 9; // 기본 KST
  const toLocalHour = (d: Date) => {
    const utcH = d.getUTCHours() + d.getUTCMinutes() / 60;
    return ((utcH + offset) % 24 + 24) % 24;
  };

  const sunrise = toLocalHour(times.sunrise);
  const sunset = toLocalHour(times.sunset);

  // ±30분 경계
  if (hour >= sunrise - 0.5 && hour <= sunrise + 0.5) return 'sunrise';
  if (hour >= sunset - 0.5 && hour <= sunset + 0.5) return 'sunset';
  if (hour > sunrise + 0.5 && hour < sunset - 0.5) return 'day';
  return 'night';
}
```

핵심: `getSunTimes()`(theme.ts) 대신 `SunCalc.getTimes()`를 직접 사용하고, UTC에서 대상 도시의 local timezone으로 변환. 이러면 KST 고정 이슈 해결.

### 5-2. getWeatherEmoji() 확장

```ts
export function getWeatherEmoji(
  weatherMain: string,
  timeCategory?: TimeCategory
): string {
  const w = weatherMain.toLowerCase();

  // 강수/특수 날씨: 시간대 무관
  if (w === 'rain' || w === 'drizzle' || w === 'shower') return '🌧️';
  if (w === 'thunderstorm') return '⛈️';
  if (w === 'snow') return '❄️';
  if (w === 'mist' || w === 'fog' || w === 'haze') return '☁️'; // 사용자 확정

  // Clear: 시간대별 분기
  if (w === 'clear') {
    if (!timeCategory) return '☀️'; // 하위 호환
    if (timeCategory === 'night') return '🌙';
    if (timeCategory === 'sunrise' || timeCategory === 'sunset') return '🌤️';
    return '☀️';
  }

  // Clouds: 시간대 무관
  if (w === 'clouds' || w === 'overcast') return '☁️';

  // default
  if (!timeCategory) return '🌤️';
  return timeCategory === 'night' ? '🌙' : '🌤️';
}
```

기존 호출 (`getWeatherEmoji(weatherMain)`)은 `timeCategory` 없이 동작 → 하위 호환.

---

## Step 6: WeatherCard props 확장 — `src/components/WeatherCard.tsx`

### 6-1. import 추가
```ts
import type { CityData } from '@/lib/cities';
```

### 6-2. Props 확장 (line 9-13)
```ts
interface WeatherCardProps {
  weather: WeatherData;
  hourlyForecast?: HourlyForecastItem[] | null;
  hourlyLoading?: boolean;
  city?: CityData; // NEW
}
```

### 6-3. 함수 시그니처 (line 41)
```ts
export default function WeatherCard({
  weather, hourlyForecast, hourlyLoading = false, city
}: WeatherCardProps) {
```

### 6-4. 메인 이모지도 시간대 반영 (line 42)
```ts
import { getWeatherEmoji, getTimeCategoryForHour } from '@/lib/weather-utils';

// 현재 시간의 timeCategory 계산
const nowHour = `${String(new Date().getHours()).padStart(2, '0')}:00`;
const currentTimeCategory = city
  ? getTimeCategoryForHour(nowHour, city.lat, city.lon, city.utcOffset)
  : undefined;
const emoji = getWeatherEmoji(weather.weatherMain, currentTimeCategory);
```

### 6-5. HourlyForecast에 city 전달 (line 88)
```ts
<HourlyForecast data={hourlyForecast ?? null} loading={hourlyLoading} city={city} />
```

---

## Step 7: HourlyForecast 컴포넌트 개편 — `src/components/HourlyForecast.tsx`

### 7-1. Props 확장
```ts
import type { CityData } from '@/lib/cities';
import { getWeatherEmoji, getTimeCategoryForHour } from '@/lib/weather-utils';

interface HourlyForecastProps {
  data: HourlyForecastItem[] | null;
  loading: boolean;
  city?: CityData; // NEW
}
```

### 7-2. 날짜 라벨 헬퍼 (컴포넌트 외부)
```ts
function getDateLabel(dateStr: string): string {
  const itemDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((itemDate.getTime() - today.getTime()) / (86400000));
  if (diffDays === 1) return '내일';
  if (diffDays === 2) return '모레';
  return `${itemDate.getMonth() + 1}/${itemDate.getDate()}`;
}
```

### 7-3. 렌더링 로직 (map 내부)

```tsx
{data.map((item, i) => {
  const isNow = i === 0 || item.time === nowLabel;

  // Feature 2: 시간대별 이모지
  const timeCategory = (item.date && city)
    ? getTimeCategoryForHour(item.time, city.lat, city.lon, city.utcOffset)
    : undefined;
  const emoji = getWeatherEmoji(item.weatherMain, timeCategory);

  // Feature 3: 날짜 구분
  const prevDate = i > 0 ? data[i - 1]?.date : undefined;
  const showDivider = item.date && prevDate && item.date !== prevDate;

  return (
    <Fragment key={`${item.date}-${item.time}-${i}`}>
      {/* 날짜 구분 칩 */}
      {showDivider && (
        <div className="flex flex-col items-center justify-center w-12 shrink-0 snap-start"
             role="separator">
          <div className="h-5 w-px bg-white/30" />
          <span className="text-xs font-medium text-glass-primary bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap">
            {getDateLabel(item.date!)}
          </span>
          <div className="h-5 w-px bg-white/30" />
        </div>
      )}

      {/* 시간별 아이템 */}
      <div className={`flex flex-col items-center gap-0.5 w-14 shrink-0 py-2 px-1 rounded-lg snap-start transition-colors
        ${isNow ? 'bg-white/25 shadow-md scale-105' : 'bg-white/10 hover:bg-white/15'}`}>

        <span className={`text-xs ${isNow ? 'text-glass-primary font-semibold' : 'text-glass-muted'}`}>
          {isNow && i === 0 ? '지금' : item.time}
        </span>

        <span className="text-xl" aria-hidden="true">{emoji}</span>

        <span className={`text-sm ${isNow ? 'text-glass-primary font-semibold' : 'text-glass-secondary'}`}>
          {item.temperature}°
        </span>

        {/* Feature 4: 강수확률 (>0%일 때만) */}
        {item.precipitationProbability != null && item.precipitationProbability > 0 && (
          <span className="text-[10px] leading-none text-blue-200/80">
            💧{item.precipitationProbability}%
          </span>
        )}
      </div>
    </Fragment>
  );
})}
```

### 7-4. 스켈레톤 업데이트
- `gap-1.5` → `gap-0.5`
- 4번째 요소 추가: `<div className="w-5 h-2 bg-white/20 rounded" />`

---

## Step 8: CityWeatherPage 카드 레이아웃 + city prop — `src/components/CityWeatherPage.tsx`

### 8-1. 카드 순서 변경 (line 176-233)

현재: Header → ScoreGauge(1col) → OutfitCard(2col) → WeatherCard(1col) → DustCard(1col) → UvCard(1col)

변경 후 (page.tsx와 동일):
```
Header         → col-span-2 md:col-span-3
OutfitCard     → col-span-2 md:col-span-3
WeatherCard    → col-span-2 md:col-span-2  + city={city} prop
ScoreGauge     → col-span-2 md:col-span-1
DustCard       → col-span-1 md:col-span-2
UvCard         → col-span-1
```

### 8-2. WeatherCard에 city 전달
```tsx
<WeatherCard
  weather={weatherData}
  hourlyForecast={hourlyForecast}
  hourlyLoading={hourlyLoading && !initialData?.hourly}
  city={city}
/>
```

---

## Step 9: page.tsx WeatherCard city prop — `src/app/page.tsx`

메인 페이지는 geolocation 기반이라 특정 CityData가 없음.
- `city` prop 생략 (undefined) → 이모지 기본 동작 (하위 호환)
- 한국 사용자이므로 KST 기준 동작에 문제 없음

```tsx
<WeatherCard
  weather={weatherData}
  hourlyForecast={hourlyForecast}
  hourlyLoading={hourlyLoading}
/>
```

변경 없음 (city prop은 optional).

---

## 구현 순서

| # | 파일 | 작업 | 의존성 |
|---|------|------|--------|
| 1 | types/weather.ts | date, precipitationProbability 추가 | 없음 |
| 2 | lib/cities.ts | CityData에 utcOffset, 해외 도시에 값 추가 | 없음 |
| 3 | lib/kma-api.ts | POP 추출, date 추가 | Step 1 |
| 4 | lib/open-meteo-api.ts | precipitation_probability, date 추가 | Step 1 |
| 5 | lib/weather-utils.ts | getTimeCategoryForHour(), getWeatherEmoji() 확장 | Step 2 |
| 6 | components/WeatherCard.tsx | city prop 추가, 메인 이모지 시간대 반영 | Step 5 |
| 7 | components/HourlyForecast.tsx | 날짜 구분, 강수확률, 시간대 이모지, 스켈레톤 | Step 5, 6 |
| 8 | components/CityWeatherPage.tsx | 카드 순서 변경, city prop 전달 | Step 6, 7 |

---

## 수정 파일 총 8개

| 파일 | 변경량 | 내용 |
|------|--------|------|
| `src/types/weather.ts` | +2줄 | optional 필드 2개 |
| `src/lib/cities.ts` | +15줄 | 인터페이스 + 해외 도시 utcOffset |
| `src/lib/kma-api.ts` | +8줄 | POP switch + date/precip push |
| `src/lib/open-meteo-api.ts` | +5줄 | URL param + date/precip push |
| `src/lib/weather-utils.ts` | +50줄 | getTimeCategoryForHour() + getWeatherEmoji() 확장 |
| `src/components/WeatherCard.tsx` | +10줄 | city prop, 메인 이모지 시간대 |
| `src/components/HourlyForecast.tsx` | +40줄 | 날짜 구분 칩, 강수확률, 시간대 이모지 |
| `src/components/CityWeatherPage.tsx` | JSX 순서 변경 | 카드 레이아웃 + city 전달 |

---

## 검증

1. `npm run build` — 타입 에러 없음 확인
2. 브라우저 테스트:
   - `/` (메인): 강수확률 💧 표시, 날짜 구분 "내일" 칩
   - `/seoul`: 카드 레이아웃 변경 확인 (OutfitCard→WeatherCard→ScoreGauge 순)
   - `/osaka`: 밤 시간대 🌙, 일출 🌤️ (일본은 UTC+9라 KST와 동일)
   - `/bangkok`: 현지 시간 기준 일출/일몰 이모지 (UTC+7)
3. 모바일 반응형: 날짜 구분 칩 스크롤 정상, 강수확률 overflow 없음
4. 커밋
