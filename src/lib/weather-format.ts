import { STATUS_COLORS } from './design-tokens';

export function getPM25Level(pm25: number): string {
  if (pm25 <= 15) return '좋음';
  if (pm25 <= 35) return '보통';
  if (pm25 <= 75) return '나쁨';
  return '매우나쁨';
}

export function getPM25Color(pm25: number): string {
  if (pm25 <= 15) return STATUS_COLORS.good;
  if (pm25 <= 35) return STATUS_COLORS.moderate;
  return STATUS_COLORS.bad;
}

export function getUVLevel(uvIndex: number): string {
  if (uvIndex <= 2) return '낮음';
  if (uvIndex <= 5) return '보통';
  if (uvIndex <= 7) return '높음';
  if (uvIndex <= 10) return '매우높음';
  return '위험';
}

export function getUVColor(uvIndex: number): string {
  if (uvIndex <= 2) return STATUS_COLORS.good;
  if (uvIndex <= 5) return STATUS_COLORS.moderate;
  return STATUS_COLORS.bad;
}

export function getHumidityDescription(humidity?: number): string {
  if (humidity === undefined) return '데이터 없음';
  if (humidity >= 40 && humidity <= 60) return '쾌적한 수준';
  if (humidity < 40) return '건조한 편';
  return '습한 편';
}

export function getWindDescription(windSpeed?: number): string {
  if (windSpeed === undefined) return '데이터 없음';
  if (windSpeed < 2) return '바람 거의 없음';
  if (windSpeed < 5) return '산들바람';
  if (windSpeed < 8) return '약간 강한 바람';
  return '강풍';
}
