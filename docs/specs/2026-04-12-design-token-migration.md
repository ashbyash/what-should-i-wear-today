# Design Token Migration Spec

- Date: 2026-04-12
- Status: Approved
- Approach: Layer-by-layer migration (A)

## Goal

기존 디자인 토큰 시스템(CSS 변수 + Tailwind + JS 토큰)으로 전체 컴포넌트의 하드코딩 값을 교체하고, light 모드 대비 개선 + 텍스트 계층 정리 + 글래스 표면 일관성 확보 + 레거시 코드 정리를 수행한다.

## Scope

- 토큰 교체 (색상, 폰트, 모션, 인터랙티브 상태)
- Light 모드 텍스트 대비 개선
- 글래스 표면 수동 재현 → GlassCard/CSS 변수 통일
- `theme-colors.ts` 제거, 중복 헬퍼 `weather-format.ts`로 추출
- 레거시 `--glass-primary/secondary/muted` + `text-glass-*` 제거

## Out of Scope

- 새로운 UI 컴포넌트 추가
- 레이아웃 변경
- 기능 변경

---

## Section 1: Token Extension

### 1-1. Light Mode Text Tokens

`globals.css`의 `[data-theme-mode="light"]` 셀렉터에 텍스트 변수 오버라이드 추가:

```css
[data-theme-mode="light"] {
  /* existing glass surface overrides... */
  --text-primary: rgba(255, 255, 255, 1);
  --text-secondary: rgba(255, 255, 255, 0.88);
  --text-muted: rgba(255, 255, 255, 0.65);
  --text-disabled: rgba(255, 255, 255, 0.40);
}
```

기존 `text-skin-*` Tailwind 클래스가 CSS 변수를 참조하므로 컴포넌트 수정 없이 자동 적용.

### 1-2. Interactive State Tokens

`globals.css` `:root`에 추가:

```css
:root {
  --interactive-hover: rgba(255, 255, 255, 0.10);
  --interactive-active: rgba(255, 255, 255, 0.15);
  --interactive-border: rgba(255, 255, 255, 0.10);
  --interactive-border-strong: rgba(255, 255, 255, 0.20);
}
```

`tailwind.config.ts` 확장:

```ts
backgroundColor: {
  interactive: {
    hover: 'var(--interactive-hover)',
    active: 'var(--interactive-active)',
  }
}
borderColor: {
  interactive: {
    DEFAULT: 'var(--interactive-border)',
    strong: 'var(--interactive-border-strong)',
  }
}
```

### 1-3. Legacy glass → skin Mapping

| Legacy | Replacement |
|--------|-------------|
| `text-glass-primary` | `text-skin-primary` |
| `text-glass-secondary` | `text-skin-secondary` |
| `text-glass-muted` | `text-skin-muted` |

---

## Section 2: Infrastructure Cleanup

### 2-1. Remove `theme-colors.ts`

`getThemeColors()` 호출을 모든 소비처(CitySearchModal)에서 제거하고 토큰 클래스 직접 사용. 파일 삭제.

매핑:

| getThemeColors() | Replacement |
|---|---|
| `primary: 'text-glass-primary'` | `text-skin-primary` |
| `secondary: 'text-glass-secondary'` | `text-skin-secondary` |
| `muted: 'text-glass-muted'` | `text-skin-muted` |
| `border: 'border-white/10'` | `border-interactive` |
| `borderStrong: 'border-white/20'` | `border-interactive-strong` |
| `bg: 'bg-white/10'` | `bg-interactive-hover` |
| `bgStrong: 'bg-white/15'` | `var(--glass-bg-inner)` 또는 인라인 |
| `hoverBg: 'hover:bg-white/10'` | `hover:bg-interactive-hover` |
| `activeBg: 'active:bg-white/20'` | `active:bg-interactive-active` |
| `focusRing: 'focus:ring-white/30'` | 인라인 유지 (단일 사용처) |

### 2-2. Extract Shared Helpers

`page.tsx`와 `CityWeatherPage.tsx`에 중복된 함수들을 `src/lib/weather-format.ts`로 추출:

- `getPM25Level(pm25: number): string`
- `getPM25Color(pm25: number): string` — `STATUS_COLORS` 토큰 사용
- `getUVLevel(uvIndex: number): string`
- `getUVColor(uvIndex: number): string` — `STATUS_COLORS` 토큰 사용
- `getHumidityLevel(humidity: number): string`
- `getWindLevel(windSpeed: number): string`

양쪽 페이지에서 import로 교체.

---

## Section 3: Component Migration

### Priority & Mapping

#### 3-1. HeroCard.tsx (highest impact)

| Current | Replacement |
|---|---|
| `text-glass-muted` | `text-skin-muted` |
| `text-glass-secondary` | `text-skin-secondary` |
| `text-white`, `text-white/90`, `text-white/80` | `text-skin-primary`, `text-skin-secondary`, `text-skin-muted` |
| `text-amber-200` (cache banner) | `text-status-moderate` |
| `text-orange-300` (wind penalty) | `text-status-bad` |
| `hover:bg-white/10 active:bg-white/15` | `hover:bg-interactive-hover active:bg-interactive-active` |
| `border-white/10` | `border-interactive` |
| `text-sm` | `text-body` |
| `text-xs` | `text-caption` |
| `text-base font-medium` | `text-headline` |
| `text-xs uppercase tracking-widest` | `text-label` |
| `duration: 0.2` | `DURATION.fast` |
| `duration: 0.3` | `DURATION.normal` |
| `getScoreColor()` returns (`text-amber-200`, `text-rose-200`) | inline 유지 (점수 레벨 전용) |

#### 3-2. OutfitCard.tsx

| Current | Replacement |
|---|---|
| `border-white/20` | `border-interactive-strong` |
| `style={{ fontSize: '12px' }}` | `text-caption` (Tailwind class) |
| `style={{ fontSize: '13px' }}` | `text-module-label` (Tailwind class) |
| `text-amber-300`, `text-purple-300` | inline 유지 (단발성 강조) |
| `bg-white/30` loading dots | inline 유지 (장식적) |

#### 3-3. HourlyForecast.tsx

| Current | Replacement |
|---|---|
| `bg-white/20` (date pill) | `bg-interactive-active` |
| `text-blue-200/80` (precipitation) | inline 유지 (도메인 특화, 단일 사용처) |
| `bg-black/30 border-white/20 text-white` (scroll buttons) | `bg-interactive-hover border-interactive-strong text-skin-primary` |
| `text-xs` | `text-caption` |
| `text-sm` | `text-body` |
| `duration-200` | inline 유지 (CSS transition, 정확한 토큰 매칭 없음) |

#### 3-4. Glass Surface Unification

수동 `card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg` 패턴을 교체:

| Component | Action |
|---|---|
| `CitiesTabs.tsx` | GlassCard 컴포넌트로 교체 |
| `PermissionGuide.tsx` | GlassCard 컴포넌트로 교체 |
| `Skeleton.tsx` | CSS 변수 직접 사용 (`var(--glass-bg-outer)` 등) |

추가로 CitiesTabs의 모든 하드코딩 색상/폰트도 토큰화.

#### 3-5. Utility Components

| Component | Changes |
|---|---|
| `ErrorBoundary.tsx` | 배경 `from-slate-700 to-slate-900` 유지 (에러 시 테마 데이터 없음), 텍스트만 `text-skin-*` 토큰화 |
| `ErrorState.tsx` | `text-white` → `text-skin-primary`, `text-white/70` → `text-skin-muted` |
| `LoadingState.tsx` | `text-white/80` → `text-skin-secondary` |
| `Footer.tsx` | `text-white/45` → `text-skin-muted` 또는 `text-skin-disabled` |

#### 3-6. Page Components

| Component | Changes |
|---|---|
| `CitySearchModal.tsx` | `getThemeColors()` 제거, 토큰 직접 사용, 폰트 사이즈 토큰화 |
| `cities/page.tsx` | `text-heading-1` → `text-title`, `text-white/70` → `text-skin-muted` |

### Tokenization Decision Rules

| Case | Decision |
|---|---|
| `text-white/N` text hierarchy | → `text-skin-*` token |
| `hover:bg-white/N` interactive | → interactive token |
| `text-amber-300` one-off accent | → inline (no token) |
| `text-blue-200/80` domain color | → inline (single use) |
| `duration: 0.2` ≈ `DURATION.fast` | → `DURATION.fast` (0.15s) |
| `duration: 0.3` = `DURATION.normal` | → `DURATION.normal` |
| `bg-white/30` decorative | → inline (no token) |
| `from-slate-700` error fallback | → inline (no theme data) |

---

## Section 4: Legacy Removal

모든 컴포넌트 마이그레이션 완료 후 실행.

### 4-1. CSS Variables (globals.css)

삭제:
```css
--glass-primary: rgba(255, 255, 255, 1);
--glass-secondary: rgba(255, 255, 255, 0.9);
--glass-muted: rgba(255, 255, 255, 0.7);
```

### 4-2. Tailwind Config (tailwind.config.ts)

삭제:
```ts
glass: {
  primary: "var(--glass-primary)",
  secondary: "var(--glass-secondary)",
  muted: "var(--glass-muted)",
}
```

### 4-3. Verification

- `grep -r "glass-primary\|glass-secondary\|glass-muted"` → 0 results
- `grep -r "theme-colors"` → 0 results
- `grep -r "getThemeColors"` → 0 results
- `npm run build` 성공
- `npm run test:run` 통과

---

## Files Changed (Expected)

### New
- `src/lib/weather-format.ts`

### Modified
- `src/app/globals.css` — light mode text tokens, interactive tokens, legacy removal
- `tailwind.config.ts` — interactive tokens, legacy glass removal
- `src/components/HeroCard.tsx`
- `src/components/OutfitCard.tsx`
- `src/components/HourlyForecast.tsx`
- `src/components/CitiesTabs.tsx`
- `src/components/Skeleton.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/components/ErrorState.tsx`
- `src/components/LoadingState.tsx`
- `src/components/PermissionGuide.tsx`
- `src/components/Footer.tsx`
- `src/components/CitySearchModal.tsx`
- `src/app/page.tsx`
- `src/app/cities/page.tsx`
- `src/components/CityWeatherPage.tsx`

### Deleted
- `src/lib/theme-colors.ts`
