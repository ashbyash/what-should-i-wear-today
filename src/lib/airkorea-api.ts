/**
 * 에어코리아 API 연동
 * - 측정소정보: TM좌표로 가까운 측정소 찾기
 * - 대기오염정보: 실시간 미세먼지 조회
 */

import { toTMCoordinate } from './coordinates';

const AIRKOREA_STATION_URL = 'http://apis.data.go.kr/B552584/MsrstnInfoInqireSvc';
const AIRKOREA_AIRQUALITY_URL = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc';

// 측정소 정보 API 응답 타입
interface StationResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body?: {
      items: StationItem[];
    };
  };
}

interface StationItem {
  stationName: string;
  addr: string;
  tm: number; // 거리 (km)
}

// 대기오염 정보 API 응답 타입
interface AirQualityResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body?: {
      items: AirQualityItem[];
    };
  };
}

interface AirQualityItem {
  dataTime: string;
  pm10Value: string;
  pm25Value: string;
  pm10Grade: string;
  pm25Grade: string;
  khaiValue: string;
  khaiGrade: string;
}

export interface AirKoreaData {
  stationName: string;
  pm10: number;
  pm25: number;
  pm10Grade: 'good' | 'moderate' | 'bad' | 'very_bad';
  pm25Grade: 'good' | 'moderate' | 'bad' | 'very_bad';
  dataTime: string;
}

type AirGrade = 'good' | 'moderate' | 'bad' | 'very_bad';

/**
 * PM2.5 등급 판정 (한국 기준)
 * 좋음: 0-15, 보통: 16-35, 나쁨: 36-75, 매우나쁨: 76+
 */
function getPM25Grade(value: number): AirGrade {
  if (value <= 15) return 'good';
  if (value <= 35) return 'moderate';
  if (value <= 75) return 'bad';
  return 'very_bad';
}

/**
 * PM10 등급 판정 (한국 기준)
 * 좋음: 0-30, 보통: 31-80, 나쁨: 81-150, 매우나쁨: 151+
 */
function getPM10Grade(value: number): AirGrade {
  if (value <= 30) return 'good';
  if (value <= 80) return 'moderate';
  if (value <= 150) return 'bad';
  return 'very_bad';
}

/**
 * 가까운 측정소 찾기
 */
async function findNearestStation(
  tmX: number,
  tmY: number,
  apiKey: string
): Promise<string> {
  const params = new URLSearchParams({
    serviceKey: apiKey,
    returnType: 'json',
    tmX: String(tmX),
    tmY: String(tmY),
    ver: '1.1',
  });

  const url = `${AIRKOREA_STATION_URL}/getNearbyMsrstnList?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`측정소 API 오류: ${response.status}`);
  }

  const data: StationResponse = await response.json();

  if (data.response.header.resultCode !== '00') {
    throw new Error(`측정소 API 오류: ${data.response.header.resultMsg}`);
  }

  const items = data.response.body?.items ?? [];
  if (items.length === 0) {
    throw new Error('근처 측정소를 찾을 수 없습니다.');
  }

  // 가장 가까운 측정소 반환
  return items[0].stationName;
}

/**
 * 측정소별 실시간 대기오염 정보 조회
 */
async function fetchStationAirQuality(
  stationName: string,
  apiKey: string
): Promise<AirQualityItem> {
  const params = new URLSearchParams({
    serviceKey: apiKey,
    returnType: 'json',
    stationName,
    dataTerm: 'DAILY',
    ver: '1.0',
  });

  const url = `${AIRKOREA_AIRQUALITY_URL}/getMsrstnAcctoRltmMesureDnsty?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`대기오염 API 오류: ${response.status}`);
  }

  const data: AirQualityResponse = await response.json();

  if (data.response.header.resultCode !== '00') {
    throw new Error(`대기오염 API 오류: ${data.response.header.resultMsg}`);
  }

  const items = data.response.body?.items ?? [];
  if (items.length === 0) {
    throw new Error('대기오염 데이터가 없습니다.');
  }

  // 가장 최근 데이터 반환
  return items[0];
}

/**
 * 에어코리아 대기질 데이터 조회 (통합)
 */
export async function fetchAirKorea(
  lat: number,
  lon: number,
  apiKey: string
): Promise<AirKoreaData> {
  // 위경도 → TM좌표 변환
  const { tmX, tmY } = toTMCoordinate(lat, lon);

  // 가까운 측정소 찾기
  const stationName = await findNearestStation(tmX, tmY, apiKey);

  // 측정소 대기질 조회
  const airData = await fetchStationAirQuality(stationName, apiKey);

  // 값이 '-' 이거나 없으면 0으로 처리
  const pm10 = parseInt(airData.pm10Value, 10) || 0;
  const pm25 = parseInt(airData.pm25Value, 10) || 0;

  return {
    stationName,
    pm10,
    pm25,
    pm10Grade: getPM10Grade(pm10),
    pm25Grade: getPM25Grade(pm25),
    dataTime: airData.dataTime,
  };
}
