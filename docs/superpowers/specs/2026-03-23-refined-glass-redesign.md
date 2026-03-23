# Refined Glass 리디자인

## 개요

"오늘 뭐 입지" 날씨 앱의 비주얼 리디자인. 기존 시간대별 그라데이션 정체성을 유지하면서 UI를 모던하게 개선하고 가독성을 높이는 것이 목표. 기능 변경 없이 비주얼 리프레시 + 레이아웃 개선에 집중.

## 디자인 방향

**Refined Glass** — 현재 글래스 모피즘의 진화형. 더 얇은 글래스 레이어, 더 나은 타이포그래피 위계, 더 넉넉한 여백. iOS Weather, Linear에서 영감.

### 변경 사항
- Hero Card: 온도 + 점수 + 위치를 하나의 카드로 통합
- Conditions Row: DustCard + UvCard + 습도를 컴팩트 뱃지로 통합
- 카드 순서: Hero → Outfit → Hourly → Conditions (중요도 순)
- 데스크탑 레이아웃: Outfit | Hourly 2열 배치
- Border-radius: 2단계 체계로 통일 (18px / 12px)
- 간격: 카드 gap (12px → 16px), padding (16px → 20px)
- 애니메이션: damping 미세 조정 (15 → 20)으로 부드러운 느낌

### 유지 사항
- 시간대별 그라데이션 배경 (새벽/아침/낮/저녁/밤)
- 그라데이션 색상 변경 없음
- Pretendard Variable 폰트
- 이모지 아이콘
- Framer Motion 스프링 애니메이션
- 다크모드 없음 (시간대 그라데이션이 테마 역할)

## 디자인 토큰

### 글래스

| 토큰 | 값 |
|------|-----|
| 외부 카드 배경 | `rgba(255,255,255,0.15)` |
| 외부 카드 테두리 | `1px solid rgba(255,255,255,0.2)` |
| 외부 카드 라운딩 | `rounded-[18px]` |
| 외부 카드 패딩 | `p-5` (20px) |
| 내부 요소 배경 | `rgba(255,255,255,0.1)` |
| 내부 요소 테두리 | `1px solid rgba(255,255,255,0.15)` |
| 내부 요소 라운딩 | `rounded-xl` (12px) |
| 배경 블러 | `blur(20px)` |
| 카드 간격 | `gap-4` (16px) |

### 밝은 배경 조정

밝음/어두움은 `src/lib/theme.ts`의 `ThemeConfig`에 있는 기존 `isLight` boolean으로 판단. 현재 밝음: 새벽, 아침, 저녁. 어두움: 낮, 밤. `isLight`가 true일 때 대비를 위해 글래스 투명도를 높임:

| 토큰 | 밝은 배경 값 |
|------|-------------|
| 외부 카드 배경 | `rgba(255,255,255,0.25)` |
| 외부 카드 테두리 | `1px solid rgba(255,255,255,0.35)` |
| 내부 요소 배경 | `rgba(255,255,255,0.2)` |
| 내부 요소 테두리 | `1px solid rgba(255,255,255,0.3)` |

### 텍스트 색상

| 역할 | 어두운 배경 (낮, 밤) | 밝은 배경 (새벽, 아침, 저녁) |
|------|---------------------|---------------------------|
| 주요 | `rgba(255,255,255,0.95)` | `rgba(30,30,50,0.85)` |
| 보조 | `rgba(255,255,255,0.8)` | `rgba(30,30,50,0.7)` |
| 흐림 | `rgba(255,255,255,0.45)` | `rgba(30,30,50,0.4)` |

### 애니메이션

| 속성 | 값 |
|------|-----|
| 타입 | Spring |
| Stiffness | 100 |
| Damping | 20 (기존 15) |
| Mass | 1 (기본값) |
| 카드 간 지연 | 0.1초, 위에서 아래로 |

## 레이아웃

### 카드 순서 (위에서 아래)

1. **Hero Card** — 위치, 온도, 날씨 이모지, 체감온도, 점수
2. **Outfit Card** — 옷 추천 (카테고리별 이모지)
3. **Hourly Forecast** — 시간별 예보 (가로 스크롤)
4. **Conditions Row** — PM2.5 / 자외선 / 습도 컴팩트 뱃지
5. **Popular Cities** — 알약형 도시 바로가기
6. **Footer** — 문의하기 링크

### 반응형 브레이크포인트

**모바일 (< 768px)**: 싱글 컬럼, 모든 카드 전체 너비.

```
[ Hero Card                    ]
[ Outfit Card                  ]
[ Hourly Forecast              ]
[ Conditions Row               ]
[ Popular Cities               ]
[ Footer                       ]
```

**데스크탑 (>= 768px)**: 중간 섹션 2열 그리드.

```
[ Hero Card                    ]  ← 전체 너비
[ Outfit Card ] [ Hourly Forecast ]  ← 2열
[ Conditions Row               ]  ← 전체 너비
[ Popular Cities               ]
[ Footer                       ]
```

컨테이너: 기존 `max-w-3xl` (768px) 유지, 가운데 정렬. 데스크탑 2열 비율: 1fr 1fr (동일 너비).

## 컴포넌트 변경사항

### 신규: Hero Card

현재 LocationHeader + ScoreGauge + WeatherCard 일부를 통합.

구성:
- 위치명 (좌상단) — 탭하면 CitySearchModal 열림
- 업데이트 시간 (우상단) + 새로고침 버튼 (기존 reload 로직 유지)
- 큰 온도 표시 (좌측, font-weight: 200, ~56px)
- 날씨 이모지 + 상태 + 체감온도 (온도 아래)
- 점수 이모지 + 점수 숫자 (font-weight: 600, ~36px) + "SCORE" 라벨 (10px, 흐림, 대문자) (우측)
- AI 메시지 glass-inner 박스 (하단) — 기존 `useAIMessage` 훅 사용, 동일한 `weatherContext` props 수신 (temperature, feelsLike, weatherMain, pm25, humidity, windSpeed, uvIndex)

LocationHeader에서 가져오는 인터랙션 요소:
- 새로고침 버튼 (우상단, 업데이트 시간 옆)
- 캐시 경고 배너 (주황색, 캐시/오프라인 데이터 사용 시 표시)
- "현재 위치로 돌아가기" 버튼 (다른 도시 보는 중일 때 표시)
- 도시 검색 트리거 (위치명 탭)

점수 breakdown: 점수 영역 탭하면 기존 breakdown 패널 확장/축소 (5개 세부 점수 + 바람 감점). 기존 ScoreGauge와 동일한 데이터/로직 — 원형 SVG 게이지만 제거.

로딩 상태: glass-card 모양 스켈레톤, 깜빡이는 투명도. 위치 플레이스홀더 + 숫자 2개 플레이스홀더 (온도/점수) 표시.

### 수정: Outfit Card

기존과 동일한 내용, 스타일만 변경:
- 구조화된 행: 이모지 (24px) → 카테고리 라벨 (흐림) → 아이템명
- 카테고리: 겉옷 → 상의 → 하의 → 신발 → 액세서리
- 알림 섹션 유지 (비, 일교차, 마스크 경고)
- AI 스타일링 팁 유지

### 수정: Hourly Forecast

기존 WeatherCard 내부에 있던 것을 독립 카드로 분리:
- 가로 스크롤 glass-inner 아이템
- 각 아이템: 시간 → 날씨 이모지 → 온도
- 날짜별 그룹 헤더 유지 (오늘/내일)

### 신규: Conditions Row

기존 DustCard, UvCard 대체:
- 3개 컴팩트 glass-inner 뱃지를 한 줄로 배치
- 각 뱃지: 이모지 → 라벨 → 색상 코딩된 값
- PM2.5 (기존 `dustData.pm25`에서), 자외선 (기존 `uvData`에서), 습도 (기존 `weather.humidity`에서)
- 색상 코딩:
  - 초록 (`#4ade80`): PM2.5 좋음 (0-15), 자외선 낮음 (0-2), 습도 적정
  - 노랑 (`#fbbf24`): PM2.5 보통 (16-35), 자외선 보통 (3-5), 습도 경계
  - 빨강 (`#f87171`): PM2.5 나쁨 (36+), 자외선 높음 (6+), 습도 극단
- 로딩 상태: 3개 스켈레톤 뱃지, 깜빡이는 투명도

### WeatherCard → 삭제

현재 WeatherCard가 렌더링하는 것들: 날씨 이모지 애니메이션, 현재 기온, 체감온도, 최저/최고, 풍속, 습도, 시간별 예보. 이 데이터가 Hero Card (기온, 체감온도, 날씨 이모지), Hourly Forecast (독립), Conditions Row (습도)로 분산. WeatherCard 컴포넌트 삭제.

### 삭제 컴포넌트

- **ScoreGauge** (원형 SVG 게이지) — 점수 + breakdown이 Hero Card로 이동
- **DustCard** (전체 카드) — Conditions Row로 통합
- **UvCard** (전체 카드) — Conditions Row로 통합
- **WeatherCard** — 데이터가 Hero Card, Hourly Forecast, Conditions Row로 분산
- **AirQualityCard** — 현재 미사용 (page.tsx에서 import 안함), 정리 삭제
- **LocationHeader** — Hero Card에 흡수

### 리스타일 컴포넌트

- **PopularCities** — 동일 기능, glass-inner 알약형으로 리스타일 (`rounded-[20px]`). 새 글래스 토큰 시스템에 맞춰 prop 업데이트 필요할 수 있음.
- **Footer** — 동일 내용, 새 글래스 토큰에 맞춰 리스타일. 현재 layout.tsx의 `Providers` 래퍼 안에서 렌더링.

### 변경 없는 컴포넌트

- **CitySearchModal** — 이번 단계에서 비주얼 변경 없음
- **CityWeatherPage** — 동일한 새 컴포넌트 사용 (Hero, Outfit, Hourly, Conditions). 동일한 리디자인 적용 — 별도 작업이 아니라 같은 컴포넌트 교체.

## 영향받는 페이지

- `/` (홈) — 주요 리디자인 대상
- `/[city]` (도시 페이지) — 같은 컴포넌트, 같은 리디자인
- `/cities` (도시 목록) — 이번 단계 범위 밖

## 범위 밖

- 기능 변경 (새 데이터, 새 API 없음)
- 다크모드 토글
- 폰트 변경
- 아이콘 시스템 변경
- CitySearchModal 리디자인
- 도시 목록 페이지 리디자인
- 점수 계산 로직 변경

## 목업

인터랙티브 목업:
`.superpowers/brainstorm/75926-1774231599/final-design.html`

로컬 HTTP 서버로 열면 시간대 전환 가능한 폰 목업 확인 가능.
