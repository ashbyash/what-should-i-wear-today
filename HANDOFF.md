# Handoff: SEO 내부 링크 개선 구현 예정

## 1. Completed Work (이번 세션)

### SEO 인덱싱 상태 진단
- `site:ootd-by-weather.vercel.app` Google 검색으로 인덱싱 현황 확인
- **결과**: 58페이지 중 1개만 인덱싱 (홈페이지만, 커버리지 1.7%)
- `/seoul`, `/osaka` 등 도시 페이지 전부 미인덱싱 확인

### 원인 분석 (code-explorer 에이전트 사용)
- 기술적 SEO 요소(robots.txt, sitemap, meta, JSON-LD, SSR, canonical) 전부 정상
- **유일한 문제**: 도시 페이지로의 HTML `<a>` 링크가 0개
- `CitySearchModal`이 `router.push()` (JS)로만 내비게이션 → Google 크롤 불가

### 상세 구현 플랜 작성 완료
- feature-dev (기술 아키텍처) + frontend-design (UI/UX) 병렬 분석 수행
- 통합 플랜 파일: `.claude/plans/noble-discovering-owl.md`
- **8개 파일** 변경 계획 (신규 3 + 수정 5)

### 파일 변경 없음
- 이번 세션은 플래닝만 수행, 코드 변경 없음

## 2. Current State

```
Branch: main
Latest commit: addd27c "prediction update 2"
Uncommitted: 없음 (clean)
```

## 3. Pending Tasks — Step 1~8 순서대로 구현

상세 플랜: `.claude/plans/noble-discovering-owl.md`

| Step | 파일 | 타입 | 작업 |
|------|------|------|------|
| 1 | `src/lib/theme-colors.ts` | 신규 | `getThemeColors(isLight)` 공유 유틸 (CitySearchModal:106-117 추출) |
| 2 | `src/lib/cities.ts` | 수정 | `POPULAR_CITY_SLUGS` 10개 + `getDomesticCitiesByRegion()` |
| 3 | `src/components/PopularCities.tsx` | 신규 | `<Link>` 칩 컴포넌트 (glass card, 10개 도시 + "전체 도시 보기") |
| 4 | `src/app/page.tsx` | 수정 | 홈 카드 그리드 `</m.div>` 직후에 PopularCities 삽입 |
| 5 | `src/components/CityWeatherPage.tsx` | 수정 | 도시 페이지에 PopularCities 삽입 (currentCitySlug 전달) |
| 6 | `src/app/cities/page.tsx` | 신규 | 서버 컴포넌트, 57개 도시 지역별 그룹핑, 고정 day 그라데이션 |
| 7 | `src/app/sitemap.ts` | 수정 | `/cities` 항목 추가 (priority 0.9) |
| 8 | `src/components/CitySearchModal.tsx` | 수정 | `colors` → `getThemeColors()` 교체 |

**의존성**: Step 1,2 → Step 3 → Step 4,5 → Step 6,7,8 (병렬 가능)

## 4. Key Decisions Made

| 결정 | 이유 |
|------|------|
| Option B (인기 도시 섹션 + /cities 페이지) | 기존 UI 변경 최소화, /cities 자체가 SEO 키워드 확보 |
| 인기 도시 10개 (국내7+해외3) | 서울/부산/제주/인천/대구/대전/광주 + 오사카/도쿄/방콕 |
| /cities 고정 day 그라데이션 | 서버 컴포넌트라 useClientHour() 훅 사용 불가 |
| /cities 칩만 (description 없음) | CitySearchModal과 일관된 UI, 페이지 길이 최소화 |
| getThemeColors() 공유 유틸 추출 | CitySearchModal과 PopularCities 색상 로직 중복 방지 |
| PopularCities에 glass card wrapper | 기존 카드들과 시각적 일관성 유지 |
| 국내 지역: 수도권/충청권/영남권/호남권/강원·제주 | 표준 지리 구분, getOverseasCitiesByRegion() 패턴 따름 |

## 5. Blockers / Issues Found

- **Google Search Console 접근 불가**: `ootd-by-weather.vercel.app` 속성에 현재 로그인 계정 권한 없음. `site:` 검색으로 대체 확인함

## 6. Context for Next Session

### 핵심 참조 파일

```
플랜 파일 (전체 구현 사양):
  .claude/plans/noble-discovering-owl.md

기존 패턴 참조 (플랜에서 재사용할 코드):
  src/components/CitySearchModal.tsx:106-117  → getThemeColors() 원본
  src/components/CitySearchModal.tsx:464-476  → 칩 스타일 패턴
  src/components/CitySearchModal.tsx:283-319  → 섹션 헤더 + featured chips
  src/lib/cities.ts:543-568                   → getOverseasCitiesByRegion() 패턴
  src/components/OutfitCard.tsx:50            → glass card 패턴
  src/app/[city]/page.tsx:21-86              → generateMetadata 패턴
  src/app/[city]/page.tsx:88-118             → JSON-LD 패턴

수정 대상 위치:
  src/app/page.tsx:261                        → PopularCities 삽입 위치
  src/components/CityWeatherPage.tsx:233      → PopularCities 삽입 위치
```

### 바로 시작할 수 있는 프롬프트
```
HANDOFF.md를 읽어줘.

이전 세션에서:
- SEO 인덱싱 진단 완료 (58개 중 1개만 인덱싱, 원인: HTML 내부 링크 부재)
- feature-dev + frontend-design 병렬 분석으로 상세 구현 플랜 작성 완료

이번 세션에서 할 일:
1. 상세 플랜(.claude/plans/noble-discovering-owl.md)에 따라 Step 1~8 순서대로 구현
   - Step 1: lib/theme-colors.ts — getThemeColors() 공유 유틸 신규
   - Step 2: lib/cities.ts — POPULAR_CITY_SLUGS + getDomesticCitiesByRegion()
   - Step 3: components/PopularCities.tsx — <Link> 칩 컴포넌트 신규
   - Step 4: app/page.tsx — 홈에 PopularCities 삽입
   - Step 5: components/CityWeatherPage.tsx — 도시 페이지에 PopularCities 삽입
   - Step 6: app/cities/page.tsx — 전체 도시 디렉토리 서버 컴포넌트 신규
   - Step 7: app/sitemap.ts — /cities 항목 추가
   - Step 8: components/CitySearchModal.tsx — getThemeColors() 리팩토링
2. npm run build로 타입 체크
3. dev 서버에서 브라우저 테스트 (/, /seoul, /osaka, /cities)
4. View Page Source로 <a> 태그 존재 확인
5. 커밋

각 Step의 구체적인 코드 변경 사항은 플랜 파일에 모두 기술되어 있으니 참고해서 구현해줘.
```
