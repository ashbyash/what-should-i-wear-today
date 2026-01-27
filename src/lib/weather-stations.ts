/**
 * AWS 관측소 관리
 * - apihub.kma.go.kr에서 관측소 목록 조회
 * - 최근접 관측소 찾기
 */

import { calculateDistance } from './location-cache';

const KMA_APIHUB_URL = 'https://apihub.kma.go.kr/api/typ01/url/stn_inf.php';

// 관측소 캐시 (24시간)
const STATION_CACHE_TTL = 24 * 60 * 60 * 1000;
let stationCache: { stations: AwsStation[]; timestamp: number } | null = null;

export interface AwsStation {
  stnId: string;
  stnNm: string;
  lat: number;
  lon: number;
}

/**
 * 현재 시각을 YYYYMMDDHHMM 형식으로 반환
 */
function getCurrentTimeString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}`;
}

/**
 * AWS 관측소 목록 조회
 * - apihub.kma.go.kr API 사용
 * - 24시간 캐시 적용
 */
export async function fetchAwsStations(authKey: string): Promise<AwsStation[]> {
  // 캐시 확인
  if (stationCache && Date.now() - stationCache.timestamp < STATION_CACHE_TTL) {
    return stationCache.stations;
  }

  const tm = getCurrentTimeString();
  const url = `${KMA_APIHUB_URL}?inf=AWS&tm=${tm}&help=0&authKey=${authKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`AWS 관측소 목록 API 오류: ${response.status}`);
  }

  const text = await response.text();
  const stations = parseStationResponse(text);

  // 캐시 저장
  stationCache = { stations, timestamp: Date.now() };

  return stations;
}

/**
 * API 응답 파싱 (텍스트 형식)
 * 응답 형식 예시:
 * # STN  TM              LON       LAT  ...
 * 90     202301271000    126.9528  37.5647  ...
 */
function parseStationResponse(text: string): AwsStation[] {
  const lines = text.split('\n');
  const stations: AwsStation[] = [];

  for (const line of lines) {
    // 주석 라인이나 빈 라인 스킵
    if (line.startsWith('#') || line.trim() === '') continue;

    // 공백으로 분리
    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) continue;

    const stnId = parts[0];
    // parts[1]은 tm (시간)
    const lon = parseFloat(parts[2]);
    const lat = parseFloat(parts[3]);

    // 유효한 좌표인지 확인
    if (isNaN(lat) || isNaN(lon)) continue;
    // 한국 범위 내인지 대략 확인
    if (lat < 33 || lat > 39 || lon < 124 || lon > 132) continue;

    stations.push({
      stnId,
      stnNm: stnId, // 이름이 별도로 없으면 ID 사용
      lat,
      lon,
    });
  }

  return stations;
}

/**
 * 최근접 관측소 찾기
 * - Haversine 공식 사용
 */
export function findNearestStation(
  lat: number,
  lon: number,
  stations: AwsStation[]
): AwsStation | null {
  if (stations.length === 0) return null;

  let nearest: AwsStation | null = null;
  let minDistance = Infinity;

  for (const station of stations) {
    const distance = calculateDistance(lat, lon, station.lat, station.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = station;
    }
  }

  return nearest;
}

/**
 * 최근접 관측소와의 거리 (km)
 */
export function getDistanceToStation(
  lat: number,
  lon: number,
  station: AwsStation
): number {
  return calculateDistance(lat, lon, station.lat, station.lon);
}
