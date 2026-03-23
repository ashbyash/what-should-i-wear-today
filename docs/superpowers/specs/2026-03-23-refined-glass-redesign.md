# Refined Glass Redesign

## Overview

Visual redesign of the "What Should I Wear Today" weather app. The goal is to modernize the UI while improving readability, keeping the existing time-based gradient identity. This is a visual refresh with targeted layout improvements, not a feature change.

## Design Direction

**Refined Glass** — evolution of the current glass morphism aesthetic. Thinner glass layers, better typography hierarchy, more whitespace. Inspired by iOS Weather and Linear.

### What Changes
- Hero Card: merge temperature + score + location into one card
- Conditions Row: merge DustCard + UvCard + humidity into compact badges
- Card order: Hero → Outfit → Hourly → Conditions (priority-based)
- Desktop layout: 2-column for Outfit | Hourly
- Border-radius: standardize to 2-tier system (18px / 12px)
- Spacing: increase card gap (12px → 16px), padding (16px → 20px)
- Animation: slightly heavier damping (15 → 20) for smoother feel

### What Stays
- Time-based gradient backgrounds (dawn/morning/day/evening/night)
- Gradient colors unchanged
- Pretendard Variable font
- Emoji icons throughout
- Framer Motion spring animations
- No dark mode (time gradients serve as theme)

## Design Tokens

### Glass

| Token | Value |
|-------|-------|
| Outer card background | `rgba(255,255,255,0.15)` |
| Outer card border | `1px solid rgba(255,255,255,0.2)` |
| Outer card radius | `rounded-[18px]` |
| Outer card padding | `p-5` (20px) |
| Inner element background | `rgba(255,255,255,0.1)` |
| Inner element border | `1px solid rgba(255,255,255,0.15)` |
| Inner element radius | `rounded-xl` (12px) |
| Backdrop blur | `blur(20px)` |
| Card gap | `gap-4` (16px) |

### Light Background Adjustment

Light/dark is determined by the existing `isLight` boolean from `ThemeConfig` in `src/lib/theme.ts`. Currently light: dawn, morning, evening. Dark: day, night. When `isLight` is true, increase glass opacity for contrast:

| Token | Light value |
|-------|-------------|
| Outer card background | `rgba(255,255,255,0.25)` |
| Outer card border | `1px solid rgba(255,255,255,0.35)` |
| Inner element background | `rgba(255,255,255,0.2)` |
| Inner element border | `1px solid rgba(255,255,255,0.3)` |

### Text Colors

| Role | Dark BG (day, night) | Light BG (dawn, morning, evening) |
|------|---------------------|-----------------------------------|
| Primary | `rgba(255,255,255,0.95)` | `rgba(30,30,50,0.85)` |
| Secondary | `rgba(255,255,255,0.8)` | `rgba(30,30,50,0.7)` |
| Muted | `rgba(255,255,255,0.45)` | `rgba(30,30,50,0.4)` |

### Animation

| Property | Value |
|----------|-------|
| Type | Spring |
| Stiffness | 100 |
| Damping | 20 (was 15) |
| Mass | 1 (default) |
| Stagger delay | 0.1s between cards, top-to-bottom |

## Layout

### Card Order (top to bottom)

1. **Hero Card** — location, temperature, weather emoji, feels-like, score with emoji
2. **Outfit Card** — clothing categories with emoji icons
3. **Hourly Forecast** — horizontal scrollable time slots
4. **Conditions Row** — PM2.5 / UV / Humidity as compact badges
5. **Popular Cities** — pill-style city shortcuts
6. **Footer** — contact link

### Responsive Breakpoints

**Mobile (< 768px)**: Single column, all cards full width.

```
[ Hero Card                    ]
[ Outfit Card                  ]
[ Hourly Forecast              ]
[ Conditions Row               ]
[ Popular Cities               ]
[ Footer                       ]
```

**Desktop (>= 768px)**: 2-column grid for middle section.

```
[ Hero Card                    ]  ← full width
[ Outfit Card ] [ Hourly Forecast ]  ← 2 columns
[ Conditions Row               ]  ← full width
[ Popular Cities               ]
[ Footer                       ]
```

Container: keep existing `max-w-3xl` (768px), centered. Desktop 2-column ratio: 1fr 1fr (equal width).

## Component Changes

### New: Hero Card

Merges current LocationHeader + ScoreGauge + part of WeatherCard.

Contents:
- Location name (top-left) — tappable to open CitySearchModal
- Update time (top-right) + refresh button (existing reload logic preserved)
- Large temperature display (left, font-weight: 200, ~56px)
- Weather emoji + condition + feels-like (below temp)
- Score emoji + score number (font-weight: 600, ~36px) + "SCORE" label (10px, muted, uppercase) (right)
- AI message in glass-inner box (bottom) — uses existing `useAIMessage` hook, receives same `weatherContext` props (temperature, feelsLike, weatherMain, pm25, humidity, windSpeed, uvIndex)

Interactive elements from LocationHeader preserved:
- Refresh button (top-right, next to update time)
- Cache warning banner (amber, shown when using cached/offline data)
- "Back to current location" button (shown when viewing other city)
- City search trigger (tap location name)

Score breakdown: tap the score area to expand/collapse the existing breakdown panel (5 sub-scores + wind penalty). Same data, same logic as current ScoreGauge — just without the circular SVG gauge.

Loading state: skeleton with glass-card shape, pulsing opacity. Shows location placeholder + two number placeholders (temp/score).

### Modified: Outfit Card

Same content as current, but:
- Structured rows: emoji (24px) → category label (muted) → item name
- Categories: outer → top → bottom → shoes → accessories
- Alert section preserved (rain, temperature range, mask warnings)
- AI styling tip preserved

### Modified: Hourly Forecast

Previously embedded inside WeatherCard, now standalone card:
- Horizontal scrollable glass-inner items
- Each item: time → weather emoji → temperature
- Day grouping headers preserved (today/tomorrow)

### New: Conditions Row

Replaces separate DustCard and UvCard:
- 3 compact glass-inner badges in a row
- Each badge: emoji → label → colored value
- PM2.5 (from existing `dustData.pm25`), UV (from existing `uvData`), Humidity (from existing `weather.humidity`)
- Color-coded values:
  - Green (`#4ade80`): PM2.5 good (0-15), UV low (0-2), Humidity optimal range
  - Yellow (`#fbbf24`): PM2.5 moderate (16-35), UV moderate (3-5), Humidity marginal
  - Red (`#f87171`): PM2.5 bad (36+), UV high (6+), Humidity extreme
- Loading state: 3 skeleton badges with pulsing opacity

### Modified: WeatherCard → removed

Current WeatherCard renders: weather emoji with animation, current temp, feels-like, min/max, wind, humidity, and hourly forecast. All of this data moves to Hero Card (temp, feels-like, weather emoji) and Hourly Forecast (standalone) and Conditions Row (humidity). WeatherCard component is deleted.

### Removed Components

- **ScoreGauge** (circular SVG gauge) — score + breakdown moves into Hero Card
- **DustCard** (full card) — merged into Conditions Row
- **UvCard** (full card) — merged into Conditions Row
- **WeatherCard** — data split across Hero Card, Hourly Forecast, and Conditions Row
- **AirQualityCard** — currently unused (not imported in page.tsx), can be deleted as cleanup
- **LocationHeader** — absorbed into Hero Card

### Restyled Components

- **PopularCities** — same functionality, restyled as glass-inner pills with `rounded-[20px]`. May need prop updates to match new glass token system.
- **Footer** — same content, restyled to match new glass tokens. Currently rendered inside `Providers` wrapper in layout.tsx.

### Unchanged Components

- **CitySearchModal** — no visual changes in this phase
- **CityWeatherPage** — consumes the same new components (Hero, Outfit, Hourly, Conditions). Requires same redesign applied — not a separate effort, just swapping the same components.

## Pages Affected

- `/` (Home) — primary redesign target
- `/[city]` (City pages) — same components, same redesign
- `/cities` (Directory) — not in scope for this phase

## Out of Scope

- Feature changes (no new data, no new APIs)
- Dark mode toggle
- Font change
- Icon system change
- CitySearchModal redesign
- Cities directory page redesign
- Score calculation logic changes

## Mockups

Interactive mockups available at:
`.superpowers/brainstorm/75926-1774231599/final-design.html`

Open with a local HTTP server to view phone mockup with time-of-day switching.
