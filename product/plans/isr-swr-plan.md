# ISR + SWR 조합 구현 계획

## 목표
42개 도시 페이지에서 **즉시 로딩 + 실시간 데이터 갱신**을 동시에 달성

## 현재 → 변경 후

| 항목 | 현재 | 변경 후 |
|------|------|---------|
| 첫 화면 | 로딩 스피너 | 즉시 날씨 표시 |
| 데이터 fetch | 클라이언트만 | 서버(ISR) + 클라이언트(SWR) |
| ISR revalidate | 없음 | 10분 |

---

## 구현 단계

### Step 1: 서버용 데이터 fetch 함수 생성
**파일**: `src/lib/server-weather.ts` (신규)

서버 컴포넌트에서 호출할 통합 fetch 함수 생성:
```typescript
export async function fetchInitialWeatherData(lat: number, lon: number) {
  // 병렬로 5개 API 호출
  const [current, forecast, location, airQuality, uv] = await Promise.allSettled([
    fetchKmaCurrentWeather(lat, lon, apiKey),
    fetchKmaForecastWeather(lat, lon, apiKey),
    fetchLocation(lat, lon, kakaoKey),
    fetchAirKorea(lat, lon, airkoreaKey),
    fetchUVIndex(lat, lon, apiKey),
  ]);

  return { current, forecast, location, airQuality, uv };
}
```

### Step 2: [city]/page.tsx 수정
**파일**: `src/app/[city]/page.tsx`

```typescript
// ISR 설정 추가
export const revalidate = 600; // 10분

export default async function CityPage({ params }) {
  const city = getCityBySlug(params.city);

  // 서버에서 초기 데이터 fetch (ISR 시점)
  const initialData = await fetchInitialWeatherData(city.lat, city.lon);

  return <CityWeatherPage city={city} initialData={initialData} />;
}
```

### Step 3: useWeatherData 훅 수정
**파일**: `src/lib/useWeatherData.ts`

initialData(fallbackData) 지원 추가:
```typescript
interface UseWeatherDataOptions {
  locationChanged?: boolean;
  initialData?: InitialWeatherData;  // 추가
}

// SWR에 fallbackData 적용
const { data: currentRaw } = useSWR(key, fetcher, {
  ...swrOptions,
  fallbackData: initialData?.current,  // ISR 데이터
  revalidateOnMount: true,             // 마운트 시 최신 데이터 fetch
});
```

### Step 4: CityWeatherPage 수정
**파일**: `src/components/CityWeatherPage.tsx`

initialData prop 추가 및 전달:
```typescript
interface CityWeatherPageProps {
  city: CityData;
  initialData?: InitialWeatherData;  // 추가
}

export default function CityWeatherPage({ city, initialData }) {
  const { weather, ... } = useWeatherData(coordinates, { initialData });
  // 나머지 로직 동일
}
```

### Step 5: 타입 정의
**파일**: `src/types/weather.ts`

```typescript
export interface InitialWeatherData {
  current: KmaCurrentData | null;
  forecast: KmaForecastData | null;
  location: LocationData | null;
  airQuality: AirKoreaData | null;
  uv: UVIndexData | null;
}
```

---

## 수정 파일 목록

| 파일 | 작업 |
|------|------|
| `src/lib/server-weather.ts` | 신규 생성 |
| `src/app/[city]/page.tsx` | ISR + 서버 fetch 추가 |
| `src/lib/useWeatherData.ts` | fallbackData 지원 추가 |
| `src/components/CityWeatherPage.tsx` | initialData prop 추가 |
| `src/types/weather.ts` | InitialWeatherData 타입 추가 |

---

## 검증 방법

1. **빌드 테스트**
   ```bash
   npm run build
   ```
   - 42개 도시 페이지가 정적 생성되는지 확인
   - 빌드 로그에서 API 호출 확인

2. **로컬 프로덕션 테스트**
   ```bash
   npm run start
   ```
   - `/seoul` 접속 → 로딩 없이 즉시 날씨 표시 확인
   - 네트워크 탭에서 SWR 재검증 요청 확인

3. **ISR 동작 확인**
   - 페이지 소스 보기 → HTML에 날씨 데이터 포함 확인
   - 10분 후 재방문 → 백그라운드 재생성 확인

---

## 예상 결과

**사용자 체감:**
- 도시 페이지 접속 시 로딩 스피너 없이 즉시 날씨 표시
- 1-2초 후 최신 데이터로 자동 업데이트 (변화 있을 경우)

**SEO:**
- HTML에 날씨 데이터 포함 → 크롤러가 컨텐츠 인식 가능

**비용:**
- Vercel 무료 티어 내 유지
