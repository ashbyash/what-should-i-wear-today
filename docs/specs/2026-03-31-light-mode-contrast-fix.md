# Light Mode Contrast Fix — Dark Glass Inversion

## Date
2026-03-31

## Problem
Light mode (dawn/morning/evening) uses bright gradient backgrounds with semi-transparent white glass cards (`rgba(255,255,255,0.3)`), creating "white on white" — insufficient text-to-background contrast and eye strain. WCAG AA contrast ratio (4.5:1) is not met.

## Decision
Invert glass card backgrounds in light mode from semi-transparent white to semi-transparent black. Unify text colors to always use white, removing the `isLight` text color branching.

## Scope
Only affects `isLight: true` time periods: **dawn, morning, evening**.
No changes to `day` or `night` (already `isLight: false`).

## Design

### GlassCard.tsx — Core Change
| Variant | Current (isLight) | New (isLight) |
|---------|-------------------|---------------|
| outer bg | `rgba(255,255,255,0.3)` | `rgba(0,0,0,0.20)` |
| outer border | `rgba(255,255,255,0.4)` | `rgba(255,255,255,0.12)` |
| inner bg | `rgba(255,255,255,0.25)` | `rgba(0,0,0,0.15)` |
| inner border | `rgba(255,255,255,0.15)` | `rgba(255,255,255,0.10)` |

Dark mode values (isLight: false) remain unchanged:
- outer: `rgba(255,255,255,0.15)`, border `rgba(255,255,255,0.2)`
- inner: `rgba(255,255,255,0.1)`, border `rgba(255,255,255,0.15)`

### Text Color Unification
Remove `isLight` ternary branching for text colors in all components. Use unified white-based values:
- primary: `text-white/95`
- secondary: `text-white/80`
- muted: `text-white/55`

#### Affected Components
1. `HeroCard.tsx` — remove primaryText/secondaryText/mutedText isLight branches
2. `OutfitCard.tsx` — remove colorPrimary/colorSecondary/colorMuted/borderColor isLight branches
3. `ConditionsRow.tsx` — remove mutedColor isLight branch
4. `HourlyForecast.tsx` — remove primaryColor/mutedColor isLight branches
5. `PopularCities.tsx` — uses inline Tailwind glass styles (not GlassCard component). Change isLight glass classes from `bg-white/25` to `bg-black/20`, `bg-white/20` to `bg-black/15`. Unify text colors.
6. `Footer.tsx` — remove textClass isLight branch
7. `CitySearchModal.tsx` — update getThemeColors usage

### theme-colors.ts
Remove isLight parameter or make it return identical values for both modes. All text colors unified to white-based.

### globals.css
Remove `[data-theme="light"]` text-shadow rules (no longer needed with dark glass providing contrast).

### TimeBackground.tsx
Remove the `bg-black/25` overlay for isLight (line 29-31). Dark glass cards handle contrast; the overlay is redundant.

## Not Changed
- Background gradients in `theme.ts` (TIME_GRADIENTS) — kept as-is
- `isLight` boolean in theme system — still used for GlassCard background selection
- Dark mode styles (night/day) — no changes
- Component layout or structure — only color values change

## Success Criteria
- All text on light mode backgrounds meets WCAG AA contrast ratio (4.5:1)
- No "white on white" or "blinding" visual experience
- Glass morphism aesthetic preserved across all time periods
- No visual regression on dark mode (day/night)
