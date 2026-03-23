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
| Outer card radius | `18px` |
| Outer card padding | `20px` |
| Inner element background | `rgba(255,255,255,0.1)` |
| Inner element border | `1px solid rgba(255,255,255,0.15)` |
| Inner element radius | `12px` |
| Backdrop blur | `blur(20px)` |
| Card gap | `16px` |

### Light Background Adjustment (dawn, morning, evening)

When background is light, increase glass opacity for contrast:

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
| Stagger delay | 0.1s between cards |

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

Container max-width: `768px`, centered.

## Component Changes

### New: Hero Card

Merges current LocationHeader + ScoreGauge + part of WeatherCard.

Contents:
- Location name (top-left)
- Update time (top-right)
- Large temperature display (left, font-weight: 200, ~56px)
- Weather emoji + condition + feels-like (below temp)
- Score emoji + score number + "SCORE" label (right)
- AI message in glass-inner box (bottom)

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
- PM2.5, UV, Humidity
- Color-coded values (green for good, yellow for moderate, red for bad)

### Removed Components

- **ScoreGauge** (circular SVG gauge) — score moves into Hero Card as a simple number
- **DustCard** (full card) — merged into Conditions Row
- **UvCard** (full card) — merged into Conditions Row

### Unchanged Components

- **WeatherCard hourly data** — moves to standalone but same data/logic
- **PopularCities** — same functionality, restyled as glass-inner pills
- **Footer** — same, restyled to match
- **CitySearchModal** — no visual changes in this phase
- **CityWeatherPage** — same redesign applied (uses same components)

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
