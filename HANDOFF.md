# Handoff Document: AI 점수 메시지 기능 구현

## 1. Completed Work (이번 세션)

### 파일 변경
| 파일 | 변경 내용 |
|-----|---------|
| `package.json` | `openai: ^6.17.0` 패키지 추가 |
| `package-lock.json` | openai 의존성 잠금 |
| `.env.local` | `OPENAI_API_KEY` 환경변수 추가됨 (사용자가 직접 설정) |

### 실행한 명령
```bash
npm install openai  # ✅ 완료
```

### 완료된 분석 작업
- Feature Development 프로세스로 코드베이스 탐색 완료
- 3가지 아키텍처 설계안 비교 완료 (Minimal / Clean / Pragmatic)
- **Pragmatic Balance** 아키텍처 선정

---

## 2. Current State

```
브랜치: main (origin/main과 동기화됨)
변경된 파일:
- package.json (+1 line: openai 패키지)
- package-lock.json (+23 lines)

커밋 상태: 아직 커밋되지 않음
```

---

## 3. Pending Tasks (구현 필요)

### 새로 생성할 파일 (4개)

1. **`src/lib/prompts/score-message.ts`** - 프롬프트 템플릿
   - constants.ts에서 SCORE_WEIGHTS 동적 참조
   - 사용자가 직접 튜닝 가능한 구조

2. **`src/lib/ai-message.ts`** - AI 메시지 서비스
   - 서버 메모리 캐시 (Map + TTL)
   - 캐시 키: `${level}_${tempZone}_${weather}_${dustLevel}`
   - OpenAI GPT-4o-mini 호출
   - Fallback: 기존 고정 메시지

3. **`src/lib/useAIMessage.ts`** - SWR 클라이언트 훅
   - `/api/ai-message` 호출
   - 로딩/에러 상태 관리
   - 에러 시 staticMessage로 fallback

4. **`src/app/api/ai-message/route.ts`** - API 엔드포인트
   - Query params: level, tempZone, weather, dustLevel
   - 캐시 체크 → OpenAI 호출 → 응답

### 수정할 파일 (1개)

5. **`src/components/ScoreGauge.tsx`** (line 220-222 주변)
   - `useAIMessage` 훅 통합
   - AI 메시지 로딩 중 스켈레톤 표시
   - `aiMessage || score.message` (fallback)

---

## 4. Key Decisions Made

| 결정 | 이유 |
|-----|-----|
| API 위치: 서버 (API Route) | API 키 보안, 캐싱 중앙화, Vercel Edge 활용 |
| LLM: OpenAI GPT-4o-mini | 저렴하고 빠름 ($0.15/1M input tokens) |
| 캐시: 서버 메모리 (Map) | 기존 패턴과 동일, 무료, 단순함 |
| 로딩 UX: AI 영역만 스켈레톤 | 메인 콘텐츠 빠르게 표시, AI만 별도 로딩 |
| Fallback: 기존 고정 메시지 | API 실패 시 서비스 중단 방지 |
| 아키텍처: Pragmatic Balance | AI 스타일링 팁(다음 로드맵)까지 고려한 적절한 추상화 |
| 프롬프트: 동적 생성 | 점수 로직 변경 시 자동 반영, 별도 파일로 튜닝 가능 |

---

## 5. Blockers / Issues Found

**없음** - 모든 준비 작업 완료됨

---

## 6. Context for Next Session

### 핵심 파일 위치 및 역할

| 파일 | 역할 | 관련 라인 |
|-----|-----|---------|
| `src/lib/score.ts` | 점수 계산 | `calculateOutingScore()` line 244-292 |
| `src/lib/score.ts` | 현재 메시지 선택 | `getOutingMessage()` line 201-207 |
| `src/lib/constants.ts` | 점수 가중치 | `SCORE_WEIGHTS` line 9-17 |
| `src/lib/constants.ts` | 고정 메시지 | `LEVEL_MESSAGES` line 178-214 |
| `src/types/score.ts` | ScoreBreakdown 타입 | line 2-9 |
| `src/components/ScoreGauge.tsx` | 메시지 표시 | line 220-222 |
| `src/components/Skeleton.tsx` | 스켈레톤 컴포넌트 | `SkeletonBox` line 6-14 |
| `src/lib/useWeatherData.ts` | SWR 패턴 참고 | 전체 |

### ScoreBreakdown 타입 (6개 요소)
```typescript
interface ScoreBreakdown {
  feelsLikeTemp: number; // 0-65
  weather: number;       // 0-15
  fineDust: number;      // 0-10
  uv: number;            // 0-5
  humidity: number;      // 0-5
  windPenalty: number;   // -10~0
}
```

### SCORE_WEIGHTS 상수
```typescript
export const SCORE_WEIGHTS = {
  FEELS_LIKE_TEMP: 65,
  WEATHER: 15,
  FINE_DUST: 10,
  UV: 5,
  HUMIDITY: 5,
  WIND_PENALTY_MAX: -10,
};
```

### 프롬프트 설계 방향
- `SCORE_WEIGHTS`에서 동적으로 점수 기준 섹션 생성
- `ScoreBreakdown` 객체 순회해서 context 자동 생성
- 별도 파일(`src/lib/prompts/score-message.ts`)로 분리해서 튜닝 가능

### 캐시 키 전략
```typescript
const cacheKey = `${level}_${tempZone}_${weather}_${dustLevel}`;
// 예: "excellent_MILD_Clear_good"
```

### API 응답 형식
```typescript
// GET /api/ai-message?level=excellent&tempZone=MILD&weather=Clear&dustLevel=good
{ message: string, cached: boolean }
```

---

## 다음 세션 시작 프롬프트

```
AI 점수 메시지 기능 구현을 계속합니다.

## 완료된 준비 작업
- openai 패키지 설치됨 (package.json에 추가됨)
- .env.local에 OPENAI_API_KEY 설정됨

## 구현할 파일 (순서대로)
1. src/lib/prompts/score-message.ts - 프롬프트 템플릿 (SCORE_WEIGHTS에서 동적 생성)
2. src/lib/ai-message.ts - 캐시 + OpenAI 통합
3. src/lib/useAIMessage.ts - SWR 클라이언트 훅
4. src/app/api/ai-message/route.ts - API 엔드포인트
5. src/components/ScoreGauge.tsx 수정 - AI 메시지 통합 + 스켈레톤

## 핵심 요구사항
- 프롬프트는 constants.ts의 SCORE_WEIGHTS를 동적 참조 (하드코딩 금지)
- ScoreBreakdown의 모든 6개 요소 포함 (체감온도, 날씨, 미세먼지, 자외선, 습도, 풍속)
- 프롬프트 파일은 별도 분리해서 직접 튜닝 가능하게
- API 실패 시 기존 고정 메시지로 fallback
- AI 메시지 영역만 스켈레톤 표시

구현을 시작해주세요.
```
