# Design Token Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all hardcoded values to design system tokens, improve light mode contrast, unify glass surfaces, and clean up legacy code.

**Architecture:** Layer-by-layer — extend tokens first, then clean infrastructure, then migrate components file-by-file, finally remove legacy. Each task produces a buildable, testable state.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, CSS custom properties, framer-motion

**Spec:** `docs/specs/2026-04-12-design-token-migration.md`

---

### Task 1: Extend Token System

**Files:**
- Modify: `src/app/globals.css:71-78` (add light mode text overrides)
- Modify: `src/app/globals.css:7-55` (add interactive tokens to `:root`)
- Modify: `tailwind.config.ts:10-50` (add interactive token classes)

- [ ] **Step 1: Add light mode text token overrides to globals.css**

In `src/app/globals.css`, add text variable overrides inside the existing `[data-theme-mode="light"]` block:

```css
[data-theme-mode="light"] {
  /* existing glass surface overrides */
  --glass-bg-outer: rgba(0, 0, 0, 0.18);
  --glass-bg-inner: rgba(0, 0, 0, 0.12);
  --glass-border-outer: rgba(255, 255, 255, 0.15);
  --glass-border-inner: rgba(255, 255, 255, 0.08);
  --glass-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
  --glass-glow: inset 0 1px 0 rgba(255, 255, 255, 0.06);

  /* Light mode text — boost contrast on bright backgrounds */
  --text-primary: rgba(255, 255, 255, 1);
  --text-secondary: rgba(255, 255, 255, 0.88);
  --text-muted: rgba(255, 255, 255, 0.65);
  --text-disabled: rgba(255, 255, 255, 0.40);
}
```

- [ ] **Step 2: Add interactive state tokens to `:root` in globals.css**

In `src/app/globals.css`, add after the `--stagger-step` line (line 54) inside `:root`:

```css
  /* Interactive states */
  --interactive-hover: rgba(255, 255, 255, 0.10);
  --interactive-active: rgba(255, 255, 255, 0.15);
  --interactive-border: rgba(255, 255, 255, 0.10);
  --interactive-border-strong: rgba(255, 255, 255, 0.20);
```

- [ ] **Step 3: Add Tailwind config for interactive tokens**

In `tailwind.config.ts`, add `backgroundColor` and `borderColor` extensions inside `theme.extend`:

```ts
theme: {
  extend: {
    colors: { /* existing */ },
    textColor: { /* existing */ },
    backgroundColor: {
      interactive: {
        hover: 'var(--interactive-hover)',
        active: 'var(--interactive-active)',
      },
    },
    borderColor: {
      interactive: {
        DEFAULT: 'var(--interactive-border)',
        strong: 'var(--interactive-border-strong)',
      },
    },
    fontFamily: { /* existing */ },
    fontSize: { /* existing */ },
    borderRadius: { /* existing */ },
  },
},
```

- [ ] **Step 4: Verify build**

Run: `npx next build`
Expected: Build succeeds. No errors. New tokens are defined but not yet consumed.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "feat: extend design tokens with light mode text and interactive states"
```

---

### Task 2: Extract Shared Weather Format Helpers

**Files:**
- Create: `src/lib/weather-format.ts`
- Create: `src/lib/__tests__/weather-format.test.ts`
- Modify: `src/app/page.tsx:28-68` (remove inline helpers, import from weather-format)
- Modify: `src/components/CityWeatherPage.tsx:27-67` (remove inline helpers, import from weather-format)

- [ ] **Step 1: Write tests for weather-format helpers**

Create `src/lib/__tests__/weather-format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  getPM25Level,
  getPM25Color,
  getUVLevel,
  getUVColor,
  getHumidityDescription,
  getWindDescription,
} from '../weather-format';

describe('getPM25Level', () => {
  it('returns 좋음 for pm25 <= 15', () => {
    expect(getPM25Level(0)).toBe('좋음');
    expect(getPM25Level(15)).toBe('좋음');
  });
  it('returns 보통 for pm25 16-35', () => {
    expect(getPM25Level(16)).toBe('보통');
    expect(getPM25Level(35)).toBe('보통');
  });
  it('returns 나쁨 for pm25 36-75', () => {
    expect(getPM25Level(36)).toBe('나쁨');
    expect(getPM25Level(75)).toBe('나쁨');
  });
  it('returns 매우나쁨 for pm25 > 75', () => {
    expect(getPM25Level(76)).toBe('매우나쁨');
  });
});

describe('getPM25Color', () => {
  it('returns good color for low pm25', () => {
    expect(getPM25Color(10)).toBe('#4ade80');
  });
  it('returns moderate color for medium pm25', () => {
    expect(getPM25Color(25)).toBe('#fbbf24');
  });
  it('returns bad color for high pm25', () => {
    expect(getPM25Color(50)).toBe('#f87171');
  });
});

describe('getUVLevel', () => {
  it('returns 낮음 for uv <= 2', () => {
    expect(getUVLevel(0)).toBe('낮음');
    expect(getUVLevel(2)).toBe('낮음');
  });
  it('returns 보통 for uv 3-5', () => {
    expect(getUVLevel(3)).toBe('보통');
    expect(getUVLevel(5)).toBe('보통');
  });
  it('returns 높음 for uv 6-7', () => {
    expect(getUVLevel(6)).toBe('높음');
    expect(getUVLevel(7)).toBe('높음');
  });
  it('returns 매우높음 for uv 8-10', () => {
    expect(getUVLevel(8)).toBe('매우높음');
    expect(getUVLevel(10)).toBe('매우높음');
  });
  it('returns 위험 for uv > 10', () => {
    expect(getUVLevel(11)).toBe('위험');
  });
});

describe('getUVColor', () => {
  it('returns good color for low uv', () => {
    expect(getUVColor(1)).toBe('#4ade80');
  });
  it('returns moderate color for medium uv', () => {
    expect(getUVColor(4)).toBe('#fbbf24');
  });
  it('returns bad color for high uv', () => {
    expect(getUVColor(8)).toBe('#f87171');
  });
});

describe('getHumidityDescription', () => {
  it('returns 데이터 없음 for undefined', () => {
    expect(getHumidityDescription(undefined)).toBe('데이터 없음');
  });
  it('returns 건조한 편 for low humidity', () => {
    expect(getHumidityDescription(30)).toBe('건조한 편');
  });
  it('returns 쾌적한 수준 for normal humidity', () => {
    expect(getHumidityDescription(50)).toBe('쾌적한 수준');
  });
  it('returns 습한 편 for high humidity', () => {
    expect(getHumidityDescription(70)).toBe('습한 편');
  });
});

describe('getWindDescription', () => {
  it('returns 데이터 없음 for undefined', () => {
    expect(getWindDescription(undefined)).toBe('데이터 없음');
  });
  it('returns 바람 거의 없음 for < 2', () => {
    expect(getWindDescription(1)).toBe('바람 거의 없음');
  });
  it('returns 산들바람 for 2-4', () => {
    expect(getWindDescription(3)).toBe('산들바람');
  });
  it('returns 약간 강한 바람 for 5-7', () => {
    expect(getWindDescription(6)).toBe('약간 강한 바람');
  });
  it('returns 강풍 for >= 8', () => {
    expect(getWindDescription(10)).toBe('강풍');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/weather-format.test.ts`
Expected: FAIL — module `../weather-format` not found.

- [ ] **Step 3: Create weather-format.ts**

Create `src/lib/weather-format.ts`:

```ts
import { STATUS_COLORS } from './design-tokens';

export function getPM25Level(pm25: number): string {
  if (pm25 <= 15) return '좋음';
  if (pm25 <= 35) return '보통';
  if (pm25 <= 75) return '나쁨';
  return '매우나쁨';
}

export function getPM25Color(pm25: number): string {
  if (pm25 <= 15) return STATUS_COLORS.good;
  if (pm25 <= 35) return STATUS_COLORS.moderate;
  return STATUS_COLORS.bad;
}

export function getUVLevel(uvIndex: number): string {
  if (uvIndex <= 2) return '낮음';
  if (uvIndex <= 5) return '보통';
  if (uvIndex <= 7) return '높음';
  if (uvIndex <= 10) return '매우높음';
  return '위험';
}

export function getUVColor(uvIndex: number): string {
  if (uvIndex <= 2) return STATUS_COLORS.good;
  if (uvIndex <= 5) return STATUS_COLORS.moderate;
  return STATUS_COLORS.bad;
}

export function getHumidityDescription(humidity?: number): string {
  if (humidity === undefined) return '데이터 없음';
  if (humidity >= 40 && humidity <= 60) return '쾌적한 수준';
  if (humidity < 40) return '건조한 편';
  return '습한 편';
}

export function getWindDescription(windSpeed?: number): string {
  if (windSpeed === undefined) return '데이터 없음';
  if (windSpeed < 2) return '바람 거의 없음';
  if (windSpeed < 5) return '산들바람';
  if (windSpeed < 8) return '약간 강한 바람';
  return '강풍';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/weather-format.test.ts`
Expected: All 20 tests PASS.

- [ ] **Step 5: Replace inline helpers in page.tsx**

In `src/app/page.tsx`:
1. Remove lines 28-68 (the six inline function definitions: `getPM25Level`, `getPM25Color`, `getUVLevel`, `getUVColor`, `getHumidityDescription`, `getWindDescription`)
2. Add import at top: `import { getPM25Level, getPM25Color, getUVLevel, getUVColor, getHumidityDescription, getWindDescription } from '@/lib/weather-format';`

- [ ] **Step 6: Replace inline helpers in CityWeatherPage.tsx**

In `src/components/CityWeatherPage.tsx`:
1. Remove lines 27-67 (the same six inline function definitions)
2. Add import at top: `import { getPM25Level, getPM25Color, getUVLevel, getUVColor, getHumidityDescription, getWindDescription } from '@/lib/weather-format';`

- [ ] **Step 7: Verify build and all tests pass**

Run: `npx vitest run && npx next build`
Expected: All tests pass. Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/lib/weather-format.ts src/lib/__tests__/weather-format.test.ts src/app/page.tsx src/components/CityWeatherPage.tsx
git commit -m "refactor: extract shared weather format helpers to weather-format.ts"
```

---

### Task 3: Remove theme-colors.ts and Migrate CitySearchModal

**Files:**
- Modify: `src/components/CitySearchModal.tsx` (remove `getThemeColors()`, use tokens directly)
- Delete: `src/lib/theme-colors.ts`

- [ ] **Step 1: Replace getThemeColors() usage in CitySearchModal.tsx**

In `src/components/CitySearchModal.tsx`:

1. Remove import: `import { getThemeColors } from '@/lib/theme-colors';`
2. Remove line 95: `const colors = getThemeColors();`
3. Replace all `colors.X` references with direct token classes:

| `colors.primary` | `text-skin-primary` |
| `colors.secondary` | `text-skin-secondary` |
| `colors.muted` | `text-skin-muted` |
| `colors.border` | `border-interactive` |
| `colors.borderStrong` | `border-interactive-strong` |
| `colors.bg` | `bg-interactive-hover` |
| `colors.bgStrong` | `bg-interactive-active` |
| `colors.hoverBg` | `hover:bg-interactive-hover` |
| `colors.activeBg` | `active:bg-interactive-active` |
| `colors.focusRing` | `focus:ring-white/30` (inline — single use) |

Also migrate font sizes:
- `text-lg font-semibold` (line 119, modal header) → `text-title`
- `text-xs font-medium` (lines 261, 281, 482) → `text-label`
- `text-sm` throughout → `text-body`

And migrate modal transition:
- `duration: 0.2` (line 106) → import `DURATION` from `@/lib/design-tokens` and use `duration: DURATION.fast`

Replace `placeholder:text-white/60` (line 171) with `placeholder:text-skin-muted`.

- [ ] **Step 2: Delete theme-colors.ts**

Delete: `src/lib/theme-colors.ts`

- [ ] **Step 3: Verify no remaining references**

Run: `grep -r "theme-colors\|getThemeColors" src/`
Expected: 0 results.

- [ ] **Step 4: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/CitySearchModal.tsx
git rm src/lib/theme-colors.ts
git commit -m "refactor: remove theme-colors.ts, migrate CitySearchModal to design tokens"
```

---

### Task 4: Migrate HeroCard to Design Tokens

**Files:**
- Modify: `src/components/HeroCard.tsx`

- [ ] **Step 1: Migrate BreakdownBar sub-component**

In `src/components/HeroCard.tsx`, update BreakdownBar (lines 148-169):

- Line 155: `text-glass-muted` → `text-skin-muted`
- Line 156: `bg-white/10` → `bg-interactive-hover`
- Line 165: `text-glass-secondary` → `text-skin-secondary`

- [ ] **Step 2: Migrate MessageSkeleton sub-component**

Lines 176-189: `bg-white/30` on the three dots — keep inline (decorative loading animation).

- [ ] **Step 3: Remove local color variable declarations**

Lines 217-219 already define `primaryText`, `secondaryText`, `mutedText` correctly as `text-skin-*`. No change needed there.

- [ ] **Step 4: Migrate cache banner section**

Lines 260-286:
- Line 276: `text-xs text-amber-200` → `text-caption text-status-moderate`
- Line 281: `text-xs text-amber-100 bg-amber-500/30 hover:bg-amber-500/50` → `text-caption text-skin-secondary bg-interactive-active hover:bg-interactive-hover` (or keep amber for semantic cache warning — decision: keep amber inline for semantic distinction)

Decision: Cache banner background `bg-amber-500/20 border-amber-500/30` is semantic warning — keep inline. Text colors migrate: `text-amber-200` → `text-status-moderate`, `text-amber-100` → `text-skin-secondary`. Font sizes: `text-xs` → `text-caption`.

- [ ] **Step 5: Migrate top row (location + refresh)**

- Line 295: `font-semibold text-base` → `text-headline`
- Line 322: `font-semibold text-base` → `text-headline`
- Lines 344-345: `hover:bg-white/10 active:bg-white/15` → `hover:bg-interactive-hover active:bg-interactive-active`
- Line 350: `text-xs` → `text-caption`
- Lines 375-376: `text-xs` → `text-caption`, `hover:bg-white/10 active:bg-white/15` → `hover:bg-interactive-hover active:bg-interactive-active`

- [ ] **Step 6: Migrate main weather/score area**

- Line 416: `text-base font-medium` → `text-headline`
- Line 417: `text-sm` → `text-body`
- Line 432: `text-xs uppercase tracking-widest` → `text-label uppercase tracking-widest`
- Line 440: `duration: 0.2` → `duration: DURATION.fast`

- [ ] **Step 7: Migrate score breakdown (expandable)**

- Line 459: `text-xs` → `text-caption`
- Lines 476-477: `duration: 0.3` → `duration: DURATION.normal`
- Line 480: `text-glass-muted` → `text-skin-muted`
- Line 482: `text-orange-300` → `text-status-bad`
- Line 491: `border-white/10` → `border-interactive`

- [ ] **Step 8: Migrate AI message section**

- Line 506: `text-sm` → `text-body`

- [ ] **Step 9: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 10: Commit**

```bash
git add src/components/HeroCard.tsx
git commit -m "refactor: migrate HeroCard to design tokens"
```

---

### Task 5: Migrate OutfitCard to Design Tokens

**Files:**
- Modify: `src/components/OutfitCard.tsx`

- [ ] **Step 1: Migrate category rows inline styles to Tailwind tokens**

- Line 52: `const borderColor = 'border-white/20'` → `const borderColor = 'border-interactive-strong'`
- Line 97: `style={{ fontSize: '18px', width: '24px' }}` → remove style, add `className="text-lg w-6"` (18px ≈ text-lg, 24px = w-6)
- Line 104: `style={{ fontSize: '12px', width: '36px' }}` → remove style, add `text-caption` class (12px), keep `w-9` (36px) as Tailwind class
- Line 108: `style={{ fontSize: '13px' }}` → remove style, add `text-module-label` class

- [ ] **Step 2: Migrate alert and styling tip sections**

- Line 121: `text-amber-300` — keep inline (semantic warning accent)
- Line 122: `text-sm font-medium` → `text-body font-medium`
- Line 132: `text-purple-300` — keep inline (semantic styling accent)
- Line 135-137: `bg-white/30` — keep inline (decorative loading dots)
- Line 140: `text-sm font-medium` → `text-body font-medium`

- [ ] **Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/OutfitCard.tsx
git commit -m "refactor: migrate OutfitCard to design tokens"
```

---

### Task 6: Migrate HourlyForecast to Design Tokens

**Files:**
- Modify: `src/components/HourlyForecast.tsx`

- [ ] **Step 1: Migrate HourlySkeleton**

Lines 26-45:
- Line 33: `bg-white/10` → `bg-interactive-hover`
- Line 36-39: `bg-white/20` → keep inline (skeleton placeholder visual, distinct from interactive)

- [ ] **Step 2: Migrate hourly items**

- Line 112: `bg-white/20` (date pill) → `bg-interactive-active`
- Line 124: `text-xs md:text-sm` → `text-caption md:text-body`
- Line 130: `text-sm md:text-base` → `text-body md:text-headline`
- Line 135: `text-[11px]` → keep inline (below minimum type scale)
- Line 111: `bg-white/30` (date divider line) → keep inline (decorative)

- [ ] **Step 3: Migrate scroll arrow buttons**

Lines 146-170:
- `bg-black/30 hover:bg-black/40` → keep inline (dark overlay buttons, not glass surface)
- `border border-white/20` → `border border-interactive-strong`
- `text-white` → `text-skin-primary`

- [ ] **Step 4: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/HourlyForecast.tsx
git commit -m "refactor: migrate HourlyForecast to design tokens"
```

---

### Task 7: Migrate CitiesTabs to GlassCard + Design Tokens

**Files:**
- Modify: `src/components/CitiesTabs.tsx`

- [ ] **Step 1: Add GlassCard import and replace manual glass surfaces**

In `src/components/CitiesTabs.tsx`:

1. Add import: `import GlassCard from './GlassCard';`
2. Replace both instances of `<div key={region} className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg">` (lines 49 and 73) with `<GlassCard key={region}>`
3. Remove the `<div className="card-body p-4">` wrapper inside — GlassCard provides its own padding. If layout needs adjustment, use `className` prop on GlassCard.

- [ ] **Step 2: Migrate tab buttons**

Lines 23-42:
- Active: `bg-white/25 text-white shadow-md` → `bg-interactive-active text-skin-primary shadow-md`
- Inactive: `bg-white/10 text-white/60 hover:bg-white/15` → `bg-interactive-hover text-skin-muted hover:bg-interactive-active`
- `text-sm font-medium` → `text-body font-medium`

- [ ] **Step 3: Migrate region headings and city links**

- Line 51, 75: `text-xs font-medium text-white/70` → `text-label text-skin-muted`
- Lines 57, 81: `bg-white/10 border border-white/10 text-sm text-white/90 hover:bg-white/20 active:bg-white/25` → `bg-interactive-hover border border-interactive text-body text-skin-secondary hover:bg-interactive-active active:bg-interactive-active`

- [ ] **Step 4: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/CitiesTabs.tsx
git commit -m "refactor: migrate CitiesTabs to GlassCard and design tokens"
```

---

### Task 8: Migrate Skeleton to Design Tokens

**Files:**
- Modify: `src/components/Skeleton.tsx`

- [ ] **Step 1: Migrate SkeletonBox and SkeletonCircle**

- Line 10: `bg-white/20` → keep inline (skeleton placeholder visual)
- Line 27: `bg-white/20` → keep inline (same reason)

These are skeleton loading placeholders, not interactive or glass surfaces. Keep inline.

- [ ] **Step 2: Migrate SkeletonCard, SkeletonScoreGauge, SkeletonOutfitCard glass surfaces**

Replace manual glass surfaces with CSS variables:

Lines 37, 61, 78: Replace `card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg` with inline styles using CSS variables:

```tsx
<div
  className={`card ${className}`}
  style={{
    background: 'var(--glass-bg-outer)',
    border: '1px solid var(--glass-border-outer)',
    borderRadius: 'var(--glass-radius-outer)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    boxShadow: 'var(--glass-shadow), var(--glass-glow)',
  }}
>
```

- Line 64-65: `bg-white/10 border-8 border-white/20` → `bg-interactive-hover border-8 border-interactive-strong`

- [ ] **Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/Skeleton.tsx
git commit -m "refactor: migrate Skeleton to glass CSS variables"
```

---

### Task 9: Migrate Utility Components (ErrorBoundary, ErrorState, LoadingState, PermissionGuide, Footer)

**Files:**
- Modify: `src/components/ErrorBoundary.tsx`
- Modify: `src/components/ErrorState.tsx`
- Modify: `src/components/LoadingState.tsx`
- Modify: `src/components/PermissionGuide.tsx`
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Migrate ErrorBoundary.tsx**

Lines 40-65:
- Line 40: `bg-gradient-to-b from-slate-700 to-slate-900` → keep inline (error fallback, no theme data available)
- Line 43: `text-white font-semibold text-lg` → `text-skin-primary text-title`
- Line 46: `text-white/70 text-sm` → `text-skin-muted text-body`
- Line 52: `text-white` → `text-skin-primary`, `text-sm` → `text-body`. Keep `bg-white/20 hover:bg-white/30` inline (button with visible base — interactive tokens are for transparent→hover pattern)
- Line 58: `text-white/80` → `text-skin-secondary`, `text-sm` → `text-body`. Keep `bg-white/10 hover:bg-white/20` inline (same reason)

Note: ErrorBoundary is a class component. No import changes needed since tokens are CSS-only.

- [ ] **Step 2: Migrate ErrorState.tsx**

- Line 15: `text-white font-medium` → `text-skin-primary font-medium`
- Line 16: `text-white/70 text-sm font-light` → `text-skin-muted text-body font-light`

- [ ] **Step 3: Migrate LoadingState.tsx**

- Line 11: `text-white/80 font-light text-sm` → `text-skin-secondary font-light text-body`

- [ ] **Step 4: Migrate PermissionGuide.tsx**

- Line 16: `text-white font-semibold text-lg` → `text-skin-primary text-title`
- Line 18: `bg-white/15 backdrop-blur-md rounded-xl` → replace with CSS variable inline style:
  ```tsx
  style={{
    background: 'var(--glass-bg-outer)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    borderRadius: 'var(--glass-radius-outer)',
  }}
  ```
- Line 19: `text-white/90 font-medium text-sm` → `text-skin-secondary font-medium text-body`
- Lines 25, 32, 40: `text-white/80 text-sm` → `text-skin-secondary text-body`
- Lines 52, 60: `text-white` → `text-skin-primary`, `text-sm` → `text-body`. Keep `bg-white/20 hover:bg-white/30` inline (button with visible base)

- [ ] **Step 5: Migrate Footer.tsx**

- Line 16: `textClass: 'text-white/45 hover:text-white/95'` → `textClass: 'text-skin-disabled hover:text-skin-primary'`
- Line 22: `text-sm` → `text-body`

- [ ] **Step 6: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/components/ErrorBoundary.tsx src/components/ErrorState.tsx src/components/LoadingState.tsx src/components/PermissionGuide.tsx src/components/Footer.tsx
git commit -m "refactor: migrate utility components to design tokens"
```

---

### Task 10: Migrate cities/page.tsx

**Files:**
- Modify: `src/app/cities/page.tsx`

- [ ] **Step 1: Fix non-existent token and migrate colors**

- Line 71: `text-white/70 hover:text-white` → `text-skin-muted hover:text-skin-primary`
- Line 78: `text-heading-1 text-white font-semibold` → `text-title text-skin-primary` (text-heading-1 does not exist in token system; text-title is 20px/600 which includes font-semibold)
- Line 79: `text-sm text-white/70` → `text-body text-skin-muted`

- [ ] **Step 2: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/cities/page.tsx
git commit -m "refactor: migrate cities page to design tokens"
```

---

### Task 11: Remove Legacy Glass Tokens

**Files:**
- Modify: `src/app/globals.css` (remove legacy CSS variables)
- Modify: `tailwind.config.ts` (remove glass color config)

- [ ] **Step 1: Verify no remaining legacy references**

Run: `grep -r "text-glass-\|glass-primary\|glass-secondary\|glass-muted" src/`
Expected: 0 results from component/page files. Only `globals.css` and `tailwind.config.ts` definitions should remain.

If any references remain, go back and fix them before proceeding.

- [ ] **Step 2: Remove legacy CSS variables from globals.css**

In `src/app/globals.css`, remove from `:root`:

```css
  /* Glass UI (legacy — kept for existing glass.primary/secondary/muted refs) */
  --glass-primary: rgba(255, 255, 255, 1);
  --glass-secondary: rgba(255, 255, 255, 0.9);
  --glass-muted: rgba(255, 255, 255, 0.7);
```

- [ ] **Step 3: Remove legacy Tailwind glass colors from config**

In `tailwind.config.ts`, remove from `colors`:

```ts
glass: {
  primary: "var(--glass-primary)",
  secondary: "var(--glass-secondary)",
  muted: "var(--glass-muted)",
},
```

- [ ] **Step 4: Verify build and all tests pass**

Run: `npx vitest run && npx next build`
Expected: All tests pass. Build succeeds. No "glass-primary", "glass-secondary", or "glass-muted" anywhere in compiled output.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "refactor: remove legacy glass-primary/secondary/muted tokens"
```

---

### Task 12: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass (weather-format tests + existing score/outfit tests).

- [ ] **Step 2: Run production build**

Run: `npx next build`
Expected: Build succeeds with no warnings about unused variables or missing references.

- [ ] **Step 3: Verify no remaining hardcoded patterns**

Run these grep checks:

```bash
# Legacy glass tokens — should be 0
grep -r "text-glass-" src/
grep -r "glass-primary\|glass-secondary\|glass-muted" src/

# theme-colors.ts references — should be 0
grep -r "theme-colors\|getThemeColors" src/

# Spot check: no inline hex colors in page files (should only be in design-tokens.ts and weather-format.ts)
grep -rn "#4ade80\|#fbbf24\|#f87171" src/ --include="*.tsx"
```

Expected: Only `design-tokens.ts` should contain hex color values. No `.tsx` component files should have them.

- [ ] **Step 4: Final commit (if any fixups needed)**

If any issues found, fix and commit. Otherwise, migration complete.
