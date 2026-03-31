# Light Mode Contrast Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix white-on-white contrast issues in light mode (dawn/morning/evening) by inverting glass card backgrounds to semi-transparent black and unifying text colors to white.

**Architecture:** Invert GlassCard backgrounds for `isLight=true` from `rgba(255,255,255,*)` to `rgba(0,0,0,*)`. Remove all `isLight` text color ternaries across 7 components, always using white-based text. Remove the now-redundant `[data-theme="light"]` text-shadow CSS and TimeBackground overlay.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/GlassCard.tsx` | Modify | Invert isLight background from white→black glass |
| `src/lib/theme-colors.ts` | Modify | Remove isLight branching, return unified dark-glass values |
| `src/components/HeroCard.tsx` | Modify | Remove isLight text color ternaries |
| `src/components/OutfitCard.tsx` | Modify | Remove isLight text color ternaries |
| `src/components/ConditionsRow.tsx` | Modify | Remove isLight text color ternary |
| `src/components/HourlyForecast.tsx` | Modify | Remove isLight text color ternaries |
| `src/components/PopularCities.tsx` | Modify | Invert inline glass classes + remove text ternaries |
| `src/components/Footer.tsx` | Modify | Remove isLight text color ternary |
| `src/components/CitySearchModal.tsx` | Modify | Update to use unified theme-colors |
| `src/app/globals.css` | Modify | Remove `[data-theme="light"]` text-shadow rules |
| `src/components/TimeBackground.tsx` | Modify | Remove isLight overlay div |

---

### Task 1: GlassCard — Invert Light Mode Backgrounds

**Files:**
- Modify: `src/components/GlassCard.tsx:18-26`

- [ ] **Step 1: Change outer variant isLight background and border**

In `src/components/GlassCard.tsx`, replace the styles object (lines 18-26):

```typescript
  const styles = variant === 'outer'
    ? {
        background: isLight ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.15)',
        border: isLight ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.2)',
      }
    : {
        background: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)',
        border: isLight ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.15)',
      };
```

- [ ] **Step 2: Verify visually**

Run: `npm run dev`

Open the app and set system time or wait for a light time period (dawn/morning/evening). Confirm glass cards have a dark tint instead of white.

- [ ] **Step 3: Commit**

```bash
git add src/components/GlassCard.tsx
git commit -m "feat: invert GlassCard to dark glass on light backgrounds

Outer: rgba(0,0,0,0.20), inner: rgba(0,0,0,0.15)
Border: rgba(255,255,255,0.12/0.10) for subtle edge visibility

Constraint: WCAG AA 4.5:1 contrast on dawn/morning/evening gradients
Rejected: white glass (rgba(255,255,255,0.3)) | white-on-white, fails contrast
Confidence: high
Scope-risk: moderate"
```

---

### Task 2: theme-colors.ts — Unify to Dark-Glass Values

**Files:**
- Modify: `src/lib/theme-colors.ts:14-27`

- [ ] **Step 1: Remove isLight parameter branching**

Replace the `getThemeColors` function body to always return dark-glass values:

```typescript
export function getThemeColors(_isLight?: boolean): ThemeColors {
  return {
    primary: 'text-glass-primary',
    secondary: 'text-glass-secondary',
    muted: 'text-glass-muted',
    border: 'border-white/10',
    borderStrong: 'border-white/20',
    bg: 'bg-white/10',
    bgStrong: 'bg-white/15',
    hoverBg: 'hover:bg-white/10',
    activeBg: 'active:bg-white/20',
    focusRing: 'focus:ring-white/30',
  };
}
```

Keep the `_isLight` parameter (prefixed with underscore) so callers don't break.

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`

Expected: Build succeeds with no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/theme-colors.ts
git commit -m "refactor: unify getThemeColors to always return dark-glass values

isLight branching no longer needed since all backgrounds use dark glass.
Parameter kept with underscore prefix for backward compatibility."
```

---

### Task 3: HeroCard — Remove isLight Text Ternaries

**Files:**
- Modify: `src/components/HeroCard.tsx:85-116,239-241`

- [ ] **Step 1: Simplify getScoreColor — remove isLight parameter**

Replace the `getScoreColor` function (lines 85-116):

```typescript
function getScoreColor(level: OutingScore['level']): string {
  switch (level) {
    case 'perfect':
    case 'excellent':
      return 'text-white';
    case 'good':
      return 'text-white/90';
    case 'fair':
      return 'text-white/80';
    case 'moderate':
      return 'text-amber-200';
    case 'poor':
      return 'text-orange-200';
    case 'bad':
      return 'text-rose-200';
  }
}
```

- [ ] **Step 2: Update getScoreColor call site**

At line 235, change:
```typescript
  const scoreColorClass = getScoreColor(score.level);
```

- [ ] **Step 3: Replace text color variables**

Replace lines 239-241:

```typescript
  const primaryText = 'text-white/95';
  const secondaryText = 'text-white/80';
  const mutedText = 'text-white/55';
```

- [ ] **Step 4: Verify build**

Run: `npx next build 2>&1 | tail -20`

Expected: Build succeeds. No references to `isLight` in text color logic remain (GlassCard prop still passed for background).

- [ ] **Step 5: Commit**

```bash
git add src/components/HeroCard.tsx
git commit -m "refactor: unify HeroCard text colors to white-based

Remove isLight ternaries for primaryText/secondaryText/mutedText.
Remove isLight param from getScoreColor.
Dark glass background ensures white text is always readable."
```

---

### Task 4: OutfitCard — Remove isLight Text Ternaries

**Files:**
- Modify: `src/components/OutfitCard.tsx:51-54,141-143`

- [ ] **Step 1: Replace text color variables**

Replace lines 51-54:

```typescript
  const colorPrimary = 'text-white/95';
  const colorSecondary = 'text-white/80';
  const colorMuted = 'text-white/55';
  const borderColor = 'border-white/20';
```

- [ ] **Step 2: Simplify loading dots**

Replace lines 141-143 (the loading dots inside AI Styling Tip):

```typescript
                  <span className="inline-block w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
                  <span className="inline-block w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse [animation-delay:0.2s]" />
                  <span className="inline-block w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse [animation-delay:0.4s]" />
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -20`

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/OutfitCard.tsx
git commit -m "refactor: unify OutfitCard text colors to white-based

Remove isLight ternaries for all text and border color variables."
```

---

### Task 5: ConditionsRow — Remove isLight Text Ternary

**Files:**
- Modify: `src/components/ConditionsRow.tsx:58`

- [ ] **Step 1: Replace mutedColor variable**

Replace line 58:

```typescript
  const mutedColor = 'text-white/55';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ConditionsRow.tsx
git commit -m "refactor: unify ConditionsRow text color to white-based"
```

---

### Task 6: HourlyForecast — Remove isLight Text Ternaries

**Files:**
- Modify: `src/components/HourlyForecast.tsx:53-54,145`

- [ ] **Step 1: Replace text color variables**

Replace lines 53-54:

```typescript
  const primaryColor = 'text-white/95';
  const mutedColor = 'text-white/55';
```

- [ ] **Step 2: Fix precipitation probability color**

Replace line 145 (the precipitation probability span):

```typescript
                    <span className="text-[11px] leading-none text-blue-200/80">
```

- [ ] **Step 3: Commit**

```bash
git add src/components/HourlyForecast.tsx
git commit -m "refactor: unify HourlyForecast text colors to white-based"
```

---

### Task 7: PopularCities — Invert Glass + Unify Text

**Files:**
- Modify: `src/components/PopularCities.tsx:14-23,26,36-37`

- [ ] **Step 1: Replace text and glass variables**

Replace lines 14-23:

```typescript
  const secondaryText = 'text-white/80';
  const mutedText = 'text-white/55';

  const glassOuter = isLight
    ? 'bg-black/20 border border-white/10'
    : 'bg-white/15 border border-white/20';

  const glassInner = isLight
    ? 'bg-black/15 border border-white/10'
    : 'bg-white/10 border border-white/15';
```

- [ ] **Step 2: Update hover states**

At line 37, replace the hover classes:

```typescript
              className={`${glassInner} backdrop-blur rounded-[20px] px-4 py-2 text-sm ${secondaryText}
                         transition-colors ${isLight ? 'hover:bg-black/25 active:bg-black/30' : 'hover:bg-white/25 active:bg-white/30'}`}
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -20`

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/PopularCities.tsx
git commit -m "refactor: invert PopularCities glass to dark on light backgrounds

Uses inline Tailwind classes (not GlassCard component).
Unify text colors to white-based."
```

---

### Task 8: Footer — Remove isLight Text Ternary

**Files:**
- Modify: `src/components/Footer.tsx:17-19`

- [ ] **Step 1: Replace textClass**

Replace lines 17-19:

```typescript
      textClass: 'text-white/45 hover:text-white/95',
```

Remove the `isLight` variable and its computation (line 13 `const isLight = ...` is no longer needed for text). The full useMemo becomes:

```typescript
  const { gradientStyle, textClass } = useMemo(() => {
    const timeOfDay = getTimeOfDay(clientHour);
    const gradient = TIME_GRADIENTS[timeOfDay];

    return {
      gradientStyle: { background: `linear-gradient(to bottom, ${gradient.to}, ${gradient.to})` },
      textClass: 'text-white/45 hover:text-white/95',
    };
  }, [clientHour]);
```

Also remove `TIME_TEXT_COLORS` from the import since it's no longer used:

```typescript
import { getTimeOfDay, TIME_GRADIENTS } from '@/lib/theme';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "refactor: unify Footer text color to white-based

Remove TIME_TEXT_COLORS import and isLight computation."
```

---

### Task 9: CitySearchModal — Update Theme Colors Usage

**Files:**
- Modify: `src/components/CitySearchModal.tsx:111,172,359`

- [ ] **Step 1: Simplify overlay**

Replace line 111:

```typescript
          <div className="absolute inset-0 bg-black/20" />
```

- [ ] **Step 2: Simplify placeholder color**

Replace line 172:

```typescript
                           placeholder:text-white/60
```

- [ ] **Step 3: Simplify search result country badge**

Replace lines 358-360:

```typescript
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
                                               bg-sky-400/15 border-sky-400/20 text-sky-300
                                               border`}>
```

- [ ] **Step 4: Verify build**

Run: `npx next build 2>&1 | tail -20`

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/CitySearchModal.tsx
git commit -m "refactor: simplify CitySearchModal for unified dark-glass theme

Remove isLight-specific overlay, placeholder, and badge color branches."
```

---

### Task 10: globals.css — Remove Light Theme Text Shadows

**Files:**
- Modify: `src/app/globals.css:76-93`

- [ ] **Step 1: Remove all [data-theme="light"] rules**

Delete lines 76-93 entirely (the comment and all three rule blocks):

```css
/* DELETE: lines 76-93 */
/* 밝은 배경 시간대 (morning, evening) - text-shadow로 가독성 확보 */
[data-theme="light"] { ... }
[data-theme="light"] .text-glass-primary, ... { ... }
[data-theme="light"] .card { ... }
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "fix: remove light theme text-shadow CSS rules

No longer needed — dark glass backgrounds provide sufficient contrast.
Removes data-theme=light text-shadow and card override rules."
```

---

### Task 11: TimeBackground — Remove Light Overlay

**Files:**
- Modify: `src/components/TimeBackground.tsx:14,19,29-31`

- [ ] **Step 1: Remove isLight from useMemo and remove overlay div**

Replace the component body (lines 14-34):

```typescript
  const gradientStyle = useMemo(() => {
    const timeOfDay = getTimeOfDay(clientHour);
    const gradient = TIME_GRADIENTS[timeOfDay];
    return { background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})` };
  }, [clientHour]);

  return (
    <div
      className={`relative ${className}`}
      data-theme="dark"
      style={gradientStyle}
    >
      {children}
    </div>
  );
```

Also update the import to remove `TIME_TEXT_COLORS`:

```typescript
import { getTimeOfDay, TIME_GRADIENTS } from '@/lib/theme';
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/TimeBackground.tsx
git commit -m "fix: remove bg-black/25 overlay from TimeBackground

Dark glass cards handle contrast directly. The overlay was a workaround
for white glass readability and is no longer needed.

Rejected: keeping overlay | redundant with dark glass, darkens background unnecessarily"
```

---

### Task 12: Final Build Verification

- [ ] **Step 1: Run full build**

Run: `npx next build`

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run tests**

Run: `npx vitest run`

Expected: All existing tests pass.

- [ ] **Step 3: Visual verification checklist**

Open the app and verify across all 5 time periods:
- dawn (isLight: true) — dark glass cards, white text, readable
- morning (isLight: true) — dark glass cards, white text, readable
- day (isLight: false) — unchanged, white glass cards
- evening (isLight: true) — dark glass cards, white text, readable
- night (isLight: false) — unchanged, white glass cards

Check: no white-on-white, no blinding brightness, glass morphism preserved.
