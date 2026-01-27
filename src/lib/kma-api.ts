/**
 * 기상청 API 연동
 * - 단기예보: 현재 기온, 습도, 풍속, 하늘상태
 * - 생활기상지수: 자외선지수
 * - AWS 매분자료: 실시간 관측값 (apihub.kma.go.kr)
 */

import { toGridCoordinate } from './coordinates';
import { fetchAwsStations, findNearestStation } from './weather-stations';

const KMA_FORECAST_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
const KMA_LIVING_URL = 'https://apis.data.go.kr/1360000/LivingWthrIdxServiceV4';
const KMA_APIHUB_AWS_URL = 'https://apihub.kma.go.kr/api/typ01/cgi-bin/url/nph-aws2_min';

// 서버 캐시 (격자 좌표 기반, TTL 10분)
const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10분
const weatherCache = new Map<string, { data: KmaWeatherData; timestamp: number }>();

// AWS 관측 캐시 (관측소 ID 기반, TTL 5분)
const AWS_CACHE_TTL = 5 * 60 * 1000; // 5분
const awsCache = new Map<string, { data: AwsObservation; timestamp: number }>();

function getCacheKey(nx: number, ny: number): string {
  return `${nx},${ny}`;
}

// AWS 관측 데이터
export interface AwsObservation {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  stnId: string;
  stnNm: string;
}

// 기상청 API 응답 타입
interface KmaApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body?: {
      items?: {
        item: KmaItem[];
      };
    };
  };
}

interface KmaItem {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate?: string;
  fcstTime?: string;
  fcstValue?: string;
  obsrValue?: string;
  nx: number;
  ny: number;
}

// 하늘상태 코드
type SkyCode = '1' | '3' | '4';
const SKY_MAP: Record<SkyCode, string> = {
  '1': 'Clear', // 맑음
  '3': 'Cloudy', // 구름많음
  '4': 'Overcast', // 흐림
};

const SKY_DESC_MAP: Record<SkyCode, string> = {
  '1': '맑음',
  '3': '구름많음',
  '4': '흐림',
};

// 강수형태 코드
type PtyCode = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
const PTY_MAP: Record<PtyCode, string> = {
  '0': '', // 없음
  '1': 'Rain', // 비
  '2': 'RainSnow', // 비/눈
  '3': 'Snow', // 눈
  '4': 'Shower', // 소나기
  '5': 'Drizzle', // 빗방울
  '6': 'DrizzleSnow', // 빗방울눈날림
  '7': 'SnowFlurry', // 눈날림
};

const PTY_DESC_MAP: Record<PtyCode, string> = {
  '0': '',
  '1': '비',
  '2': '비/눈',
  '3': '눈',
  '4': '소나기',
  '5': '빗방울',
  '6': '빗방울눈날림',
  '7': '눈날림',
};

// 초단기실황 데이터 (현재 날씨)
export interface KmaCurrentData {
  temperature: number; // 현재 기온
  humidity: number; // 습도
  windSpeed: number; // 풍속
  precipitation: string; // 강수형태 (Rain, Snow 등)
  precipitationDescription: string; // 강수형태 한글
}

// 단기예보 데이터 (오늘 예보)
export interface KmaForecastData {
  tempMin: number | null; // 최저기온
  tempMax: number | null; // 최고기온
  sky: string; // 하늘상태 (Clear, Cloudy, Overcast)
  skyDescription: string; // 하늘상태 한글
}

// 통합 데이터 (하위 호환)
export interface KmaWeatherData {
  temperature: number; // 현재 기온
  humidity: number; // 습도
  windSpeed: number; // 풍속
  sky: string; // 하늘상태 (Clear, Cloudy, Overcast)
  skyDescription: string; // 하늘상태 한글
  precipitation: string; // 강수형태
  precipitationDescription: string; // 강수형태 한글
  tempMin: number | null; // 최저기온
  tempMax: number | null; // 최고기온
}

/**
 * 발표 시간 계산 (초단기실황)
 * - 매시 정각에 생성, 10분 후 API 제공
 * - 정각~10분: 이전 시간 데이터 사용
 */
function getUltraSrtBaseTime(): { baseDate: string; baseTime: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  let hour = now.getHours();
  const minute = now.getMinutes();

  // 10분 이전이면 이전 시간 사용
  if (minute < 10) {
    hour -= 1;
    if (hour < 0) {
      hour = 23;
      // 날짜도 하루 전으로
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        baseDate: `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`,
        baseTime: '2300',
      };
    }
  }

  return {
    baseDate: `${year}${month}${day}`,
    baseTime: `${String(hour).padStart(2, '0')}00`,
  };
}

/**
 * 발표 시간 계산 (단기예보)
 * - 02, 05, 08, 11, 14, 17, 20, 23시 발표
 * - 발표 후 약 10분 후 API 제공
 */
function getVilageFcstBaseTime(): { baseDate: string; baseTime: string } {
  const now = new Date();
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];

  const hour = now.getHours();
  const minute = now.getMinutes();

  // 현재 시간보다 이전의 가장 가까운 발표 시간 찾기
  let baseHour = baseTimes[0];
  for (const bt of baseTimes) {
    if (hour > bt || (hour === bt && minute >= 10)) {
      baseHour = bt;
    }
  }

  // 02시 이전이면 전날 23시
  if (hour < 2 || (hour === 2 && minute < 10)) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      baseDate: `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`,
      baseTime: '2300',
    };
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return {
    baseDate: `${year}${month}${day}`,
    baseTime: `${String(baseHour).padStart(2, '0')}00`,
  };
}

/**
 * 초단기실황 조회
 */
async function fetchUltraSrtNcst(
  nx: number,
  ny: number,
  apiKey: string
): Promise<KmaItem[]> {
  const { baseDate, baseTime } = getUltraSrtBaseTime();

  const params = new URLSearchParams({
    serviceKey: apiKey,
    numOfRows: '10',
    pageNo: '1',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const url = `${KMA_FORECAST_URL}/getUltraSrtNcst?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`기상청 API 오류: ${response.status}`);
  }

  const data: KmaApiResponse = await response.json();

  if (data.response.header.resultCode !== '00') {
    throw new Error(`기상청 API 오류: ${data.response.header.resultMsg}`);
  }

  return data.response.body?.items?.item ?? [];
}

/**
 * 초단기실황 파싱
 */
function parseCurrentData(items: KmaItem[]): KmaCurrentData {
  let temperature = 0;
  let humidity = 0;
  let windSpeed = 0;
  let ptyCode: PtyCode = '0';

  for (const item of items) {
    const value = item.obsrValue ?? '0';
    switch (item.category) {
      case 'T1H':
        temperature = parseFloat(value);
        break;
      case 'REH':
        humidity = parseInt(value, 10);
        break;
      case 'WSD':
        windSpeed = parseFloat(value);
        break;
      case 'PTY':
        ptyCode = value as PtyCode;
        break;
    }
  }

  return {
    temperature: Math.round(temperature),
    humidity,
    windSpeed,
    precipitation: PTY_MAP[ptyCode] || '',
    precipitationDescription: PTY_DESC_MAP[ptyCode] || '',
  };
}

/**
 * 현재 시각을 YYYYMMDDHHMM 형식으로 반환
 */
function getAwsTimeString(): string {
  const now = new Date();
  // 1분 전 데이터 요청 (최신 데이터 확보)
  now.setMinutes(now.getMinutes() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}`;
}

/**
 * AWS 매분자료 응답 파싱
 * 응답 형식 예시:
 * # TM        STN  WD  WS  ...  TA   HM  ...
 * 202301271000 90  270  1.2     5.3  65  ...
 */
function parseAwsResponse(text: string, stnId: string): AwsObservation | null {
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') continue;

    const parts = line.trim().split(/\s+/);
    if (parts.length < 12) continue;

    // AWS2 포맷 기준 (help=1로 확인 필요)
    // 일반적으로: TM, STN, WD, WS, WDS, WDA, WDM, WSM, TA, HM, PA, PS, RN...
    // 인덱스는 실제 응답에 따라 조정 필요
    const ta = parseFloat(parts[8]); // 기온
    const hm = parseFloat(parts[9]); // 습도
    const ws = parseFloat(parts[3]); // 풍속
    const rn = parseFloat(parts[12] || '0'); // 강수량

    if (isNaN(ta)) continue;

    return {
      temperature: Math.round(ta * 10) / 10,
      humidity: isNaN(hm) ? 0 : Math.round(hm),
      windSpeed: isNaN(ws) ? 0 : ws,
      rainfall: isNaN(rn) ? 0 : rn,
      stnId,
      stnNm: stnId,
    };
  }

  return null;
}

/**
 * AWS 매분자료 조회 (apihub.kma.go.kr)
 */
export async function fetchAwsObservation(
  stnId: string,
  authKey: string
): Promise<AwsObservation | null> {
  // 캐시 확인
  const cached = awsCache.get(stnId);
  if (cached && Date.now() - cached.timestamp < AWS_CACHE_TTL) {
    return cached.data;
  }

  try {
    const tm2 = getAwsTimeString();
    const url = `${KMA_APIHUB_AWS_URL}?tm2=${tm2}&stn=${stnId}&disp=0&help=0&authKey=${authKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`AWS API 오류: ${response.status}`);
      return null;
    }

    const text = await response.text();
    const observation = parseAwsResponse(text, stnId);

    if (observation) {
      awsCache.set(stnId, { data: observation, timestamp: Date.now() });
    }

    return observation;
  } catch (error) {
    console.error('AWS 관측 데이터 조회 실패:', error);
    return null;
  }
}

/**
 * 초단기실황 조회 (외부용)
 * - AWS 관측소 데이터 우선 시도
 * - 실패 시 기존 초단기실황 API fallback
 */
export async function fetchKmaCurrentWeather(
  lat: number,
  lon: number,
  apiKey: string,
  apihubAuthKey?: string
): Promise<KmaCurrentData> {
  // AWS 관측 시도 (apihub 인증키가 있는 경우)
  if (apihubAuthKey) {
    try {
      const stations = await fetchAwsStations(apihubAuthKey);
      const nearest = findNearestStation(lat, lon, stations);

      if (nearest) {
        const observation = await fetchAwsObservation(nearest.stnId, apihubAuthKey);

        if (observation) {
          // AWS 데이터를 KmaCurrentData 형식으로 변환
          return {
            temperature: Math.round(observation.temperature),
            humidity: observation.humidity,
            windSpeed: observation.windSpeed,
            precipitation: observation.rainfall > 0 ? 'Rain' : '',
            precipitationDescription: observation.rainfall > 0 ? '비' : '',
          };
        }
      }
    } catch (error) {
      console.error('AWS 관측 실패, 초단기실황으로 fallback:', error);
    }
  }

  // Fallback: 기존 초단기실황 API
  const { nx, ny } = toGridCoordinate(lat, lon);
  const items = await fetchUltraSrtNcst(nx, ny, apiKey);
  return parseCurrentData(items);
}

/**
 * 단기예보 조회 (최고/최저 기온, 하늘상태)
 */
async function fetchVilageFcst(
  nx: number,
  ny: number,
  apiKey: string
): Promise<KmaItem[]> {
  const { baseDate, baseTime } = getVilageFcstBaseTime();

  const params = new URLSearchParams({
    serviceKey: apiKey,
    numOfRows: '60', // 오늘 데이터만 필요 (TMN, TMX, SKY 등)
    pageNo: '1',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const url = `${KMA_FORECAST_URL}/getVilageFcst?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`기상청 API 오류: ${response.status}`);
  }

  const data: KmaApiResponse = await response.json();

  if (data.response.header.resultCode !== '00') {
    throw new Error(`기상청 API 오류: ${data.response.header.resultMsg}`);
  }

  return data.response.body?.items?.item ?? [];
}

/**
 * 단기예보 파싱
 */
function parseForecastData(items: KmaItem[]): KmaForecastData {
  const today = new Date();
  const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  let tempMin: number | null = null;
  let tempMax: number | null = null;
  let skyCode: SkyCode = '1';

  for (const item of items) {
    if (item.fcstDate !== todayStr) continue;

    const value = item.fcstValue ?? '0';
    switch (item.category) {
      case 'TMN':
        tempMin = parseFloat(value);
        break;
      case 'TMX':
        tempMax = parseFloat(value);
        break;
      case 'SKY':
        if (skyCode === '1') {
          skyCode = value as SkyCode;
        }
        break;
    }
  }

  return {
    tempMin,
    tempMax,
    sky: SKY_MAP[skyCode] || 'Clear',
    skyDescription: SKY_DESC_MAP[skyCode] || '맑음',
  };
}

/**
 * 단기예보 조회 (외부용)
 */
export async function fetchKmaForecastWeather(
  lat: number,
  lon: number,
  apiKey: string
): Promise<KmaForecastData> {
  const { nx, ny } = toGridCoordinate(lat, lon);
  const items = await fetchVilageFcst(nx, ny, apiKey);
  return parseForecastData(items);
}

/**
 * 기상청 날씨 데이터 조회 (통합)
 */
export async function fetchKmaWeather(
  lat: number,
  lon: number,
  apiKey: string
): Promise<KmaWeatherData> {
  const { nx, ny } = toGridCoordinate(lat, lon);
  const cacheKey = getCacheKey(nx, ny);

  // 캐시 확인
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL) {
    return cached.data;
  }

  // 초단기실황 + 단기예보 병렬 호출
  const [ncstItems, fcstItems] = await Promise.all([
    fetchUltraSrtNcst(nx, ny, apiKey),
    fetchVilageFcst(nx, ny, apiKey),
  ]);

  // 초단기실황 파싱
  let temperature = 0;
  let humidity = 0;
  let windSpeed = 0;
  let ptyCode: PtyCode = '0';

  for (const item of ncstItems) {
    const value = item.obsrValue ?? '0';
    switch (item.category) {
      case 'T1H': // 기온
        temperature = parseFloat(value);
        break;
      case 'REH': // 습도
        humidity = parseInt(value, 10);
        break;
      case 'WSD': // 풍속
        windSpeed = parseFloat(value);
        break;
      case 'PTY': // 강수형태
        ptyCode = value as PtyCode;
        break;
    }
  }

  // 단기예보 파싱 (오늘 날짜 기준)
  const today = new Date();
  const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  let tempMin: number | null = null;
  let tempMax: number | null = null;
  let skyCode: SkyCode = '1';

  for (const item of fcstItems) {
    if (item.fcstDate !== todayStr) continue;

    const value = item.fcstValue ?? '0';
    switch (item.category) {
      case 'TMN': // 최저기온
        tempMin = parseFloat(value);
        break;
      case 'TMX': // 최고기온
        tempMax = parseFloat(value);
        break;
      case 'SKY': // 하늘상태 (가장 가까운 시간)
        if (!skyCode || skyCode === '1') {
          skyCode = value as SkyCode;
        }
        break;
    }
  }

  // 강수형태가 있으면 하늘상태 대신 강수형태 사용
  const hasRain = ptyCode !== '0';

  const result: KmaWeatherData = {
    temperature: Math.round(temperature),
    humidity,
    windSpeed,
    sky: hasRain ? PTY_MAP[ptyCode] || 'Rain' : SKY_MAP[skyCode] || 'Clear',
    skyDescription: hasRain
      ? PTY_DESC_MAP[ptyCode] || '비'
      : SKY_DESC_MAP[skyCode] || '맑음',
    precipitation: PTY_MAP[ptyCode] || '',
    precipitationDescription: PTY_DESC_MAP[ptyCode] || '',
    tempMin,
    tempMax,
  };

  // 캐시 저장
  weatherCache.set(cacheKey, { data: result, timestamp: Date.now() });

  return result;
}

// ============================================
// 생활기상지수 API (자외선지수)
// ============================================

// 시도별 행정구역 코드 (생활기상지수 API용)
const AREA_CODES: Record<string, string> = {
  서울: '1100000000',
  부산: '2600000000',
  대구: '2700000000',
  인천: '2800000000',
  광주: '2900000000',
  대전: '3000000000',
  울산: '3100000000',
  세종: '3600000000',
  경기: '4100000000',
  강원: '4200000000',
  충북: '4300000000',
  충남: '4400000000',
  전북: '4500000000',
  전남: '4600000000',
  경북: '4700000000',
  경남: '4800000000',
  제주: '5000000000',
};

/**
 * 위경도로부터 대략적인 시도 추정
 * (정확하지 않지만 자외선지수는 시도 단위로 큰 차이가 없음)
 */
function getAreaCodeFromCoords(lat: number, lon: number): string {
  // 제주
  if (lat < 34) return AREA_CODES['제주'];
  // 부산/울산/경남
  if (lat < 36 && lon > 128.5) return AREA_CODES['부산'];
  if (lat < 36 && lon > 127) return AREA_CODES['경남'];
  // 전남/광주
  if (lat < 35.5 && lon < 127) return AREA_CODES['광주'];
  // 전북
  if (lat < 36.2 && lon < 127.5) return AREA_CODES['전북'];
  // 대구/경북
  if (lat < 37 && lon > 128) return AREA_CODES['대구'];
  // 충남/대전
  if (lat < 37 && lon < 127.5) return AREA_CODES['대전'];
  // 충북
  if (lat < 37.5 && lon > 127 && lon < 128.5) return AREA_CODES['충북'];
  // 강원
  if (lon > 127.5 && lat > 37) return AREA_CODES['강원'];
  // 경기/서울/인천
  if (lon < 127) return AREA_CODES['인천'];
  if (lat > 37.4 && lat < 37.7 && lon > 126.8 && lon < 127.2) return AREA_CODES['서울'];
  return AREA_CODES['경기'];
}

// 생활기상지수 API 응답 타입
interface LivingIdxResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body?: {
      items?: {
        item: LivingIdxItem[];
      };
    };
  };
}

interface LivingIdxItem {
  code: string;
  areaNo: string;
  date: string;
  h0?: string; // 오늘
  h3?: string;
  h6?: string;
  h9?: string;
  h12?: string;
  h15?: string;
  h18?: string;
  h21?: string;
  h24?: string; // 내일
}

export interface UVIndexData {
  uvIndex: number;
  uvLevel: 'low' | 'moderate' | 'high' | 'very_high' | 'danger';
  uvDescription: string;
}

/**
 * 자외선지수 레벨 판정
 * 0-2: 낮음, 3-5: 보통, 6-7: 높음, 8-10: 매우높음, 11+: 위험
 */
function getUVLevel(uv: number): UVIndexData['uvLevel'] {
  if (uv <= 2) return 'low';
  if (uv <= 5) return 'moderate';
  if (uv <= 7) return 'high';
  if (uv <= 10) return 'very_high';
  return 'danger';
}

function getUVDescription(level: UVIndexData['uvLevel']): string {
  const descriptions: Record<UVIndexData['uvLevel'], string> = {
    low: '낮음',
    moderate: '보통',
    high: '높음',
    very_high: '매우높음',
    danger: '위험',
  };
  return descriptions[level];
}

/**
 * 자외선지수 조회
 */
export async function fetchUVIndex(
  lat: number,
  lon: number,
  apiKey: string
): Promise<UVIndexData> {
  const areaNo = getAreaCodeFromCoords(lat, lon);
  const now = new Date();
  const time = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}`;

  const params = new URLSearchParams({
    serviceKey: apiKey,
    numOfRows: '10',
    pageNo: '1',
    dataType: 'JSON',
    areaNo,
    time,
  });

  const url = `${KMA_LIVING_URL}/getUVIdxV4?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`자외선지수 API 오류: ${response.status}`);
  }

  const data: LivingIdxResponse = await response.json();

  if (data.response.header.resultCode !== '00') {
    throw new Error(`자외선지수 API 오류: ${data.response.header.resultMsg}`);
  }

  const items = data.response.body?.items?.item ?? [];

  // 현재 시간에 가장 가까운 값 찾기
  let uvIndex = 0;
  if (items.length > 0) {
    const item = items[0];
    // h0(현재)부터 가장 가까운 값 사용
    uvIndex = parseInt(item.h0 ?? item.h3 ?? item.h6 ?? '0', 10);
  }

  const uvLevel = getUVLevel(uvIndex);

  return {
    uvIndex,
    uvLevel,
    uvDescription: getUVDescription(uvLevel),
  };
}
