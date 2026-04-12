# Design System Spec — Apple Weather 레퍼런스

## Overview

현재 프로젝트의 하드코딩된 디자인 값을 토큰 체계로 정리하고, Apple Weather 앱의 디자인 원칙을 적용하여 업그레이드한다.

**접근 방식:** Token-First (Bottom-Up) — 토큰 정의 → 기존 컴포넌트 마이그레이션 → 새 모듈 추가

**산출물:** 코드 중심 (Tailwind 테마 + CSS 변수 + 토큰 파일). 별도 문서 사이트 없음.

---

## 1. 컬러 시스템

### 1-1. 시간대별 그라데이션

현재 2색 linear-gradient에서 3색 경유점(via)을 추가하여 더 자연스러운 하늘 표현으로 전환한다. 채도를 살짝 낮춰 Apple Weather의 자연광 톤에 가깝게 조정한다.

| 시간대 | 현재 (from → to) | 제안 (from → via → to) |
|--------|------------------|------------------------|
| Dawn | `#a1c4fd` → `#f0dcc0` | `#8fb8de` → `#dac5a0` → `#c4a882` |
| Morning | `#f0a48c` → `#f0dcc0` | `#e8967e` → `#f0d5b0` → `#8ec5e0` |
| Day | `#56ccf2` → `#2f80ed` | `#4ab8e0` → `#5a9fe8` → `#3478c6` |
| Evening | `#e08a96` → `#f0cdd2` | `#c87a8a` → `#d4a0aa` → `#5a4a72` |
| Night | `#0f0c29` → `#302b63` | `#0c0a1e` → `#1a1545` → `#2a2060` |

변경 위치: `src/lib/theme.ts` — `TIME_GRADIENTS` 타입을 `{ from, via, to }`로 확장
CSS 출력: `linear-gradient(to bottom, ${from}, ${via}, ${to})`
`getGradientStyle()` 함수도 3색 지원으로 업데이트

### 1-2. 텍스트 계층 토큰

현재 각 컴포넌트에서 반복되는 `text-white/XX` 유틸리티를 시맨틱 CSS 변수로 통합한다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--text-primary` | `rgba(255,255,255, 0.95)` | 주요 텍스트 (온도, 도시명) |
| `--text-secondary` | `rgba(255,255,255, 0.80)` | 보조 텍스트 (날씨 상태, 체감온도) |
| `--text-muted` | `rgba(255,255,255, 0.55)` | 부가 정보 (업데이트 시간, 라벨) |
| `--text-disabled` | `rgba(255,255,255, 0.30)` | 비활성/로딩 |

정의 위치: `globals.css` `:root`
Tailwind 연동: `tailwind.config.ts`에 `textColor` 토큰 추가

### 1-3. 상태 색상 토큰

현재 ConditionsRow, HeroCard 내부에 하드코딩된 상태 색상을 추출한다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--status-good` | `#4ade80` | PM2.5 좋음, UV 낮음, 습도 적정 |
| `--status-moderate` | `#fbbf24` | PM2.5 보통, UV 보통 |
| `--status-bad` | `#f87171` | PM2.5 나쁨, UV 높음 |

### 1-4. 점수 바 그라데이션 토큰

| 토큰 | 값 | 조건 |
|------|-----|------|
| `--score-good` | `linear-gradient(90deg, #34d399, #4ade80)` | ≥70% |
| `--score-moderate` | `linear-gradient(90deg, #fbbf24, #facc15)` | 40~70% |
| `--score-bad` | `linear-gradient(90deg, #fb923c, #f87171)` | <40% |

---

## 2. 타이포그래피

### 2-1. 타입 스케일

Apple Weather의 극단적 웨이트 대비를 반영한다. 큰 숫자는 가볍게(thin/light), 작은 라벨은 무겁게(medium/semibold).

| 토큰 | Size | Weight | Line Height | 용도 | 변경 |
|------|------|--------|-------------|------|------|
| `temperature` | 64px | 200 | 1 | 온도 표시 | 신규 (기존 인라인 56px/300 대체) |
| `score` | 40px | 600 | 1.1 | 점수 표시 | display(40/700)에서 변경 |
| `title` | 20px | 600 | 1.4 | 섹션 제목 | heading-1(24/600)에서 변경 |
| `headline` | 16px | 500 | 1.5 | 카드 제목 | heading-2 유지 |
| `body` | 14px | 400 | 1.4 | 본문 | 유지 |
| `caption` | 12px | 400 | 1.3 | 부가 정보 | 유지 |
| `label` | 12px | 500 | 1.3 | 일반 라벨 (SCORE 등) | 유지 |
| `module-label` | 13px | 500 | 1.3 | 모듈 카드 라벨 | 신규 |

추가 속성:
- `temperature` 토큰: `letter-spacing: -2px` (숫자 간격 조밀하게)
- `module-label` 토큰: `text-transform: uppercase`, `letter-spacing: 0.5px`

정의 위치: `tailwind.config.ts` — `fontSize` 확장

---

## 3. 글래스 & 서피스

### 3-1. 글래스 카드 토큰

현재 `GlassCard.tsx`에 인라인으로 들어있는 rgba, border, blur 값을 CSS 변수로 추출한다. isLight에 따라 JS에서 CSS 변수를 전환한다.

| 토큰 | Dark BG 값 | Light BG 값 |
|------|-----------|------------|
| `--glass-bg-outer` | `rgba(255,255,255, 0.12)` | `rgba(0,0,0, 0.18)` |
| `--glass-bg-inner` | `rgba(255,255,255, 0.07)` | `rgba(0,0,0, 0.12)` |
| `--glass-border-outer` | `rgba(255,255,255, 0.18)` | `rgba(255,255,255, 0.15)` |
| `--glass-border-inner` | `rgba(255,255,255, 0.10)` | `rgba(255,255,255, 0.08)` |
| `--glass-blur` | `24px` | `24px` |
| `--glass-radius-outer` | `20px` | `20px` |
| `--glass-radius-inner` | `14px` | `14px` |
| `--glass-shadow` | `0 2px 16px rgba(0,0,0, 0.2)` | `0 2px 16px rgba(0,0,0, 0.15)` |
| `--glass-glow` | `inset 0 1px 0 rgba(255,255,255, 0.08)` | `inset 0 1px 0 rgba(255,255,255, 0.06)` |

### 3-2. 현재 대비 변경 요약

| 속성 | 현재 | 제안 | 이유 |
|------|------|------|------|
| outer bg 투명도 | 15% | 12% | 더 은은한 유리 느낌 |
| blur | 20px | 24px | 배경이 더 부드럽게 비침 |
| inner glow | 없음 | `inset 0 1px 0 white/8%` | 상단 하이라이트로 깊이감 |
| drop shadow | 없음 | `0 2px 16px black/20%` | 카드가 배경에서 떠있는 느낌 |
| outer radius | 18px | 20px | 더 둥글고 부드러운 형태 |
| inner radius | 12px | 14px | outer와 비례 유지 |

### 3-3. GlassCard 리팩토링

현재 GlassCard는 `isLight` prop에 따라 인라인 style 객체를 삼항 연산으로 생성한다. 리팩토링 후에는:
- CSS 변수를 참조하는 Tailwind 클래스 사용
- `isLight` 전환 메커니즘: CityWeatherPage의 최상위 div에 `data-theme-mode="light"` 또는 `data-theme-mode="dark"` 속성을 설정하고, globals.css에서 `[data-theme-mode="light"]` 셀렉터로 light용 CSS 변수 세트를 오버라이드
- GlassCard 자체는 토큰만 참조하므로 `isLight` prop 불필요해짐 (단, 하위 호환을 위해 유지 가능)

---

## 4. 간격 & 레이아웃

### 4-1. 시맨틱 레이아웃 토큰

Tailwind 기본 spacing 스케일은 그대로 사용한다. 레이아웃 구조적 값만 토큰으로 관리한다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--layout-max-width` | `48rem` (768px) | 페이지 컨테이너 |
| `--layout-page-padding` | `16px` | 좌우 여백 |
| `--layout-card-gap` | `16px` | 카드 간 간격 |
| `--layout-card-padding-outer` | `20px` | 외부 카드 내부 여백 |
| `--layout-card-padding-inner` | `12px` | 내부 카드 내부 여백 |

### 4-2. WeatherModule 그리드 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--grid-module-columns` | `2` | 모듈 카드 그리드 컬럼 수 |
| `--grid-module-gap` | `12px` | 모듈 카드 간 간격 |

---

## 5. 모션 & 애니메이션

### 5-1. Duration 토큰

| 토큰 | 값 | 용도 | 대체 대상 |
|------|-----|------|----------|
| `--motion-fast` | `150ms` | 아이콘 회전, hover | `duration: 0.2` |
| `--motion-normal` | `300ms` | 카드 진입, 펼치기/접기 | `duration: 0.3` |
| `--motion-slow` | `500ms` | 점수 바 채우기 | `duration: 0.5` |
| `--motion-pulse` | `1.5s` | 스켈레톤 펄스 | `duration: 1.5` |

### 5-2. Easing 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | 진입 애니메이션 |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | 펼치기/접기 |

### 5-3. Spring 프리셋 (framer-motion)

CSS 변수가 아닌 JS 상수로 정의한다 (`src/lib/design-tokens.ts`).

| 프리셋 | 값 | 용도 |
|--------|-----|------|
| `spring-gentle` | `{ stiffness: 120, damping: 14 }` | 카드 진입, 모달 |
| `spring-bouncy` | `{ stiffness: 300, damping: 20 }` | 버튼 반응, 토글 |

### 5-4. Stagger 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--stagger-step` | `80ms` | 항목별 순차 진입 (현재 100~300ms 불규칙 → 80ms 통일) |

---

## 6. WeatherModule 컴포넌트

### 6-1. 개요

현재 ConditionsRow(가로 3열 배지)를 Apple Weather 스타일 2×2 모듈 그리드로 전환한다.

### 6-2. WeatherModule 컴포넌트

```typescript
interface WeatherModuleProps {
  icon: string;        // 이모지 또는 SVG
  label: string;       // 상단 라벨 (module-label 토큰)
  value: string;       // 주요 값 (24px / 300)
  unit?: string;       // 단위 (14px / 300, muted)
  description: string; // 설명 텍스트 (caption 토큰)
  color?: string;      // 값 색상 (상태 토큰 또는 기본 white/95)
}
```

구조:
```
┌─────────────────────┐
│ 💨 미세먼지          │  ← icon + module-label
│                     │
│ 좋음                │  ← value (24px, light, color)
│                     │
│ PM2.5 12㎍/㎥       │  ← description (caption, muted)
└─────────────────────┘
```

Glass 스타일: `--glass-bg-inner` + `--glass-border-inner` 토큰 사용

### 6-3. WeatherModuleGrid 컴포넌트

```typescript
interface WeatherModuleGridProps {
  children: React.ReactNode;  // WeatherModule 자식들
  columns?: number;           // 기본값: 2
}
```

`display: grid` + `grid-template-columns: repeat(columns, 1fr)` + `gap: var(--grid-module-gap)`

### 6-4. 모듈 목록

| 모듈 | icon | label | value 예시 | description 예시 |
|------|------|-------|-----------|-----------------|
| PM2.5 | 💨 | 미세먼지 | 좋음 (color: status-good) | PM2.5 12㎍/㎥ |
| UV | ☀️ | 자외선 | 보통 (color: status-moderate) | UV 지수 4 |
| 습도 | 💧 | 습도 | 52% | 쾌적한 수준 |
| 바람 | 🌬️ | 바람 | 3.2 m/s | 산들바람 |

### 6-5. 기존 컴포넌트 영향

| 컴포넌트 | 변경 |
|---------|------|
| `ConditionsRow` | 삭제 → WeatherModuleGrid로 대체 |
| `HeroCard` | 유지 — 인라인 스타일을 토큰 참조로 마이그레이션 |
| `OutfitCard` | 유지 — 토큰 적용 |
| `HourlyForecast` | 유지 — 토큰 적용 |
| `GlassCard` | 리팩토링 — 인라인 스타일 → CSS 변수 참조 |
| `CityWeatherPage` | isLight에 따라 CSS 변수 세트 전환 로직 추가 |

---

## 7. 파일 구조

### 신규 파일

| 파일 | 역할 |
|------|------|
| `src/lib/design-tokens.ts` | JS 토큰 (spring 프리셋, 시맨틱 상수) |
| `src/components/WeatherModule.tsx` | 개별 모듈 카드 |
| `src/components/WeatherModuleGrid.tsx` | 모듈 그리드 레이아웃 |

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `tailwind.config.ts` | fontSize 토큰 업데이트, textColor/glass 토큰 추가 |
| `src/app/globals.css` | CSS 변수 체계 확장 (텍스트, 글래스, 레이아웃, 모션) |
| `src/lib/theme.ts` | 3색 그라데이션, CSS 변수 전환 함수 |
| `src/components/GlassCard.tsx` | 인라인 스타일 → CSS 변수 참조 |
| `src/components/HeroCard.tsx` | 인라인 fontSize/fontWeight → 토큰 클래스 |
| `src/components/OutfitCard.tsx` | 텍스트 계층 토큰 적용 |
| `src/components/HourlyForecast.tsx` | 텍스트/모션 토큰 적용 |
| `src/components/CityWeatherPage.tsx` | isLight CSS 변수 전환, ConditionsRow → WeatherModuleGrid |
| `src/components/Skeleton.tsx` | 모션 토큰 적용 |
| `src/components/CitySearchModal.tsx` | 모션/글래스 토큰 적용 |

### 삭제 파일

| 파일 | 이유 |
|------|------|
| `src/components/ConditionsRow.tsx` | WeatherModuleGrid로 대체 |
