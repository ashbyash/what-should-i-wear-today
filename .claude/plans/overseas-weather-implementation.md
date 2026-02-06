# Implementation Plan: 해외 여행지 날씨 옷차림

## Summary
Open-Meteo API로 해외 14개 도시 날씨 데이터 연동. 기존 [city] 라우트 공유, 한국 기능 변경 없음.

## Confirmed Decisions

| 항목 | 결정 | 근거 |
|------|------|------|
| 위치 표시명 | CityData에서 직접 ("오사카, 일본") | Kakao API 해외 미지원. 추가 API 불필요 |
| 습도 스코링 | OVERSEAS_HUMIDITY_RANGES 통합 구간 (ideal 40-65%) | 열대 지역은 한국식 계절 구분 무의미 |
| 검색 모달 | 국내/해외 섹션 분리 + 국가별 그룹핑 | 해외 인기 도시 2-3개 빠른 선택 추가 |
| API 라우트 | createApiHandler에 overseasFetcher 옵션 추가 | 기존 DRY 패턴 유지 |

---

## Layer 1: Foundation (병렬 가능)

### Step 1: `src/lib/open-meteo-api.ts` (신규)

**목적**: Open-Meteo API 어댑터. InitialWeatherData 동일 형식 반환.

**핵심 함수**:
- `fetchOpenMeteoWeather(lat, lon)` → `InitialWeatherData` (메인 진입점)
- `fetchOpenMeteoCurrent(lat, lon)` → current weather
- `fetchOpenMeteoForecast(lat, lon)` → min/max temp
- `fetchOpenMeteoAirQuality(lat, lon)` → PM2.5/PM10
- `fetchOpenMeteoUV(lat, lon)` → UV index

**데이터 매핑**:
- `weather_code` → "Clear" / "Cloudy" / "Rain" / "Snow" (WMO 코드 변환)
- `temperature_2m` → temperature (°C)
- `pm2_5`, `pm10` → AirKorea format (grade 자체 계산)
- `uv_index` → level (low/moderate/high/very_high/danger)

**Open-Meteo endpoints**:
```
Current: /forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code
Forecast: /forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto
AirQuality: https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm2_5,pm10
UV: /forecast?latitude={lat}&longitude={lon}&current=uv_index
```

**에러 처리**: 개별 API 실패 시 해당 섹션 null (Promise.allSettled 패턴)
**타임아웃**: 5초/요청

**검증**: 도쿄 좌표로 호출 → InitialWeatherData shape 일치 확인

---

### Step 2: `src/lib/cities.ts` (수정)

**변경 사항**:
1. CityData 인터페이스 확장:
   - `isOverseas?: boolean`
   - `country?: string` (e.g., "일본")
   - `koppen?: string` (e.g., "Cfa", future use)

2. CITIES 배열에 해외 14개 도시 추가 (기존 41개 아래에)

3. 헬퍼 함수 추가:
   - `isKoreaCoordinates(lat, lon)` → boolean (33-39°N, 124-132°E)
   - `getOverseasCities()` → CityData[]
   - `getDomesticCities()` → CityData[]

**해외 도시 데이터**:
| slug | name | country | lat, lon | koppen |
|------|------|---------|----------|--------|
| osaka | 오사카 | 일본 | 34.69, 135.50 | Cfa |
| tokyo | 도쿄 | 일본 | 35.68, 139.65 | Cfa |
| fukuoka | 후쿠오카 | 일본 | 33.59, 130.40 | Cfa |
| kyoto | 교토 | 일본 | 35.01, 135.77 | Cfa |
| sapporo | 삿포로 | 일본 | 43.06, 141.35 | Dfa |
| bangkok | 방콕 | 태국 | 13.76, 100.50 | Aw |
| danang | 다낭 | 베트남 | 16.05, 108.21 | Am |
| ho-chi-minh | 호치민 | 베트남 | 10.82, 106.63 | Aw |
| cebu | 세부 | 필리핀 | 10.32, 123.89 | Af |
| bali | 발리 | 인도네시아 | -8.34, 115.09 | Am |
| taipei | 타이베이 | 대만 | 25.03, 121.57 | Cfa |
| singapore | 싱가포르 | 싱가포르 | 1.35, 103.82 | Af |
| guam | 괌 | 괌 | 13.44, 144.79 | Af |
| honolulu | 호놀룰루 | 미국 | 21.31, -157.86 | Aw |

**검증**: `getCityBySlug('osaka')?.isOverseas === true`, `isKoreaCoordinates(34.69, 135.50) === false`

---

### Step 3: `src/lib/constants.ts` + `src/types/score.ts` (수정)

**constants.ts 추가**:
```
OVERSEAS_TEMP_RANGES:
  ideal: 10-25℃ (65점)
  good: 3-9℃ / 26-30℃ (47점)
  caution: -3~2℃ / 31-35℃ (24점)
  danger: -4℃↓ / 36℃↑ (0점)

OVERSEAS_HUMIDITY_RANGES:
  ideal: 40-65% (5점)
  good: 30-75% (3점)
  else: (1점)
```

**score.ts 추가**:
- `ScoreInput.isOverseas?: boolean`

---

## Layer 2: Integration (순차)

### Step 4: `src/lib/server-weather.ts` (수정)

**변경**: `fetchInitialWeatherData(lat, lon)` 상단에 분기 추가
- `!isKoreaCoordinates(lat, lon)` → `fetchOpenMeteoWeather(lat, lon)` 호출
- Korea → 기존 KMA/AirKorea/Kakao 로직 그대로

**핵심**: 함수 시그니처 변경 없음. 내부 분기만 추가.

**검증**: 오사카 좌표 → Open-Meteo 경로, 서울 좌표 → KMA 경로

---

### Step 5: `src/lib/score.ts` (수정)

**변경할 함수 3개**:
1. `calcFeelsLikeTempScore(feelsLike, season, isOverseas)`
   - isOverseas=true → OVERSEAS_TEMP_RANGES 사용 (계절 무시)
   - isOverseas=false → 기존 SEASON_TEMP_RANGES[season] 사용

2. `calcHumidityScore(humidity, season, isOverseas)`
   - isOverseas=true → OVERSEAS_HUMIDITY_RANGES 사용
   - isOverseas=false → 기존 SEASON_HUMIDITY_RANGES[season] 사용

3. `calculateOutingScore(input)`
   - `input.isOverseas`를 두 함수에 전달

**검증**: 방콕 30℃ + isOverseas=true → 양호 47점 (기존 winter 모드면 0점)

---

### Step 6: API Routes (수정 5개)

**api-handler.ts 확장**:
- `ApiHandlerOptions`에 `overseasFetcher?: (lat, lon) => Promise<T>` 추가
- handler 내부에서 `isKoreaCoordinates` 체크 후 분기

**적용 대상**:
| 라우트 | overseasFetcher |
|--------|----------------|
| /api/weather-current | fetchOpenMeteoCurrent |
| /api/weather-forecast | fetchOpenMeteoForecast |
| /api/air-quality | fetchOpenMeteoAirQuality |
| /api/uv | fetchOpenMeteoUV |
| /api/location | 해외: `{ address: city.name, region1: city.country }` 반환 |

**air-quality/route.ts**: 커스텀 핸들러이므로 직접 분기 추가

---

## Layer 3: UI + SEO (병렬 가능)

### Step 7: `src/app/[city]/page.tsx` (수정)

**generateMetadata()**: 해외 도시 차별화
- title: 동일 (`${city.name} 날씨 옷차림`)
- description: "여행 날씨" vs "오늘 날씨"
- keywords: 해외는 `${country} 여행`, `${country} 날씨` 추가

**JSON-LD**: 해외 도시에 `addressCountry` 추가

---

### Step 8: `src/components/CityWeatherPage.tsx` (수정)

**locationName**: `city.isOverseas ? "${city.name}, ${city.country}" : formatLocation(...)`

**score 계산**: `isOverseas: city.isOverseas` 전달

---

### Step 9: `src/app/sitemap.ts` (변경 없음)

CITIES 배열 사용하므로 자동 포함. 검증만.

---

### Step 10: `src/components/CitySearchModal.tsx` (수정)

**검색 없을 때**: 국내/해외 섹션 분리
- "국내 도시 (41)" 섹션
- "해외 여행지 (14)" 섹션 + 국가별 그룹핑

**검색 있을 때**: 기존 통합 결과 유지

**빠른 선택**: 해외 인기 도시 추가 (오사카, 방콕 등)

---

## File Change Summary

### 신규 (1)
| 파일 | 예상 LOC |
|------|----------|
| src/lib/open-meteo-api.ts | ~250 |

### 수정 (10)
| 파일 | 변경 규모 |
|------|----------|
| src/lib/cities.ts | CityData 확장 + 14개 도시 + 3개 헬퍼 |
| src/lib/constants.ts | OVERSEAS_TEMP_RANGES, OVERSEAS_HUMIDITY_RANGES 추가 |
| src/types/score.ts | ScoreInput.isOverseas 1줄 추가 |
| src/lib/server-weather.ts | 분기 로직 10줄 추가 |
| src/lib/score.ts | 3개 함수에 isOverseas 파라미터 추가 |
| src/lib/api-handler.ts | overseasFetcher 옵션 + 분기 로직 |
| src/app/[city]/page.tsx | 메타데이터 분기 |
| src/components/CityWeatherPage.tsx | locationName + isOverseas 전달 (2줄) |
| src/components/CitySearchModal.tsx | 섹션 분리 (가장 큰 UI 변경) |
| API routes (4개) | overseasFetcher 연결 |

### 변경 없음
- kma-api.ts, airkorea-api.ts, kakao-api.ts
- outfit.ts (기온 기반, 해외에도 동작)
- useWeatherData.ts (동일 API 엔드포인트)
- sitemap.ts (자동)

---

## Verification

```bash
# 1. 빌드 확인 (55개 페이지 SSG)
npm run build

# 2. 해외 페이지 접속 테스트
# /osaka, /bangkok 접속 → 날씨 데이터 + 스코어 표시 확인

# 3. 기존 한국 페이지 정상 확인
# /seoul 접속 → 기존 동작 그대로

# 4. 검색 모달 확인
# 모달 열기 → 국내/해외 섹션 분리 확인
# "도쿄" 검색 → 통합 결과에서 노출 확인
```

---

## Implementation Order

```
Step 1 (open-meteo-api.ts) ─┐
Step 2 (cities.ts)          ├─ Layer 1 (병렬)
Step 3 (constants + types)  ─┘
         │
Step 4 (server-weather.ts) ─┐
Step 5 (score.ts)           ├─ Layer 2 (순차)
Step 6 (API routes)        ─┘
         │
Step 7 (page.tsx metadata)  ─┐
Step 8 (CityWeatherPage)    ├─ Layer 3 (병렬)
Step 9 (sitemap verify)     │
Step 10 (CitySearchModal)  ─┘
         │
     npm run build → 검증
```
