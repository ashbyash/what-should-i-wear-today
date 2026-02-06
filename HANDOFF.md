# Handoff: AI 기능 개선 (anthropic-refs 활용)

## 1. Completed Work

### anthropic-refs 탐색 완료
- `/Users/ash/anthropic-refs/` 전체 폴더 탐색 (courses, cookbooks, plugins, tutorial)
- 현재 프로젝트에 적용 가능한 항목 7개 리스트업 완료

### Claude 마이그레이션 시도 → 롤백
- `openai` → `@anthropic-ai/sdk` 패키지 교체 수행
- `src/lib/ai-message.ts` OpenAI → Anthropic 클라이언트 전환
- Anthropic API 크레딧 부족 에러 확인: `invalid_request_error: Your credit balance is too low`
- OpenAI 잔액이 남아있어 롤백 결정
- **롤백 완료**: `ai-message.ts` 원본 복원, `openai` 패키지 재설치

### 현재 git 변경
- `package.json`: openai 버전 `^6.17.0` → `^6.18.0` (npm reinstall로 minor bump)
- `package-lock.json`: 위 변경 반영
- `src/lib/ai-message.ts`: 변경 없음 (원본 상태)

---

## 2. Current State

```
브랜치: main (origin/main과 동기화됨)
Modified (not staged): package.json, package-lock.json
유일한 변경: openai ^6.17.0 → ^6.18.0 (reinstall로 인한 minor bump)
ai-message.ts: 원본 상태 (OpenAI GPT-4o-mini)
빌드: 성공
```

---

## 3. Pending Tasks — Step 2~4 (OpenAI 기반)

### Step 2: 프롬프트 엔지니어링 개선
- **대상 파일**: `src/lib/prompts/score-message.ts`
- **참고 자료**: `anthropic-refs/courses/prompt_engineering_interactive_tutorial/`
  - Ch.4: 데이터/지시 분리 → XML 태그로 `<weather_data>`, `<score_breakdown>` 구분
  - Ch.5: 출력 포맷 지정 (system prompt에 예시 포함으로 대체)
  - Ch.7: Few-shot 예시 2-3개 추가
  - Ch.8: 환각 방지 → 제공된 데이터만 사용하도록 명시적 제약
- **현재 프롬프트 구조**: `buildSystemPrompt()` + `buildUserPrompt(input)` 분리됨
- **수정 방향**: 프롬프트 기법은 모델에 무관하므로 OpenAI에서도 동일 적용 가능

### Step 3: Prompt Caching (OpenAI)
- **대상 파일**: `src/lib/ai-message.ts`
- **참고**: `anthropic-refs/claude-cookbooks/misc/prompt_caching.ipynb`
- **OpenAI 방식**: 자동 캐싱 (1024 토큰 이상 시스템 프롬프트 자동 캐시)
- **현재 상태**: 이미 앱 레벨 메모리 캐시 있음 (10점 단위 버킷팅, TTL 기반)

### Step 4: 구조화된 JSON 출력 (선택)
- **대상 파일**: `src/lib/ai-message.ts`, `src/lib/prompts/score-message.ts`, `src/types/score.ts`
- **참고**: `anthropic-refs/claude-cookbooks/tool_use/extracting_structured_json.ipynb`
- **OpenAI 방식**: `response_format: { type: "json_schema" }` 사용
- **변경 후 응답**: `{ message, tone, keyFactor }` 구조
- **주의**: UI 컴포넌트(`ScoreGauge.tsx`, `useAIMessage.ts`)도 수정 필요

---

## 4. Key Decisions Made

| 결정 | 이유 |
|------|------|
| Claude 마이그레이션 롤백 | Anthropic API 크레딧 부족 + OpenAI 잔액 남아있음 |
| OpenAI 유지하며 Step 2~4 진행 | 프롬프트 기법, Structured Output, Prompt Caching 모두 OpenAI에서도 가능 |
| Claude 전환은 OpenAI 잔액 소진 후 | Claude 전용 장점(prefill, 명시적 cache_control)은 있지만 현재 급하지 않음 |

---

## 5. Blockers / Issues Found

### Anthropic API 크레딧 부족
- **에러**: `invalid_request_error: Your credit balance is too low to access the Anthropic API`
- Evaluation access 플랜에 무료 크레딧 없음, 최소 $5 충전 필요

### 기존 테스트 실패 3건 (마이그레이션 무관)
- `src/lib/__tests__/outfit.test.ts` 에서 3개 실패
  - `'다운 롱패딩'` 기대 → 실제 `['다운 패딩', '울 코트']`
  - `'일교차가 커요, 겉옷 챙기세요'` 기대 → 실제 `'아침엔 코트, 낮엔 얇은 가디건이면 충분해요'`

### localhost Geolocation 이슈 (기존)
- `enableHighAccuracy: true`가 Mac 데스크톱에서 `POSITION_UNAVAILABLE` 에러 유발
- `src/lib/geolocation.ts:107`
- 도시 페이지(`/seoul` 등)로는 정상 접속 가능

---

## 6. Context for Next Session

### 핵심 파일
| 파일 | 역할 |
|------|------|
| `src/lib/prompts/score-message.ts` | 프롬프트 템플릿 (Step 2 수정 대상) |
| `src/lib/ai-message.ts` | AI 서비스 (Step 3, 4 수정 대상) |
| `src/lib/constants.ts` | 점수 가중치 등 비즈니스 상수 |
| `src/components/ScoreGauge.tsx` | AI 메시지 렌더링 컴포넌트 |
| `src/lib/useAIMessage.ts` | 클라이언트 AI 메시지 훅 |

### anthropic-refs 주요 참고 경로
- 프롬프트 기법: `anthropic-refs/courses/prompt_engineering_interactive_tutorial/`
- JSON 출력: `anthropic-refs/claude-cookbooks/tool_use/extracting_structured_json.ipynb`
- Evals: `anthropic-refs/claude-cookbooks/misc/building_evals.ipynb`

---

## 다음 세션 시작 프롬프트

```
이전 세션에서 anthropic-refs 탐색 + Claude 마이그레이션 시도 후 롤백했습니다.
현재 OpenAI GPT-4o-mini 기반으로 동작 중입니다.

HANDOFF.md를 읽고 Step 2 (프롬프트 엔지니어링 개선)부터 진행해주세요.
대상 파일: src/lib/prompts/score-message.ts
참고: anthropic-refs/courses/prompt_engineering_interactive_tutorial/ Ch.4,5,7,8

적용할 기법:
1. 데이터/지시 분리 (XML 태그)
2. Few-shot 예시 2-3개 추가
3. 환각 방지 제약 추가
4. 출력 포맷 명시

Step 2 완료 후 Step 3 (Prompt Caching), Step 4 (구조화 JSON 출력) 순서로 진행합니다.
각 스텝 완료 시 확인 후 다음 스텝으로 넘어갑니다.
```
