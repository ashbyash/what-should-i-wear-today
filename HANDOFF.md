# Handoff: CitySearchModal UX 개선 — 해외 여행지 발견성

## 1. Completed Work (이번 세션)

### PermissionGuide에 도시 검색 기능 추가
위치 권한 거부/실패 시 도시 페이지로 이동할 수 있는 우회 경로 구현.

**변경 파일:**
- `src/components/PermissionGuide.tsx`
  - `onSearchClick?: () => void` 콜백 prop 추가
  - "새로고침" + "도시 직접 검색" 버튼을 `flex flex-col` 컨테이너로 세로 배치, `w-full` 동일 너비
- `src/app/page.tsx`
  - `timeOfDay`를 별도 useMemo로 분리 (line 76)
  - `defaultTheme` (시간 기반 ThemeConfig) 계산 로직 추가 (line 82-93)
  - early return 블록에 `PermissionGuide`에 `onSearchClick` 전달 + `CitySearchModal` 렌더링 (line 104-119)
  - `theme` import 확장: `getSeason`, `TIME_TEXT_COLORS`, `SEASON_ACCENTS`, `type ThemeConfig` 추가 (line 25)

### 시도했으나 효과 없었던 것
- `geolocation.ts` 재시도 timeout을 10초→20초로 늘려봤으나 Safari에서도 여전히 TIMEOUT → 원복함

## 2. Current State

```
Branch: main
Status: clean (커밋/싱크 완료)
Latest commit: f410b32 "oversea update" (2026-02-06)
Build: 성공 (73개 정적 페이지)
Lint: 통과
```

## 3. Pending Task: CitySearchModal UX 개선

### 문제
해외 여행지(14개)가 국내 도시(43개) 아래에 묻혀서 스크롤 없이는 발견 불가.

### 채택된 디자인: Option 3 (빠른 선택 분리 + 국내 축소 + 해외 상향)

현재 구조:
```
[검색]
[내 현재 위치]
[빠른 선택: 제주|강릉|부산|오사카|방콕|도쿄]  ← 국내/해외 구분 없음
[국내 도시 43개 전체 목록]  ← 여기서 스크롤 매몰
[해외 여행지 14개]  ← 안 보임
```

목표 구조:
```
[검색]
[내 현재 위치]

국내 인기  [제주] [부산] [강릉]
해외 인기  [오사카] [방콕] [도쿄]

국내 도시 (43)
[8~10개만 표시] + [더 보기 버튼]

해외 여행지 (14)
일본     [오사카] [도쿄] [후쿠오카] [교토] [삿포로]
동남아   [방콕] [다낭] [호치민] [세부] [발리] [싱가포르]
기타     [타이베이] [괌] [호놀룰루]
```

### 변경 대상 파일
- `src/components/CitySearchModal.tsx` — 주요 리디자인
  - `FEATURED_SLUGS` (line 16-23) → `FEATURED_DOMESTIC` + `FEATURED_OVERSEAS`로 분리
  - 빠른 선택 섹션 (line 279-305) → 국내 인기 / 해외 인기 라벨 분리
  - 국내 도시 섹션 (line 370-416) → 8~10개만 표시 + 더 보기 접기/펼치기
  - 해외 섹션 (line 418-470) → 세로 목록 → 가로 칩 레이아웃 + 지역 그룹핑
- `src/lib/cities.ts` — 지역 그룹핑 헬퍼 함수 추가 필요할 수 있음
  - 현재 `getOverseasCities()`는 국가별 그룹핑만 지원
  - 지역별(일본/동남아/기타) 그룹핑 필요시 헬퍼 추가

### 검토했으나 기각된 대안
- **탭 UI (현재 위치 / 다른 지역)**: "현재 위치" 탭에 넣을 콘텐츠가 없고, 모달 내 탭은 모바일에서 무거움
- **아코디언 (접기/펼치기)**: 해외가 여전히 아래에 있어 발견성 개선 부족

## 4. Key Decisions

| 결정 | 이유 |
|------|------|
| PermissionGuide에 CitySearchModal 버튼 추가 (Option A) | 홈페이지는 좌표 없이 의미 있는 UI를 렌더링할 수 없으므로 early return 유지가 맞음 |
| 기존 `isSearchModalOpen` 상태 재사용 | early return과 main flow는 상호 배타적이라 충돌 없음, 별도 상태 불필요 |
| CitySearchModal에 `defaultTheme` 전달 | 모달의 DEFAULT_GRADIENT가 night(어두운 보라)인데 PermissionGuide 배경은 시간 기반 파란색이라 불일치 |
| 탭 UI 대신 Option 3 (섹션 분리) 채택 | "현재 위치" 탭에 넣을 콘텐츠 부재, 모달 내 탭은 모바일에서 과중 |

## 5. Blockers / Issues Found

### 로컬 Geolocation 실패 (M4 MacBook + macOS Sequoia)
- Chrome: `POSITION_UNAVAILABLE` ("위치 정보를 사용할 수 없습니다")
- Safari: `TIMEOUT` ("위치 요청 시간이 초과되었습니다")
- macOS 위치 서비스 허용됨 + Chrome 사이트 권한 허용됨 → 브라우저의 Wi-Fi 기반 위치 조회 자체가 실패
- 네이티브 날씨 앱은 정상 → macOS CoreLocation은 작동하나 브라우저 경유 시 실패
- **prod 모바일에서는 GPS 사용하므로 영향 없음** (실제 prod 스크린샷에서 서울 용산구 문배동 정상 표시 확인됨)
- timeout 증가(10s→20s)도 효과 없어서 원복함
- "도시 직접 검색" 버튼이 이 케이스의 우회 경로로 동작

## 6. Context for Next Session

### 바로 시작할 수 있는 프롬프트
```
HANDOFF.md를 읽어줘.

CitySearchModal.tsx의 UX를 개선해줘.

목표: 해외 여행지를 쉽게 발견할 수 있게.

변경 사항:
1. FEATURED_SLUGS를 FEATURED_DOMESTIC(제주/부산/강릉) + FEATURED_OVERSEAS(오사카/방콕/도쿄)로 분리, 각각 "국내 인기" / "해외 인기" 라벨 추가
2. 국내 도시 섹션: 8~10개만 기본 표시 + "더 보기" 버튼으로 나머지 펼치기
3. 해외 섹션: 세로 리스트 → 지역별(일본/동남아/기타) 가로 칩 레이아웃
4. 기존 검색 기능, 테마 시스템, framer-motion 애니메이션 유지
```

### 참고할 현재 코드 위치
- 빠른 선택: `CitySearchModal.tsx` line 15-23, 279-305
- 국내 도시 목록: `CitySearchModal.tsx` line 370-416
- 해외 도시 목록: `CitySearchModal.tsx` line 418-470
- 도시 데이터/그룹핑: `cities.ts` line 359-525
- 테마 색상 시스템: `CitySearchModal.tsx` line 104-123
