# Handoff: 시간별 예보 UX 개선 구현 예정

## 1. Completed Work (이번 세션)

### 시간별 예보 기능 전체 구현 (이전 세션, 미커밋)
- 14개 파일 수정/신규 (상세: `.claude/plans/quiet-nibbling-crescent.md` 참고)
- 브라우저 테스트 완료 (/, /seoul, /osaka) — 이상 없음
- **아직 커밋하지 않음**

### 시간별 예보 UX 개선 플래닝 완료 (이번 세션)
4가지 UX 개선에 대한 상세 구현 플랜 작성 완료:
1. CityWeatherPage 카드 레이아웃 변경 (page.tsx와 동일)
2. 밤/낮/일출/일몰 시간대별 이모지 시스템
3. 날짜 경계(23:00→00:00) "내일"/"모레" 구분 표시
4. 강수확률(💧60%) 표시

**핵심 발견**: 해외 도시 타임존 이슈
- `getSunTimes()`가 KST 고정 → 해외 도시 시간 불일치
- 해결: `CityData`에 `utcOffset` 추가, `SunCalc.getTimes()` 직접 사용 후 UTC→현지 변환

**확정된 이모지 매핑**:
| 시간대 | Clear | Clouds | Rain/Snow/Thunder | Mist/Fog |
|--------|-------|--------|-------------------|----------|
| 낮 | ☀️ | ☁️ | 🌧️/❄️/⛈️ | ☁️ |
| 밤 | 🌙 | ☁️ | 🌧️/❄️/⛈️ | ☁️ |
| 일출/일몰 | 🌤️ | 🌤️ | 🌧️/❄️/⛈️ | ☁️ |

## 2. Current State

```
Branch: main
Latest commit: bce643c "card location update"
Uncommitted: 14개 파일 (시간별 예보 기능, 수정 11 + 신규 3)
Build: 성공
```

## 3. Next Session Tasks — Step 1~8 순서대로 구현

상세 플랜: `.claude/plans/quiet-nibbling-crescent.md`

| Step | 파일 | 작업 | 변경량 |
|------|------|------|--------|
| 1 | `src/types/weather.ts` | `HourlyForecastItem`에 `date?`, `precipitationProbability?` 추가 | +2줄 |
| 2 | `src/lib/cities.ts` | `CityData`에 `utcOffset?`, 해외 도시 12곳에 값 추가 | +15줄 |
| 3 | `src/lib/kma-api.ts` | `parseHourlyItems()`에 POP 카테고리 추출 + date 필드 | +8줄 |
| 4 | `src/lib/open-meteo-api.ts` | URL에 `precipitation_probability` 추가 + date 필드 | +5줄 |
| 5 | `src/lib/weather-utils.ts` | `getTimeCategoryForHour()` 신규 + `getWeatherEmoji()` 확장 | +50줄 |
| 6 | `src/components/WeatherCard.tsx` | `city?` prop 추가, 메인 이모지 시간대 반영 | +10줄 |
| 7 | `src/components/HourlyForecast.tsx` | 날짜 구분 칩, 강수확률, 시간대 이모지, 스켈레톤 | +40줄 |
| 8 | `src/components/CityWeatherPage.tsx` | 카드 순서 변경 + `city` prop 전달 | 순서변경 |

**의존성**: Step 1,2 → Step 3,4,5 → Step 6,7 → Step 8

## 4. Key Decisions Made

| 결정 | 이유 |
|------|------|
| `date`, `precipitationProbability` optional 유지 | 기존 ISR 캐시 데이터 하위 호환 |
| `utcOffset`을 CityData에 추가 | 해외 도시 일출/일몰 정확한 현지 시간 계산 |
| `SunCalc.getTimes()` 직접 사용 (theme.ts의 getSunTimes 미사용) | getSunTimes는 KST 고정, 해외 도시에서 UTC→현지 변환 필요 |
| page.tsx는 city prop 미전달 (undefined) | 메인은 geolocation 기반, 한국 사용자 → KST 기본 동작 충분 |
| 강수확률 0%일 때 숨김 | 깔끔한 UI, 필요할 때만 정보 표시 |
| Mist/Fog → ☁️ (구름 이모지) | 사각형 🌫️ 대신, 안개=낮은 구름으로 통일 |
| 일출/일몰 → 🌤️ | 사각형 🌅/🌇 대신, 둥근 이모지로 통일 |

## 5. 핵심 파일 맵

```
데이터 흐름 (현재):
kma-api.ts fetchKmaHourlyForecast() [TMP/SKY/PTY]
  → api/weather-hourly/route.ts
  → useWeatherData.ts (SWR)
  → WeatherCard.tsx → HourlyForecast.tsx

데이터 흐름 (변경 후):
kma-api.ts [+POP, +date] / open-meteo-api.ts [+precipitation_probability, +date]
  → api/weather-hourly/route.ts (변경 없음)
  → useWeatherData.ts (변경 없음, optional 필드 자동 통과)
  → WeatherCard.tsx [+city prop → getTimeCategoryForHour()]
  → HourlyForecast.tsx [+날짜 구분 칩, +강수확률, +시간대 이모지]

이모지 로직:
weather-utils.ts getTimeCategoryForHour(hour, lat, lon, utcOffset?)
  → SunCalc.getTimes() → UTC → 현지 시간 변환
  → sunrise/sunset ±30분 경계 → TimeCategory
  → getWeatherEmoji(weatherMain, timeCategory?) → 이모지
```

## 6. Context for Next Session

### 바로 시작할 수 있는 프롬프트
```
HANDOFF.md를 읽어줘.

이전 세션에서:
- 시간별 예보 기능 구현 완료 (미커밋, 14개 파일)
- 시간별 예보 UX 개선 상세 플랜 작성 완료

이번 세션에서 할 일:
1. 먼저 시간별 예보 기능을 커밋
2. 상세 플랜(.claude/plans/quiet-nibbling-crescent.md)에 따라 Step 1~8 순서대로 구현
   - Step 1: types/weather.ts — date, precipitationProbability 추가
   - Step 2: lib/cities.ts — utcOffset 추가
   - Step 3: lib/kma-api.ts — POP 추출 + date
   - Step 4: lib/open-meteo-api.ts — precipitation_probability + date
   - Step 5: lib/weather-utils.ts — getTimeCategoryForHour() + getWeatherEmoji() 확장
   - Step 6: components/WeatherCard.tsx — city prop + 메인 이모지 시간대
   - Step 7: components/HourlyForecast.tsx — 날짜 구분, 강수확률, 시간대 이모지
   - Step 8: components/CityWeatherPage.tsx — 카드 레이아웃 + city 전달
3. npm run build로 타입 체크
4. dev 서버에서 브라우저 테스트 (/, /seoul, /osaka, /bangkok)
5. 커밋

각 Step의 구체적인 코드 변경 사항은 플랜 파일에 모두 기술되어 있으니 참고해서 구현해줘.
```
