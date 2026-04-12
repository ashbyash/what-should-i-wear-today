# Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 하드코딩된 디자인 값을 토큰 체계로 정리하고, Apple Weather 레퍼런스를 적용하여 디자인 시스템 구축

**Architecture:** CSS 변수(globals.css) + Tailwind 테마(tailwind.config.ts) + JS 토큰(design-tokens.ts)의 3레이어 구조. 기존 컴포넌트를 토큰 참조로 마이그레이션하고, ConditionsRow를 WeatherModuleGrid로 교체.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, framer-motion, vitest

**Spec:** `docs/specs/2026-04-12-design-system.md`

---

### Task 1: CSS 변수 체계 정의 (globals.css)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: 텍스트 계층 + 상태 색상 + 글래스 + 레이아웃 + 모션 CSS 변수 추가**

`src/app/globals.css`의 `:root` 블록을 아래로 교체:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;

  /* Text hierarchy */
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.80);
  --text-muted: rgba(255, 255, 255, 0.55);
  --text-disabled: rgba(255, 255, 255, 0.30);

  /* Status colors */
  --status-good: #4ade80;
  --status-moderate: #fbbf24;
  --status-bad: #f87171;

  /* Glass — dark background defaults */
  --glass-bg-outer: rgba(255, 255, 255, 0.12);
  --glass-bg-inner: rgba(255, 255, 255, 0.07);
  --glass-border-outer: rgba(255, 255, 255, 0.18);
  --glass-border-inner: rgba(255, 255, 255, 0.10);
  --glass-blur: 24px;
  --glass-radius-outer: 20px;
  --glass-radius-inner: 14px;
  --glass-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
  --glass-glow: inset 0 1px 0 rgba(255, 255, 255, 0.08);

  /* Layout */
  --layout-max-width: 48rem;
  --layout-page-padding: 16px;
  --layout-card-gap: 16px;
  --layout-card-padding-outer: 20px;
  --layout-card-padding-inner: 12px;
  --grid-module-columns: 2;
  --grid-module-gap: 12px;

  /* Motion */
  --motion-fast: 150ms;
  --motion-normal: 300ms;
  --motion-slow: 500ms;
  --motion-pulse: 1.5s;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);
  --stagger-step: 80ms;

  /* Safe area insets for iOS notch/home indicator */
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
}
```

- [ ] **Step 2: light 테마 모드 셀렉터 추가**

`globals.css`의 `@media (prefers-color-scheme: dark)` 블록 아래에 추가:

```css
/* Glass tokens for light backgrounds (dawn, morning, evening) */
[data-theme-mode="light"] {
  --glass-bg-outer: rgba(0, 0, 0, 0.18);
  --glass-bg-inner: rgba(0, 0, 0, 0.12);
  --glass-border-outer: rgba(255, 255, 255, 0.15);
  --glass-border-inner: rgba(255, 255, 255, 0.08);
  --glass-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
  --glass-glow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

- [ ] **Step 3: 빌드 확인**

Run: `npx next build 2>&1 | tail -5`
Expected: Build 성공 (CSS 변수 추가는 빌드에 영향 없음)

- [ ] **Step 4: 커밋**

```bash
git add src/app/globals.css
git commit -m "feat: add design system CSS variables

Define text hierarchy, status colors, glass surface, layout, and motion
tokens as CSS custom properties. Add data-theme-mode selector for light
background glass variants."
```

---

### Task 2: Tailwind 테마 + JS 토큰 정의

**Files:**
- Modify: `tailwind.config.ts`
- Create: `src/lib/design-tokens.ts`

- [ ] **Step 1: tailwind.config.ts 업데이트**

전체 theme.extend를 아래로 교체:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        glass: {
          primary: "var(--glass-primary)",
          secondary: "var(--glass-secondary)",
          muted: "var(--glass-muted)",
        },
        status: {
          good: "var(--status-good)",
          moderate: "var(--status-moderate)",
          bad: "var(--status-bad)",
        },
      },
      textColor: {
        skin: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'temperature': ['64px', { lineHeight: '1', fontWeight: '200', letterSpacing: '-2px' }],
        'score': ['40px', { lineHeight: '1.1', fontWeight: '600' }],
        'title': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'headline': ['16px', { lineHeight: '1.5', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.3', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '1.3', fontWeight: '500' }],
        'module-label': ['13px', { lineHeight: '1.3', fontWeight: '500' }],
      },
      borderRadius: {
        'glass-outer': 'var(--glass-radius-outer)',
        'glass-inner': 'var(--glass-radius-inner)',
      },
    },
  },
  plugins: [require("daisyui")],
};
export default config;
```

- [ ] **Step 2: src/lib/design-tokens.ts 생성**

```typescript
// Design System Tokens — JS constants for framer-motion and runtime use

// Spring presets for framer-motion
export const SPRING = {
  gentle: { type: 'spring' as const, stiffness: 120, damping: 14 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 20 },
} as const;

// Duration tokens (ms) — mirrors CSS variables for JS usage
export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  pulse: 1.5,
} as const;

// Easing tokens — mirrors CSS variables for JS usage
export const EASING = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.45, 0, 0.55, 1] as [number, number, number, number],
} as const;

// Stagger step (seconds)
export const STAGGER_STEP = 0.08;

// Score bar gradient thresholds and colors
export const SCORE_GRADIENTS = {
  good: { threshold: 70, gradient: 'linear-gradient(90deg, #34d399, #4ade80)' },
  moderate: { threshold: 40, gradient: 'linear-gradient(90deg, #fbbf24, #facc15)' },
  bad: { threshold: 0, gradient: 'linear-gradient(90deg, #fb923c, #f87171)' },
} as const;

// Status color hex values for inline style usage (e.g., color prop)
export const STATUS_COLORS = {
  good: '#4ade80',
  moderate: '#fbbf24',
  bad: '#f87171',
} as const;

export function getScoreGradient(percentage: number): string {
  if (percentage >= SCORE_GRADIENTS.good.threshold) return SCORE_GRADIENTS.good.gradient;
  if (percentage >= SCORE_GRADIENTS.moderate.threshold) return SCORE_GRADIENTS.moderate.gradient;
  return SCORE_GRADIENTS.bad.gradient;
}
```

- [ ] **Step 3: 빌드 확인**

Run: `npx next build 2>&1 | tail -5`
Expected: Build 성공

- [ ] **Step 4: 커밋**

```bash
git add tailwind.config.ts src/lib/design-tokens.ts
git commit -m "feat: add Tailwind theme tokens and JS design tokens

Update type scale (temperature, score, title, headline, body, caption,
label, module-label), add status/skin color tokens, glass border-radius
tokens. Create design-tokens.ts with spring presets, duration, easing,
and score gradient helpers."
```

---

### Task 3: 시간대 그라데이션 3색 전환 (theme.ts)

**Files:**
- Modify: `src/lib/theme.ts`

- [ ] **Step 1: TIME_GRADIENTS 타입을 3색으로 변경**

`src/lib/theme.ts`에서 `TIME_GRADIENTS` 상수를 수정:

```typescript
// 시간대별 그라데이션 (3-stop for natural sky)
export const TIME_GRADIENTS: Record<TimeOfDay, { from: string; via: string; to: string }> = {
  dawn: { from: '#8fb8de', via: '#dac5a0', to: '#c4a882' },
  morning: { from: '#e8967e', via: '#f0d5b0', to: '#8ec5e0' },
  day: { from: '#4ab8e0', via: '#5a9fe8', to: '#3478c6' },
  evening: { from: '#c87a8a', via: '#d4a0aa', to: '#5a4a72' },
  night: { from: '#0c0a1e', via: '#1a1545', to: '#2a2060' },
};
```

- [ ] **Step 2: getGradientStyle 함수 업데이트**

```typescript
export function getGradientStyle(gradient: { from: string; via: string; to: string }): React.CSSProperties {
  return {
    background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.via}, ${gradient.to})`,
  };
}
```

- [ ] **Step 3: defaultGradientStyle 수정 — CityWeatherPage.tsx**

`src/components/CityWeatherPage.tsx`의 `defaultGradientStyle` useMemo를 수정:

```typescript
const defaultGradientStyle = useMemo(() => {
  const gradient = TIME_GRADIENTS[getTimeOfDay(clientHour, { lat: city.lat, lon: city.lon })];
  return { background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.via}, ${gradient.to})` };
}, [clientHour, city.lat, city.lon]);
```

- [ ] **Step 4: page.tsx의 defaultGradientStyle도 동일하게 수정**

`src/app/page.tsx`에서 `TIME_GRADIENTS`를 사용하는 모든 곳에서 `via` 포함 형태로 수정. `defaultGradientStyle` useMemo:

```typescript
const defaultGradientStyle = useMemo(() => {
  const gradient = TIME_GRADIENTS[getTimeOfDay(clientHour)];
  return { background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.via}, ${gradient.to})` };
}, [clientHour]);
```

- [ ] **Step 5: CitySearchModal.tsx의 DEFAULT_GRADIENT 참조 확인**

`src/components/CitySearchModal.tsx`에서 `TIME_GRADIENTS.night`를 참조하는 부분 확인. `DEFAULT_GRADIENT`는 `TIME_GRADIENTS.night` 참조만 하므로 타입 변경에 자동 대응됨. 단, 이를 사용하는 곳에서 `via` 포함 그라데이션을 생성하는지 확인 필요.

Run: `grep -n "DEFAULT_GRADIENT\|gradient.from\|gradient.to" src/components/CitySearchModal.tsx`

해당 파일에서 gradient를 CSS로 렌더링하는 부분이 있다면 3색 형태로 수정.

- [ ] **Step 6: 빌드 확인**

Run: `npx next build 2>&1 | tail -10`
Expected: Build 성공. `via` 속성 없음 에러가 나면 타입 참조하는 다른 파일 확인.

- [ ] **Step 7: 커밋**

```bash
git add src/lib/theme.ts src/components/CityWeatherPage.tsx src/app/page.tsx src/components/CitySearchModal.tsx
git commit -m "feat: upgrade time gradients to 3-stop colors

Add via color stops for more natural sky representation.
Dawn/morning/evening get richer transitions, night gets deeper navy."
```

---

### Task 4: GlassCard 리팩토링 (CSS 변수 참조)

**Files:**
- Modify: `src/components/GlassCard.tsx`
- Modify: `src/components/CityWeatherPage.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: GlassCard를 CSS 변수 참조로 리팩토링**

`src/components/GlassCard.tsx` 전체를 아래로 교체.
`isLight` prop은 optional로 유지하되 내부에서 사용하지 않는다 (하위 호환). Task 7~9에서 호출부를 정리한 후 최종 제거.

```typescript
'use client';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'outer' | 'inner';
  /** @deprecated CSS variables handle light/dark via data-theme-mode */
  isLight?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  variant = 'outer',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isLight,
  className = '',
  onClick,
}: GlassCardProps) {
  const isOuter = variant === 'outer';

  const styles: React.CSSProperties = {
    background: isOuter ? 'var(--glass-bg-outer)' : 'var(--glass-bg-inner)',
    border: `1px solid ${isOuter ? 'var(--glass-border-outer)' : 'var(--glass-border-inner)'}`,
    borderRadius: isOuter ? 'var(--glass-radius-outer)' : 'var(--glass-radius-inner)',
    padding: isOuter ? 'var(--layout-card-padding-outer)' : 'var(--layout-card-padding-inner)',
    ...(isOuter ? {
      backdropFilter: `blur(var(--glass-blur))`,
      WebkitBackdropFilter: `blur(var(--glass-blur))`,
      boxShadow: `var(--glass-shadow), var(--glass-glow)`,
    } : {}),
  };

  return (
    <div className={className} style={styles} onClick={onClick}>
      {children}
    </div>
  );
}

export function GlassInner({
  children,
  isLight,
  className = '',
}: Omit<GlassCardProps, 'variant'>) {
  return (
    <GlassCard variant="inner" className={className}>
      {children}
    </GlassCard>
  );
}
```

- [ ] **Step 2: CityWeatherPage에 data-theme-mode 속성 추가**

`src/components/CityWeatherPage.tsx`의 최상위 div에 `data-theme-mode` 추가:

```typescript
<div
  className={`min-h-screen pt-safe pb-safe transition-colors duration-500 ${theme.overlay}`}
  style={gradientStyle}
  data-theme={theme.isLight ? 'light' : 'dark'}
  data-theme-mode={theme.isLight ? 'light' : 'dark'}
>
```

- [ ] **Step 3: page.tsx에도 data-theme-mode 속성 추가**

`src/app/page.tsx`의 최상위 div에도 동일하게 `data-theme-mode` 추가.

> **Note:** GlassCard는 `isLight`를 아직 props에 유지 (deprecated, 무시됨). 자식 컴포넌트들의 `isLight` prop은 Task 7~9에서 순차 제거.

- [ ] **Step 5: 빌드 확인**

Run: `npx next build 2>&1 | tail -10`
Expected: Build 성공. GlassCard에서 `isLight` prop을 받지 않으므로 타입 에러 발생 시 호출부에서 prop 제거.

- [ ] **Step 6: 커밋**

```bash
git add src/components/GlassCard.tsx src/components/CityWeatherPage.tsx src/app/page.tsx
git commit -m "refactor: GlassCard uses CSS variables instead of inline styles

Remove isLight prop from GlassCard. Glass surface tokens are now
controlled by data-theme-mode attribute on the page container.
Add shadow and inner glow effects per design system spec."
```

---

### Task 5: WeatherModule + WeatherModuleGrid 컴포넌트 생성

**Files:**
- Create: `src/components/WeatherModule.tsx`
- Create: `src/components/WeatherModuleGrid.tsx`

- [ ] **Step 1: WeatherModule 컴포넌트 생성**

`src/components/WeatherModule.tsx`:

```typescript
'use client';

import { GlassInner } from './GlassCard';

interface WeatherModuleProps {
  icon: string;
  label: string;
  value: string;
  unit?: string;
  description: string;
  color?: string;
}

export default function WeatherModule({
  icon,
  label,
  value,
  unit,
  description,
  color,
}: WeatherModuleProps) {
  return (
    <GlassInner className="flex flex-col gap-2">
      {/* Header: icon + label */}
      <div className="flex items-center gap-1.5">
        <span className="text-[13px]" aria-hidden="true">{icon}</span>
        <span className="text-module-label text-skin-muted uppercase tracking-wide">
          {label}
        </span>
      </div>

      {/* Value */}
      <div>
        <span
          className="text-[24px] font-light leading-none"
          style={color ? { color } : { color: 'var(--text-primary)' }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-body text-skin-muted ml-1">{unit}</span>
        )}
      </div>

      {/* Description */}
      <span className="text-caption text-skin-muted">{description}</span>
    </GlassInner>
  );
}
```

- [ ] **Step 2: WeatherModuleGrid 컴포넌트 생성**

`src/components/WeatherModuleGrid.tsx`:

```typescript
interface WeatherModuleGridProps {
  children: React.ReactNode;
  columns?: number;
}

export default function WeatherModuleGrid({
  children,
  columns = 2,
}: WeatherModuleGridProps) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 'var(--grid-module-gap)',
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: 빌드 확인**

Run: `npx next build 2>&1 | tail -5`
Expected: Build 성공 (컴포넌트 생성만, 아직 사용하지 않음)

- [ ] **Step 4: 커밋**

```bash
git add src/components/WeatherModule.tsx src/components/WeatherModuleGrid.tsx
git commit -m "feat: add WeatherModule and WeatherModuleGrid components

Apple Weather-inspired 2x2 module grid with icon, label, value,
unit, description, and optional status color per module."
```

---

### Task 6: ConditionsRow → WeatherModuleGrid 교체

**Files:**
- Modify: `src/components/CityWeatherPage.tsx`
- Modify: `src/app/page.tsx`
- Delete: `src/components/ConditionsRow.tsx`

- [ ] **Step 1: CityWeatherPage에서 ConditionsRow를 WeatherModuleGrid로 교체**

`src/components/CityWeatherPage.tsx` import 변경:

```typescript
// 삭제:
// import ConditionsRow from '@/components/ConditionsRow';
// 추가:
import WeatherModule from '@/components/WeatherModule';
import WeatherModuleGrid from '@/components/WeatherModuleGrid';
```

ConditionsRow 사용부 (line ~211) 를 아래로 교체:

```tsx
{/* Weather Modules — full width */}
<WeatherModuleGrid>
  <WeatherModule
    icon="💨"
    label="미세먼지"
    value={airQualityData.pm25 !== undefined ? getPM25Level(airQualityData.pm25) : '--'}
    description={airQualityData.pm25 !== undefined ? `PM2.5 ${airQualityData.pm25}㎍/㎥` : '데이터 없음'}
    color={airQualityData.pm25 !== undefined ? getPM25Color(airQualityData.pm25) : undefined}
  />
  <WeatherModule
    icon="☀️"
    label="자외선"
    value={uvSource?.uvIndex !== undefined ? getUVLevel(uvSource.uvIndex) : '--'}
    description={uvSource?.uvIndex !== undefined ? `UV 지수 ${uvSource.uvIndex}` : '데이터 없음'}
    color={uvSource?.uvIndex !== undefined ? getUVColor(uvSource.uvIndex) : undefined}
  />
  <WeatherModule
    icon="💧"
    label="습도"
    value={weatherData.humidity !== undefined ? `${weatherData.humidity}%` : '--'}
    description={getHumidityDescription(weatherData.humidity)}
  />
  <WeatherModule
    icon="🌬️"
    label="바람"
    value={weatherData.windSpeed !== undefined ? `${weatherData.windSpeed}` : '--'}
    unit="m/s"
    description={getWindDescription(weatherData.windSpeed)}
  />
</WeatherModuleGrid>
```

그리고 파일 상단에 헬퍼 함수들을 추가 (ConditionsRow에서 이동):

```typescript
function getPM25Level(pm25: number): string {
  if (pm25 <= 15) return '좋음';
  if (pm25 <= 35) return '보통';
  if (pm25 <= 75) return '나쁨';
  return '매우나쁨';
}

function getPM25Color(pm25: number): string {
  if (pm25 <= 15) return '#4ade80';
  if (pm25 <= 35) return '#fbbf24';
  return '#f87171';
}

function getUVLevel(uvIndex: number): string {
  if (uvIndex <= 2) return '낮음';
  if (uvIndex <= 5) return '보통';
  if (uvIndex <= 7) return '높음';
  if (uvIndex <= 10) return '매우높음';
  return '위험';
}

function getUVColor(uvIndex: number): string {
  if (uvIndex <= 2) return '#4ade80';
  if (uvIndex <= 5) return '#fbbf24';
  return '#f87171';
}

function getHumidityDescription(humidity?: number): string {
  if (humidity === undefined) return '데이터 없음';
  if (humidity >= 40 && humidity <= 60) return '쾌적한 수준';
  if (humidity < 40) return '건조한 편';
  return '습한 편';
}

function getWindDescription(windSpeed?: number): string {
  if (windSpeed === undefined) return '데이터 없음';
  if (windSpeed < 2) return '바람 거의 없음';
  if (windSpeed < 5) return '산들바람';
  if (windSpeed < 8) return '약간 강한 바람';
  return '강풍';
}
```

- [ ] **Step 2: page.tsx에서도 동일하게 교체**

`src/app/page.tsx`에서 `ConditionsRow` import를 `WeatherModule`, `WeatherModuleGrid`로 교체하고, ConditionsRow 사용부 (line ~238)를 동일한 WeatherModuleGrid 구조로 교체. 동일한 헬퍼 함수들 추가.

> **Note:** 두 파일에서 헬퍼 함수가 중복된다. 이후 리팩토링에서 `src/lib/weather-format.ts` 같은 공유 유틸로 추출 가능하나, 현 태스크에서는 YAGNI 원칙으로 각 파일에 둔다.

- [ ] **Step 3: ConditionsRow.tsx 삭제**

```bash
git rm src/components/ConditionsRow.tsx
```

- [ ] **Step 4: 빌드 확인**

Run: `npx next build 2>&1 | tail -10`
Expected: Build 성공. ConditionsRow import가 남아있으면 에러 — 모든 참조 제거 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/components/CityWeatherPage.tsx src/app/page.tsx
git commit -m "feat: replace ConditionsRow with WeatherModuleGrid

Convert horizontal 3-badge layout to Apple Weather-style 2x2 module
grid. Add wind module. Each module now shows value + description.
Remove ConditionsRow component."
```

---

### Task 7: HeroCard 토큰 마이그레이션

**Files:**
- Modify: `src/components/HeroCard.tsx`

- [ ] **Step 1: 인라인 스타일을 토큰 클래스로 교체**

`src/components/HeroCard.tsx`에서:

1. 텍스트 색상 변수를 CSS 변수로:
```typescript
// 변경 전:
const primaryText = 'text-white/95';
const secondaryText = 'text-white/80';
const mutedText = 'text-white/55';

// 변경 후:
const primaryText = 'text-skin-primary';
const secondaryText = 'text-skin-secondary';
const mutedText = 'text-skin-muted';
```

2. 온도 표시 인라인 스타일을 토큰으로:
```tsx
// 변경 전:
<span className={primaryText} style={{ fontSize: '56px', lineHeight: 1, fontWeight: 300 }}>

// 변경 후:
<span className={`${primaryText} text-temperature`}>
```

3. 점수 표시:
```tsx
// 변경 전:
<span className={`font-semibold leading-none ${scoreColorClass}`} style={{ fontSize: '36px' }}>

// 변경 후:
<span className={`text-score ${scoreColorClass}`}>
```

4. import 추가 + BreakdownBar에 design-tokens 적용:
```typescript
import { getScoreGradient, DURATION, EASING, STAGGER_STEP } from '@/lib/design-tokens';
```

BreakdownBar의 gradient 계산:
```tsx
// 변경 전:
style={{
  background: percentage >= 70
    ? 'linear-gradient(90deg, #34d399, #4ade80)'
    : percentage >= 40
      ? 'linear-gradient(90deg, #fbbf24, #facc15)'
      : 'linear-gradient(90deg, #fb923c, #f87171)',
}}

// 변경 후:
style={{ background: getScoreGradient(percentage) }}
```

5. framer-motion transition에 토큰 적용:
```tsx
// BreakdownBar entry:
transition={{ delay, duration: DURATION.normal }}

// BreakdownBar bar fill:
transition={{ delay: delay + STAGGER_STEP, duration: DURATION.slow, ease: EASING.out }}

// Score expand/collapse:
transition={{ duration: DURATION.normal, ease: EASING.inOut }}

// Weather emoji rotation: 유지 (장식적 애니메이션은 토큰 대상 아님)
```

- [ ] **Step 2: GlassCard isLight prop 제거**

HeroCard에서 GlassCard 호출 시 `isLight` prop 제거:
```tsx
// 변경 전:
<GlassCard isLight={isLight} className="flex flex-col gap-3">
// 변경 후:
<GlassCard className="flex flex-col gap-3">
```

GlassInner도 동일:
```tsx
// 변경 전:
<GlassInner isLight={isLight} className="space-y-3">
// 변경 후:
<GlassInner className="space-y-3">
```

HeroCardProps에서 `isLight` 제거. 단, `isLight`를 다른 목적(텍스트 색상 제어)에 아직 사용하지 않으므로 안전하게 제거 가능.

- [ ] **Step 3: 빌드 확인**

Run: `npx next build 2>&1 | tail -10`
Expected: Build 성공

- [ ] **Step 4: 커밋**

```bash
git add src/components/HeroCard.tsx
git commit -m "refactor: migrate HeroCard to design system tokens

Replace inline styles with token classes (text-temperature, text-score).
Use text-skin-* for text hierarchy. Apply motion tokens from
design-tokens.ts. Use getScoreGradient() for breakdown bars."
```

---

### Task 8: OutfitCard + HourlyForecast + Skeleton 토큰 마이그레이션

**Files:**
- Modify: `src/components/OutfitCard.tsx`
- Modify: `src/components/HourlyForecast.tsx`
- Modify: `src/components/Skeleton.tsx`

- [ ] **Step 1: OutfitCard 마이그레이션**

`src/components/OutfitCard.tsx`에서:

1. 텍스트 색상 토큰으로 교체:
```typescript
// 변경 전:
const colorPrimary = 'text-white/95';
const colorSecondary = 'text-white/80';
const colorMuted = 'text-white/55';
const borderColor = 'border-white/20';

// 변경 후:
const colorPrimary = 'text-skin-primary';
const colorSecondary = 'text-skin-secondary';
const colorMuted = 'text-skin-muted';
const borderColor = 'border-white/20'; // 유지 (glass border와 다른 용도)
```

2. GlassCard `isLight` prop 제거:
```tsx
// 변경 전:
<GlassCard variant="outer" isLight={isLight} className="h-full">
// 변경 후:
<GlassCard variant="outer" className="h-full">
```

3. OutfitCardProps에서 `isLight` 제거:
```typescript
interface OutfitCardProps {
  outfit: OutfitRecommendation;
  weatherContext?: { ... };
}
```

- [ ] **Step 2: HourlyForecast 마이그레이션**

`src/components/HourlyForecast.tsx`에서:

1. GlassCard/GlassInner `isLight` prop 제거
2. 텍스트 색상을 `text-skin-*` 토큰으로 교체 (파일 내 `text-white/XX` 패턴 검색하여 교체)

- [ ] **Step 3: Skeleton 모션 토큰 적용**

`src/components/Skeleton.tsx`에서:

```typescript
import { DURATION, EASING } from '@/lib/design-tokens';
```

모든 `transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}` 를:

```typescript
transition={{ duration: DURATION.pulse, repeat: Infinity, ease: EASING.inOut }}
```

- [ ] **Step 4: 빌드 확인**

Run: `npx next build 2>&1 | tail -10`
Expected: Build 성공

- [ ] **Step 5: 커밋**

```bash
git add src/components/OutfitCard.tsx src/components/HourlyForecast.tsx src/components/Skeleton.tsx
git commit -m "refactor: migrate OutfitCard, HourlyForecast, Skeleton to tokens

Apply text-skin-* hierarchy tokens, remove isLight props from
GlassCard calls, use motion tokens from design-tokens.ts."
```

---

### Task 9: CityWeatherPage + page.tsx isLight prop 정리

**Files:**
- Modify: `src/components/CityWeatherPage.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/PopularCities.tsx`
- Modify: `src/components/CitySearchModal.tsx`

- [ ] **Step 1: CityWeatherPage에서 불필요한 isLight prop 전달 제거**

Task 7~8에서 HeroCard, OutfitCard, HourlyForecast의 isLight를 제거했으므로, CityWeatherPage에서 해당 prop 전달도 제거:

```tsx
// HeroCard에서 isLight 제거 (이미 HeroCard에서 제거됨)
// OutfitCard에서 isLight 제거
// HourlyForecast에서 isLight 제거
```

PopularCities에서도 `isLight` prop 제거 필요 → PopularCities.tsx 수정.

- [ ] **Step 2: PopularCities 마이그레이션**

`src/components/PopularCities.tsx`에서 `isLight` prop 제거하고 텍스트 색상을 `text-skin-*` 토큰으로 교체. GlassCard 호출이 있으면 `isLight` 제거.

- [ ] **Step 3: page.tsx에서도 동일하게 isLight prop 전달 제거**

- [ ] **Step 4: CitySearchModal 모션/글래스 토큰 적용**

`src/components/CitySearchModal.tsx`에서:
- framer-motion transition에 DURATION, EASING, STAGGER_STEP 토큰 적용
- 텍스트 색상을 `text-skin-*` 토큰으로 교체

- [ ] **Step 5: GlassCard에서 deprecated isLight prop 완전 제거**

모든 컴포넌트에서 `isLight` prop이 제거되었으므로, `src/components/GlassCard.tsx`에서 `isLight` prop을 interface와 함수 시그니처에서 완전 제거:

```typescript
interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'outer' | 'inner';
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  variant = 'outer',
  className = '',
  onClick,
}: GlassCardProps) {
```

GlassInner도 동일하게 `isLight` 제거.

- [ ] **Step 6: lint + 빌드 확인**

Run: `npx next lint && npx next build 2>&1 | tail -10`
Expected: lint 통과, build 성공. isLight가 남아있는 곳이 있으면 빌드 에러 → 해당 파일 수정.

- [ ] **Step 7: 커밋**

```bash
git add src/components/GlassCard.tsx src/components/CityWeatherPage.tsx src/app/page.tsx src/components/PopularCities.tsx src/components/CitySearchModal.tsx
git commit -m "refactor: remove isLight prop chain, apply tokens to remaining components

Clean up deprecated isLight prop from GlassCard and all consumers.
Migrate PopularCities and CitySearchModal to design system tokens."
```

---

### Task 10: 최종 검증

**Files:** (변경 없음 — 검증만)

- [ ] **Step 1: 전체 lint 실행**

Run: `npx next lint`
Expected: 에러 없음

- [ ] **Step 2: 전체 빌드 실행**

Run: `npx next build`
Expected: Build 성공

- [ ] **Step 3: 기존 테스트 실행**

Run: `npx vitest run`
Expected: 모든 테스트 통과 (score.test.ts, outfit.test.ts — 로직 변경 없으므로)

- [ ] **Step 4: 시각적 검증 (dev server)**

Run: `npx next dev`

확인 사항:
1. 시간대별 3색 그라데이션 배경 정상 렌더링
2. 글래스 카드 — 어두운/밝은 배경 모두 정상
3. inner glow + shadow 효과 확인
4. WeatherModuleGrid 2×2 그리드 렌더링
5. 온도 표시 64px/200 스타일 확인
6. 텍스트 계층 (primary/secondary/muted) 일관성
7. 모바일 반응형 확인

- [ ] **Step 5: 최종 커밋 (필요 시)**

누락된 변경사항이 있으면 커밋.
