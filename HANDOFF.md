# Handoff: Footer 배경색 불일치 버그 분석 + TimeContext 플랜 수립

## 1. Completed Work (이번 세션)

### 버그 원인 분석
- 페이지 이동(cities → 메인) 시 Footer와 메인 콘텐츠 배경색이 한 박자 어긋나는 버그 발견 및 원인 확인
- `useClientHour()`가 3곳에서 독립 호출, 각각 `useState(12)`로 시작 후 `useEffect`에서 실제 시간 설정
- 리마운트 타이밍 차이로 색상 불일치 발생

### TimeContext 도입 플랜 작성
- 플랜 파일 작성 완료 (아래 Section 6 참조)
- 코드 수정은 미착수 (다음 세션에서 진행)

## 2. Current State

```
Branch: main
Latest commit: fc959c4 "oversea search update"
Working tree: HANDOFF.md만 수정
```

## 3. Pending Tasks

### 즉시 실행: TimeContext 도입 (4 Step)

**Step 1: TimeProvider 생성**
- 신규 파일: `src/lib/TimeProvider.tsx`
- `TimeContext` 생성, `clientHour` 값을 Context로 제공
- 기존 `useClientHour.ts`의 타이머 로직(useState + useEffect + setInterval 60초)을 이동
- 타이머 1개로 통합

**Step 2: Providers에 TimeProvider 추가**
- 수정 파일: `src/components/Providers.tsx` (현재 17줄)
- 현재: `ErrorBoundary > LazyMotionProvider > {children}`
- 변경: `ErrorBoundary > LazyMotionProvider > TimeProvider > {children}`
- `layout.tsx`에서 `Providers`가 `{children}` + `<Footer />`를 이미 감싸고 있으므로 모든 컴포넌트 커버

**Step 3: useClientHour를 Context 래퍼로 변경**
- 수정 파일: `src/lib/useClientHour.ts` (현재 20줄)
- 기존: 독립 타이머 생성 (`useState(12)` + `useEffect` + `setInterval`)
- 변경: `useContext(TimeContext)` 래퍼로 교체
- **API 동일 유지** → 소비자 코드(page.tsx, CityWeatherPage.tsx, Footer.tsx) 변경 불필요

**Step 4: TimeBackground도 동일 시간 사용**
- 수정 파일: `src/components/TimeBackground.tsx` (현재 33줄)
- 기존 L13: `getTimeOfDay()` 인자 없이 호출, 빈 의존성 배열(`[]`)로 한번만 계산
- 변경: `useClientHour()` 호출로 교체 → 다른 컴포넌트와 동일한 시간 사용

### 검증
- `npm run build` 성공 확인
- 로컬에서 메인 → /cities → 뒤로가기 시 Footer/메인 배경색 일치 확인

### 후순위 (미착수)
- 글로벌 CLAUDE.md 압축 (209줄 → ~50줄, "나중에" 결정)
- UI/UX 디테일 수정 (CitySearchModal 탭, CitiesTabs 스타일)

## 4. Key Decisions Made

| 결정 | 이유 |
|------|------|
| Context 방식 채택 (초기값 변경 X) | 초기값을 `new Date().getHours()`로 바꾸면 SSR/hydration mismatch 발생 가능. Context가 근본적 해결 |
| `useClientHour()` API 유지 | 소비자 3곳(page.tsx, CityWeatherPage.tsx, Footer.tsx)의 코드 변경 없이 내부만 교체 |
| `TimeBackground`도 수정 대상에 포함 | 현재 `getTimeOfDay()` 인자 없이 한번만 계산 → 다른 컴포넌트와 시간 불일치 가능 |

## 5. Blockers / Issues Found

없음.

## 6. Active Plan File

**절대경로**: `/Users/ash/.claude/plans/wild-wiggling-crayon.md`

Footer 배경색 불일치 수정을 위한 TimeContext 도입 플랜. 4 Step 구성, 미착수 상태.

## 7. Context for Next Session

### 버그 현상
- 메인 → /cities → 뒤로가기 시 Footer와 메인 콘텐츠 배경 그라데이션 색상 불일치
- Footer는 layout에 있어 리마운트 안됨(이미 실제 시간), HomeContent는 새로 마운트되며 12시부터 시작

### `useClientHour` 소비자 3곳 (변경 불필요, API 동일 유지)
```
src/app/page.tsx              L28 import, L33 호출 → getTimeOfDay(clientHour, coordinates)
src/components/CityWeatherPage.tsx  L26 import, L37 호출 → getTimeOfDay(clientHour, {lat, lon})
src/components/Footer.tsx     L5 import, L8 호출 → getTimeOfDay(clientHour)
```

### 수정 대상 파일 4개
```
src/lib/TimeProvider.tsx      — 신규 생성 (Context + Provider, 타이머 로직)
src/lib/useClientHour.ts      — 독립 타이머 → useContext(TimeContext) 래퍼
src/components/Providers.tsx  — TimeProvider 추가 (ErrorBoundary > LazyMotion > TimeProvider)
src/components/TimeBackground.tsx — getTimeOfDay() → useClientHour() 교체
```

### 현재 useClientHour.ts 전체 코드 (20줄)
```tsx
'use client';
import { useState, useEffect } from 'react';

export function useClientHour() {
  const [clientHour, setClientHour] = useState<number>(12);
  useEffect(() => {
    const updateHour = () => {
      const now = new Date();
      setClientHour(now.getHours() + now.getMinutes() / 60);
    };
    updateHour();
    const interval = setInterval(updateHour, 60000);
    return () => clearInterval(interval);
  }, []);
  return clientHour;
}
```

### 현재 Providers.tsx 전체 코드 (17줄)
```tsx
'use client';
import { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LazyMotionProvider from './LazyMotionProvider';

interface ProvidersProps { children: ReactNode; }

export default function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <LazyMotionProvider>{children}</LazyMotionProvider>
    </ErrorBoundary>
  );
}
```

### 현재 TimeBackground.tsx 전체 코드 (33줄)
```tsx
'use client';
import { useMemo } from 'react';
import { getTimeOfDay, TIME_GRADIENTS, TIME_TEXT_COLORS } from '@/lib/theme';

export default function TimeBackground({ children, className = '' }) {
  const { gradientStyle, isLight } = useMemo(() => {
    const timeOfDay = getTimeOfDay();  // 인자 없음, 빈 deps로 한번만 실행
    const gradient = TIME_GRADIENTS[timeOfDay];
    return {
      gradientStyle: { background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})` },
      isLight: TIME_TEXT_COLORS[timeOfDay].isLight,
    };
  }, []);
  // ... render
}
```
