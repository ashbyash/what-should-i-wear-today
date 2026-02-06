# Handoff: 해외 여행지 날씨 옷차림 — 구현 완료

## 1. Completed Work

### 해외 날씨 기능 전체 구현 (Layer 1-3 완료)

**신규 파일 (1개):**
- `src/lib/open-meteo-api.ts` (217줄) — Open-Meteo API 어댑터. WMO 코드 매핑, km/h→m/s 풍속 변환, PM2.5/PM10 등급 계산, UV 레벨 계산. `InitialWeatherData` 호환 shape 반환.

**수정 파일 (15개):**

| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/cities.ts` | CityData에 `isOverseas?`, `country?` 추가. 해외 14개 도시 데이터. `isKoreaCoordinates()`, `getOverseasCities()`, `getDomesticCities()` 헬퍼 |
| `src/lib/constants.ts` | `OVERSEAS_TEMP_RANGES` (ideal 10-25℃), `OVERSEAS_HUMIDITY_RANGES` (ideal 40-65%) 추가 |
| `src/types/score.ts` | `ScoreInput`에 `isOverseas?: boolean` 추가 |
| `src/lib/server-weather.ts` | `fetchInitialWeatherData`에 `isKoreaCoordinates` 분기 → 해외면 `fetchOpenMeteoWeather` 호출 |
| `src/lib/score.ts` | `calcFeelsLikeTempScore`, `calcHumidityScore`에 `isOverseas` 파라미터. 해외면 OVERSEAS 상수 사용 |
| `src/lib/api-handler.ts` | `ApiHandlerOptions`에 `overseasFetcher` 옵션. 핸들러 내부에서 좌표 판별 후 자동 분기 |
| `src/app/api/weather-current/route.ts` | `overseasFetcher: fetchOpenMeteoCurrent` 추가 |
| `src/app/api/weather-forecast/route.ts` | `overseasFetcher: fetchOpenMeteoForecast` 추가 |
| `src/app/api/uv/route.ts` | `overseasFetcher: fetchOpenMeteoUV` 추가 |
| `src/app/api/air-quality/route.ts` | 해외 분기: `fetchOpenMeteoAirQuality` 호출 |
| `src/app/api/location/route.ts` | 해외 좌표 → CITIES에서 매칭, `{name}, {country}` 반환. 한국 → 기존 Kakao API |
| `src/app/[city]/page.tsx` | 해외 메타데이터 (여행 키워드, country 키워드), JSON-LD에 `addressCountry` |
| `src/components/CityWeatherPage.tsx` | 해외 `locationName` (`city.name, city.country`), `isOverseas` 스코어 전달 |
| `src/components/CitySearchModal.tsx` | 국내/해외 섹션 분리, 국가별 그룹핑, 빠른 선택에 해외 도시 추가 |
| `src/lib/geolocation.ts` | high accuracy 실패 시 low accuracy 폴백 (데스크탑 Mac GPS 미지원 대응) |

### 해외 14개 도시

| 지역 | 도시 |
|------|------|
| 일본 | 오사카, 도쿄, 후쿠오카, 교토, 삿포로 |
| 동남아 | 방콕, 다낭, 호치민, 세부, 발리 |
| 기타 | 타이베이, 싱가포르, 괌, 호놀룰루 |

### 검증 결과
- `npm run build` 성공: 73개 정적 페이지 (57개 도시 = 43 국내 + 14 해외)
- 로컬 테스트: `/osaka`, `/bangkok`, `/seoul` 정상 렌더링 확인
- 사용자 확인: 오사카 페이지에서 실제 날씨 데이터 표시 (11℃, 72점 등)

---

## 2. Current State

```
브랜치: main
상태: 16개 파일 수정 + 1개 신규 (커밋 전)
  Modified (not staged):
    HANDOFF.md, src/app/[city]/page.tsx, src/app/api/air-quality/route.ts,
    src/app/api/location/route.ts, src/app/api/uv/route.ts,
    src/app/api/weather-current/route.ts, src/app/api/weather-forecast/route.ts,
    src/components/CitySearchModal.tsx, src/components/CityWeatherPage.tsx,
    src/lib/api-handler.ts, src/lib/cities.ts, src/lib/constants.ts,
    src/lib/geolocation.ts, src/lib/score.ts, src/lib/server-weather.ts,
    src/types/score.ts
  Untracked:
    .claude/plans/
    src/lib/open-meteo-api.ts
diff stat: 656 insertions(+), 233 deletions(-)
최근 커밋: ba327aa eval update
빌드: 성공
```

---

## 3. Pending Tasks

- **커밋**: 해외 날씨 기능 + geolocation 폴백 수정 (아직 커밋 안 됨)
- **배포**: Vercel에 배포하여 HTTPS 환경에서 geolocation 정상 동작 확인
- **Geolocation 폴백 검증**: 사용자가 브라우저에서 테스트 필요 (high→low accuracy 폴백)

---

## 4. Key Decisions Made

| 결정 | 이유 |
|------|------|
| Open-Meteo API (무료, API 키 불필요) | 해외 날씨 데이터 제공. 비용 $0 유지 |
| `isKoreaCoordinates()` 좌표 기반 분기 | 33-39°N, 124-132°E → 한국, 나머지 → Open-Meteo |
| 위치명은 CityData에서 직접 사용 | Kakao API가 해외 미지원. 별도 geocoding API 불필요 |
| OVERSEAS_TEMP_RANGES (ideal 10-25℃) | 해외 여행자 관점. 한국 계절별 기준과 분리 |
| OVERSEAS_HUMIDITY_RANGES (통합 구간) | 열대 지역은 한국식 계절 구분 무의미 |
| `createApiHandler`에 `overseasFetcher` 옵션 | 기존 DRY 패턴 유지. 각 라우트에 if/else 분기 안 씀 |
| 풍속 km/h→m/s 변환 | Open-Meteo는 km/h 반환, 앱은 m/s 기준 |
| geolocation high→low accuracy 폴백 | Mac 데스크탑에 GPS 없음. `enableHighAccuracy: true` 실패 시 Wi-Fi 위치로 재시도 |

---

## 5. Blockers / Issues Found

### 해결됨
- **풍속 단위 불일치**: Open-Meteo km/h → 앱 m/s. `open-meteo-api.ts`에서 `/3.6` 변환 적용
- **webpack 캐시 에러**: `Cannot find module './vendor-chunks/motion-dom.js'`. `rm -rf .next` 후 해결
- **Geolocation POSITION_UNAVAILABLE**: `enableHighAccuracy: true` → low accuracy 폴백 추가

### 미해결 (기존 이슈)
- `src/lib/__tests__/outfit.test.ts` 3건 실패 (비즈니스 로직 변경 후 테스트 미갱신, 이번 작업과 무관)

---

## 6. Context for Next Session

### 커밋 대상 파일
- 신규: `src/lib/open-meteo-api.ts`
- 수정: 위 15개 파일 전부
- `.claude/plans/` 디렉토리는 커밋 불필요 (구현 완료됨)

### 핵심 아키텍처 포인트
- 한국/해외 분기: `isKoreaCoordinates(lat, lon)` → server-weather.ts, api-handler.ts, api/location에서 사용
- Open-Meteo 응답은 `InitialWeatherData` shape로 변환 → 기존 컴포넌트 타입 변경 없음
- CitySearchModal: 검색어 없으면 국내/해외 섹션 분리 표시, 검색어 있으면 통합 검색

### 실행 명령어
```bash
npm run dev          # 개발 서버
npm run build        # 빌드 (73개 페이지 SSG)
npm run test         # 유닛 테스트
```

---

## 다음 세션 시작 프롬프트

```
해외 여행지 날씨 기능이 구현되어 있습니다 (커밋 전).
HANDOFF.md를 읽고 현재 상태를 확인해주세요.

할 일:
1. 변경 사항 커밋 + 배포
2. 배포 후 HTTPS 환경에서 해외 도시 페이지 검증 (/osaka, /bangkok 등)
3. Geolocation 폴백이 프로덕션에서 정상 동작하는지 확인
```
