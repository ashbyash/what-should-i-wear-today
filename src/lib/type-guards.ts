/**
 * 클라이언트용 타입 가드 (Zod 없이)
 * 서버에서 이미 검증된 데이터이므로 기본적인 null 체크만 수행
 */

export interface KmaCurrentData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: string;
  precipitationDescription: string;
}

export interface KmaForecastData {
  tempMin: number | null;
  tempMax: number | null;
  sky: string;
  skyDescription: string;
}

export type AirGrade = 'good' | 'moderate' | 'bad' | 'very_bad';

export interface AirKoreaData {
  stationName: string;
  stationAddr: string;
  pm10: number;
  pm25: number;
  pm10Grade: AirGrade;
  pm25Grade: AirGrade;
  dataTime: string;
}

export type UVLevel = 'low' | 'moderate' | 'high' | 'very_high' | 'danger';

export interface UVIndexData {
  uvIndex: number;
  uvLevel: UVLevel;
  uvDescription: string;
}

export interface LocationData {
  address: string;
  region1: string;
  region2: string;
  region3: string;
}

// 간단한 타입 가드 (서버에서 이미 검증됨)
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseCurrentWeather(data: unknown): KmaCurrentData | null {
  if (!isObject(data)) return null;
  if (typeof data.temperature !== 'number') return null;
  return data as unknown as KmaCurrentData;
}

export function parseForecastWeather(data: unknown): KmaForecastData | null {
  if (!isObject(data)) return null;
  if (typeof data.sky !== 'string') return null;
  return data as unknown as KmaForecastData;
}

export function parseAirKorea(data: unknown): AirKoreaData | null {
  if (!isObject(data)) return null;
  if (typeof data.pm25 !== 'number') return null;
  return data as unknown as AirKoreaData;
}

export function parseUVIndex(data: unknown): UVIndexData | null {
  if (!isObject(data)) return null;
  if (typeof data.uvIndex !== 'number') return null;
  return data as unknown as UVIndexData;
}

export function parseLocation(data: unknown): LocationData | null {
  if (!isObject(data)) return null;
  if (typeof data.address !== 'string') return null;
  return data as unknown as LocationData;
}
