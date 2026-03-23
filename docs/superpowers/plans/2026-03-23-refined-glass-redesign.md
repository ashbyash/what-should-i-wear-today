# Refined Glass Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the weather app's visual design with Refined Glass aesthetic — new Hero Card, Conditions Row, updated spacing/radius, while preserving all existing functionality.

**Architecture:** Bottom-up approach. First create shared glass design tokens, then build new components (HeroCard, ConditionsRow), modify existing ones (OutfitCard, HourlyForecast), update page layouts, and finally clean up removed components. Each task produces a buildable state.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, DaisyUI

**Spec:** `docs/superpowers/specs/2026-03-23-refined-glass-redesign.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/components/GlassCard.tsx` | Shared glass card wrapper (outer/inner variants, light/dark responsive) |
| `src/components/HeroCard.tsx` | Merged location + temp + score + AI message |
| `src/components/ConditionsRow.tsx` | Compact PM2.5 / UV / Humidity badges |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/OutfitCard.tsx` | Apply glass tokens, structured rows with category labels |
| `src/components/HourlyForecast.tsx` | Standalone card wrapper, glass-inner items |
| `src/components/PopularCities.tsx` | Glass-inner pill style |
| `src/components/Footer.tsx` | Match glass tokens |
| `src/app/page.tsx` | New card order, HeroCard/ConditionsRow, 2-col desktop grid |
| `src/components/CityWeatherPage.tsx` | Same layout changes as page.tsx |
| `src/lib/animation-variants.ts` | Update damping 15→20 |

### Deleted Files
| File | Reason |
|------|--------|
| `src/components/ScoreGauge.tsx` | Absorbed into HeroCard |
| `src/components/WeatherCard.tsx` | Data split across HeroCard, HourlyForecast, ConditionsRow |
| `src/components/DustCard.tsx` | Merged into ConditionsRow |
| `src/components/UvCard.tsx` | Merged into ConditionsRow |
| `src/components/LocationHeader.tsx` | Absorbed into HeroCard |
| `src/components/AirQualityCard.tsx` | Unused (not imported anywhere) |

---

## Task 1: GlassCard shared component

**Files:**
- Create: `src/components/GlassCard.tsx`

- [ ] **Step 1: Create GlassCard component**

```tsx
// src/components/GlassCard.tsx
'use client';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'outer' | 'inner';
  isLight?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  variant = 'outer',
  isLight = false,
  className = '',
  onClick,
}: GlassCardProps) {
  const styles = variant === 'outer'
    ? {
        background: isLight ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
        border: isLight ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.2)',
      }
    : {
        background: isLight ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
        border: isLight ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.15)',
      };

  const radius = variant === 'outer' ? 'rounded-[18px]' : 'rounded-xl';
  const padding = variant === 'outer' ? 'p-5' : 'p-3';
  const blur = variant === 'outer' ? 'backdrop-blur-[20px]' : '';

  return (
    <div
      className={`${radius} ${padding} ${blur} ${className}`}
      style={styles}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function GlassInner({
  children,
  isLight = false,
  className = '',
}: Omit<GlassCardProps, 'variant'>) {
  return (
    <GlassCard variant="inner" isLight={isLight} className={className}>
      {children}
    </GlassCard>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds (new file, no consumers yet)

- [ ] **Step 3: Commit**

```bash
git add src/components/GlassCard.tsx
git commit -m "feat: add GlassCard shared component with glass tokens"
```

---

## Task 2: Update animation variants

**Files:**
- Modify: `src/lib/animation-variants.ts`

- [ ] **Step 1: Update damping value**

In `src/lib/animation-variants.ts`, change the cardVariants spring transition:
- `damping: 15` → `damping: 20`
- `stiffness`는 이미 100으로 설정되어 있으므로 변경 불필요

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/lib/animation-variants.ts
git commit -m "feat: adjust spring animation damping for smoother feel"
```

---

## Task 3: HeroCard component

**Files:**
- Create: `src/components/HeroCard.tsx`

- [ ] **Step 1: Create HeroCard component**

Build the HeroCard that merges LocationHeader + ScoreGauge + WeatherCard top section:

```tsx
// src/components/HeroCard.tsx
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GlassCard, { GlassInner } from './GlassCard';
import { useAIMessage } from '@/lib/useAIMessage';
import type { WeatherData } from '@/types/weather';
import type { OutingScore } from '@/types/score';

interface HeroCardProps {
  locationName: string;
  weather: WeatherData;
  score: OutingScore;
  isLight: boolean;
  // LocationHeader props
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isFromCache?: boolean;
  cacheReason?: string | null;
  onSearchClick?: () => void;
  isViewingOtherLocation?: boolean;
  onReturnToCurrentLocation?: () => void;
  // AI message context
  weatherContext?: {
    temperature: number;
    feelsLike: number;
    weatherMain: string;
    pm25: number;
    humidity?: number;
    windSpeed?: number;
    uvIndex?: number;
  };
}
```

Contents (migrate from LocationHeader + ScoreGauge + WeatherCard):
- Top row: location name (탭 → onSearchClick) + 업데이트 시간 + 새로고침 버튼
- Cache banner (isFromCache)
- "내 위치로" 버튼 (isViewingOtherLocation)
- Main area: 큰 온도 (font-weight: 200, text-5xl) 좌측 + 점수 (font-weight: 600, text-4xl) 우측
- 날씨 이모지 + 상태 + 체감온도 (온도 아래)
- 점수 이모지 + "SCORE" 라벨 (점수 아래)
- 점수 탭 → breakdown 확장/축소 (기존 ScoreGauge 로직 이식)
- AI 메시지 glass-inner 박스 (하단)

Key logic to migrate:
- `getRelativeTime()` from LocationHeader (lines 8-18)
- Score breakdown panel from ScoreGauge (isExpanded state, breakdown bars)
- `useAIMessage` hook call from ScoreGauge
- `getScoreColor()`, `getScoreEmoji()` functions from ScoreGauge

Use `GlassCard` and `GlassInner` for all card styling. Pass `isLight` through.

Text color classes based on isLight:
- Primary: `isLight ? 'text-[rgba(30,30,50,0.85)]' : 'text-white/95'`
- Secondary: `isLight ? 'text-[rgba(30,30,50,0.7)]' : 'text-white/80'`
- Muted: `isLight ? 'text-[rgba(30,30,50,0.4)]' : 'text-white/45'`

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds (no consumers yet)

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroCard.tsx
git commit -m "feat: add HeroCard merging location, temp, and score"
```

---

## Task 4: ConditionsRow component

**Files:**
- Create: `src/components/ConditionsRow.tsx`

- [ ] **Step 1: Create ConditionsRow component**

```tsx
// src/components/ConditionsRow.tsx
'use client';

import { GlassInner } from './GlassCard';
import type { AirQualityData } from '@/types/weather';

interface ConditionsRowProps {
  airQuality?: AirQualityData;
  uvIndex?: number;
  humidity?: number;
  isLight?: boolean;
  loading?: boolean;
}
```

3 compact badges in a flex row:
- 💨 PM2.5 → `dustData.pm25` → level label + color
- ☀️ 자외선 → `uvIndex` → level label + color
- 💧 습도 → `humidity%` → value + color

Color logic:
- Green (`text-[#4ade80]`): PM2.5 0-15, UV 0-2, Humidity 40-60%
- Yellow (`text-[#fbbf24]`): PM2.5 16-35, UV 3-5, Humidity 30-39% or 61-70%
- Red (`text-[#f87171]`): PM2.5 36+, UV 6+, Humidity <30% or >70%

Loading skeleton: 3 glass-inner badges with pulsing opacity.

Use `GlassInner` with `isLight` for each badge.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/ConditionsRow.tsx
git commit -m "feat: add ConditionsRow compact badges for PM2.5, UV, humidity"
```

---

## Task 5: Modify OutfitCard

**Files:**
- Modify: `src/components/OutfitCard.tsx` (119 lines)

- [ ] **Step 1: Update OutfitCard styling**

Changes:
- Wrap with `GlassCard` instead of DaisyUI `.card`
- Add `isLight?: boolean` prop (optional with default `false` — page.tsx에서 아직 전달 안 하므로)
- Title: uppercase, letter-spacing, muted color ("TODAY'S OUTFIT")
- Category rows: emoji (18px, 24px width) → category label (11px, muted, 32px width) → item name (13px, secondary)
- Use text color classes based on `isLight`
- Keep alert section and AI styling tip unchanged (just restyle to match)

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds (existing consumers still pass old props — will update in Task 7)

- [ ] **Step 3: Commit**

```bash
git add src/components/OutfitCard.tsx
git commit -m "feat: restyle OutfitCard with glass tokens"
```

---

## Task 6: Modify HourlyForecast as standalone card

**Files:**
- Modify: `src/components/HourlyForecast.tsx` (162 lines)

- [ ] **Step 1: Update HourlyForecast to standalone card**

Changes:
- Wrap entire component with `GlassCard` (no longer embedded in WeatherCard)
- Add `isLight?: boolean` prop (optional with default `false`)
- **Important**: `WeatherCard.tsx`에서 `HourlyForecast` 렌더링을 제거하고 `null`로 교체. 이렇게 해야 Task 10에서 WeatherCard 삭제 시까지 GlassCard 이중 래핑이 발생하지 않음
- Title: uppercase, letter-spacing, muted ("HOURLY FORECAST")
- Each hourly item: wrap with `GlassInner` (min-width 52px, text-align center)
- Use text color classes based on `isLight`
- Keep existing scroll logic, date dividers, current hour highlight

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/HourlyForecast.tsx
git commit -m "feat: restyle HourlyForecast as standalone glass card"
```

---

## Task 7: Update page.tsx (Home)

**Files:**
- Modify: `src/app/page.tsx` (285 lines)

- [ ] **Step 1: Replace imports**

Remove imports: `LocationHeader`, `ScoreGauge`, `WeatherCard`, `DustCard`, `UvCard`
Add imports: `HeroCard`, `ConditionsRow`

- [ ] **Step 2: Update HomeContent layout**

Replace the existing grid layout with new card order:

```
<div className="flex flex-col gap-4 max-w-3xl mx-auto px-4">
  {/* Hero Card — full width */}
  <HeroCard
    locationName={...}
    weather={weather}
    score={score}
    isLight={isLight}
    lastUpdated={...}
    onRefresh={...}
    isRefreshing={...}
    isFromCache={...}
    cacheReason={...}
    onSearchClick={...}
    isViewingOtherLocation={...}
    onReturnToCurrentLocation={...}
    weatherContext={weatherContext}
  />

  {/* Outfit + Hourly — 1col mobile, 2col desktop */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <OutfitCard outfit={outfit} weatherContext={...} isLight={isLight} />
    <HourlyForecast data={hourlyData} loading={hourlyLoading} city={city} isLight={isLight} />
  </div>

  {/* Conditions Row — full width */}
  {/* 주의: airQuality는 변환된 airQualityData 변수 사용, uvIndex는 uv?.uvIndex 사용 */}
  <ConditionsRow
    airQuality={airQualityData}
    uvIndex={uv?.uvIndex}
    humidity={weather?.humidity}
    isLight={isLight}
    loading={isLoading}
  />

  {/* Popular Cities — full width */}
  <PopularCities currentCitySlug={citySlug} isLight={isLight} />
</div>
```

- [ ] **Step 3: Remove unused variables/logic**

Clean up any variables that were only used by removed components (e.g., standalone score gauge SVG calculations).

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: update homepage layout with HeroCard and ConditionsRow"
```

---

## Task 8: Update CityWeatherPage

**Files:**
- Modify: `src/components/CityWeatherPage.tsx` (249 lines)

- [ ] **Step 1: Apply same layout changes as page.tsx**

Mirror Task 7 changes:
- Replace imports (remove LocationHeader, ScoreGauge, WeatherCard, DustCard, UvCard → add HeroCard, ConditionsRow)
- Same card order: HeroCard → Outfit+Hourly grid → ConditionsRow → PopularCities
- Same responsive 2-col grid for Outfit | Hourly
- Pass `isLight` to all components
- Keep ISR hydration logic, initialData handling unchanged
- **주의**: CityWeatherPage에서는 `isFromCache`/`cacheReason` 불필요 (고정 도시 페이지이므로). HeroCard에 해당 props 전달하지 않아도 됨 (optional이므로)

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/CityWeatherPage.tsx
git commit -m "feat: update CityWeatherPage layout to match new design"
```

---

## Task 9: Restyle PopularCities and Footer

**Files:**
- Modify: `src/components/PopularCities.tsx` (46 lines)
- Modify: `src/components/Footer.tsx` (37 lines)

- [ ] **Step 1: Update PopularCities**

- Replace DaisyUI card styling with `GlassInner` pill buttons (`rounded-[20px]`, `px-4 py-2`)
- Use text color classes based on `isLight`
- Keep links and filtering logic

- [ ] **Step 2: Update Footer**

- Apply glass token styling for consistency
- Use text color classes based on `isLight` (already mostly does this)
- Ensure `rounded-[18px]` if wrapped, or just text styling if flat

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/PopularCities.tsx src/components/Footer.tsx
git commit -m "feat: restyle PopularCities and Footer with glass tokens"
```

---

## Task 10: Delete removed components

**Files:**
- Delete: `src/components/ScoreGauge.tsx`
- Delete: `src/components/WeatherCard.tsx`
- Delete: `src/components/DustCard.tsx`
- Delete: `src/components/UvCard.tsx`
- Delete: `src/components/LocationHeader.tsx`
- Delete: `src/components/AirQualityCard.tsx`

- [ ] **Step 1: Verify no remaining imports**

Run: `grep -r "ScoreGauge\|WeatherCard\|DustCard\|UvCard\|LocationHeader\|AirQualityCard" src/ --include="*.tsx" --include="*.ts"`

Expected: No results (all imports already removed in Tasks 7-8). If any remain, fix them first.

- [ ] **Step 2: Delete files**

```bash
rm src/components/ScoreGauge.tsx
rm src/components/WeatherCard.tsx
rm src/components/DustCard.tsx
rm src/components/UvCard.tsx
rm src/components/LocationHeader.tsx
rm src/components/AirQualityCard.tsx
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add -u src/components/
git commit -m "chore: remove replaced components (ScoreGauge, WeatherCard, DustCard, UvCard, LocationHeader, AirQualityCard)"
```

---

## Task 11: Final build + visual verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Build succeeds with no errors or warnings

- [ ] **Step 2: Local verification**

Run: `npm run dev`

Check:
- 홈페이지: Hero Card에 온도 + 점수 표시되는지
- 점수 탭하면 breakdown 패널 확장/축소
- Conditions Row에 PM2.5 / UV / 습도 3개 뱃지
- 데스크탑에서 Outfit | Hourly 2열 배치
- 시간대별 그라데이션 배경 정상 작동
- 도시 페이지 (`/seoul`, `/busan` 등) 동일하게 작동
- 새로고침, 도시 검색, 캐시 배너 등 인터랙션 정상

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: final adjustments for Refined Glass redesign"
```
