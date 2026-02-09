# Handoff: AI 스타일링 팁 구현

## 1. Completed Work (이번 세션)

### CitySearchModal UX 개선
해외 여행지 발견성 향상을 위한 모달 리디자인 완료.

**변경 파일:**
- `src/components/CitySearchModal.tsx` (커밋 e41b565)
  - `FEATURED_SLUGS` → `FEATURED_DOMESTIC`(제주/부산/강릉) + `FEATURED_OVERSEAS`(오사카/방콕/도쿄) 분리 (line 16-17)
  - 빠른 선택 섹션: "국내 인기" / "해외 인기" 라벨 분리 (line 287-326)
  - 국내 도시: 5개만 기본 표시 + "더 보기" 버튼 접기/펼치기 (line 380-429)
  - 해외 섹션: 세로 리스트 → 지역별(일본/동남아/기타) 가로 칩 레이아웃 (line 432-464)
  - 빠른 선택 상단 패딩 `pt-4` 추가 (line 282)
- `src/lib/cities.ts` (커밋 e41b565)
  - `getOverseasCitiesByRegion()` 헬퍼 추가 (line 527-553)
  - `REGION_MAP` (국가→지역 매핑) + `REGION_ORDER` (표시 순서) 상수 추가

### Roadmap 업데이트 (v1.2 → v1.3)
- `product/roadmap.md` (커밋 전 — 스테이징 필요)
  - Done: SEO 페이지 33→57개, JSON-LD/ISR 명시, CitySearchModal UX 추가
  - Now: 국내 여행지 ✅ Done, 해외 여행지 ✅ Done, AI 점수 메시지 ✅ Done
  - Next: "해외 여행지 날씨" 제거 (이미 완료)

## 2. Current State

```
Branch: main
Latest commit: e41b565 "overseas ui update"
Uncommitted: product/roadmap.md (v1.3 업데이트)
Build: 성공 (73개 정적 페이지)
Lint: 통과
```

## 3. Pending Task: AI 스타일링 팁

### 목표
옷차림 카드 하단에 AI 생성 스타일링 팁 1줄 추가.
기존 룰베이스 alert 아래에 표시.

### 설계 결정 (이번 세션에서 확정)

**옷차림 아이템(카테고리별)**: 룰베이스 유지
- 온도→아이템 매핑은 lookup table 문제, AI가 더 잘할 수 없음
- 할루시네이션 위험, 비용, 지연 없이 정확한 추천 가능

**Alert 메시지(일교차/미세먼지/체감온도)**: 룰베이스 유지
- 사실 전달 목적, 이미 시간대별 겉옷 비교 로직 구현됨

**스타일링 팁**: AI로 추가 (NEW)
- 여러 조건(기온+날씨+미세먼지+바람)을 자연어로 합성하는 건 AI가 룰베이스보다 나음
- 예: "울 니트에 머플러 포인트로 따뜻하고 세련되게!"
- 예: "비 오는 날, 고어텍스에 첼시부츠 조합이면 멋스러워요"

### 재사용할 기존 인프라

AI 점수 메시지와 동일한 패턴 복제:

| 레이어 | 기존 (점수 메시지) | 새로 만들 것 (스타일링 팁) |
|--------|-------------------|--------------------------|
| 프롬프트 | `src/lib/prompts/score-message.ts` | `src/lib/prompts/styling-tip.ts` |
| 서비스 | `src/lib/ai-message.ts` | `src/lib/ai-styling-tip.ts` |
| API Route | `src/app/api/ai-message/route.ts` | `src/app/api/ai-styling-tip/route.ts` |
| 클라이언트 훅 | `src/lib/useAIMessage.ts` | `src/lib/useAIStylingTip.ts` |
| UI | `src/components/ScoreGauge.tsx` | `src/components/OutfitCard.tsx` (수정) |

### 기존 AI 인프라 상세

**캐시 전략** (`src/lib/ai-message.ts`):
- 서버 메모리 캐시: 10점 단위 버킷 + 레벨 + 날씨 + PM2.5 등급 → 캐시 키
- TTL: 5분 (`CACHE.TTL` = 300,000ms, `src/lib/constants.ts:302`)
- 최대 50개 엔트리, LRU 방식
- 클라이언트: SWR `dedupingInterval`로 5분간 중복 요청 방지

**프롬프트 패턴** (`src/lib/prompts/score-message.ts`):
- System prompt: XML 태그로 구조화 (`<role>`, `<rules>`, `<output_format>`, `<examples>`)
- User prompt: `<weather_data>` + `<score_breakdown>` 태그로 데이터 전달
- Few-shot 3개 예시 포함
- JSON output format (`{ "message": "..." }`)
- 한국어 30자 이내 제약
- gpt-4o-mini, temperature 0.3, max_tokens 100

**OutfitCard UI** (`src/components/OutfitCard.tsx`):
- `outfit.alerts[]`를 하단에 ⚠️ 아이콘과 함께 표시 (line 68-77)
- 스타일링 팁은 alerts 아래에 별도 섹션으로 추가하면 됨
- 글래스모피즘 스타일: `bg-white/15 backdrop-blur-md border-white/20`

**스타일링 팁 프롬프트에 필요한 입력 데이터:**
- `outfit.categories` (현재 추천된 아이템 목록) — 이걸 기반으로 스타일링 제안
- `temperature`, `feelsLike`, `weatherMain`, `pm25`
- `outfit.alerts` (일교차/미세먼지/체감온도 경고)

### 참고할 코드 위치
- AI 점수 메시지 프롬프트: `src/lib/prompts/score-message.ts` (전체)
- AI 서비스 + 캐시: `src/lib/ai-message.ts` (전체)
- API Route: `src/app/api/ai-message/route.ts` (전체)
- 클라이언트 훅: `src/lib/useAIMessage.ts` (전체)
- 옷차림 로직: `src/lib/outfit.ts` (전체)
- 옷차림 UI: `src/components/OutfitCard.tsx` (전체, 특히 line 68-77 alerts 영역)
- 캐시 상수: `src/lib/constants.ts:301-303`

## 4. Key Decisions

| 결정 | 이유 |
|------|------|
| 옷차림 아이템은 룰베이스 유지 | lookup table 문제, AI 할루시네이션 위험, 비용/지연 불필요 |
| Alert 메시지도 룰베이스 유지 | 사실 전달 목적, 이미 시간대별 겉옷 비교 로직 동작 중 |
| AI는 스타일링 팁 1줄만 추가 | 다중 조건 합성은 AI가 우위, 기존 인프라 재사용으로 구현비용 최소 |
| AI 스타일링 팁을 시간대별 옷차림/공유보다 우선 | 평가 점수 7/10 vs 6/10, Now(Q1)에 이미 배치, 인프라 재사용 가능 |

## 5. Blockers / Issues Found

없음. 빌드/린트 모두 통과.

## 6. Context for Next Session

### 바로 시작할 수 있는 프롬프트
```
HANDOFF.md를 읽어줘.

AI 스타일링 팁 기능을 구현해줘.

목표: OutfitCard 하단에 AI 생성 스타일링 팁 1줄 추가.

구현 방법:
1. src/lib/prompts/styling-tip.ts — 프롬프트 템플릿 (score-message.ts 패턴 복제)
   - 입력: 추천된 옷 아이템 목록 + 날씨 데이터
   - 출력: 스타일링 팁 한 문장 (JSON)
2. src/lib/ai-styling-tip.ts — 서비스 (ai-message.ts 패턴 복제, 캐시 포함)
3. src/app/api/ai-styling-tip/route.ts — API Route
4. src/lib/useAIStylingTip.ts — 클라이언트 훅 (SWR)
5. src/components/OutfitCard.tsx — alerts 아래에 스타일링 팁 표시
6. 기존 룰베이스 옷차림/alert은 변경하지 않음
```
