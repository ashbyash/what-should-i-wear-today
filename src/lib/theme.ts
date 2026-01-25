// 시간대별/계절별 컬러 팔레트 시스템
import SunCalc from 'suncalc';

export type TimeOfDay = 'dawn' | 'morning' | 'day' | 'evening' | 'night';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeatherType = 'clear' | 'clouds' | 'rain' | 'snow' | 'mist';

// 서울 기본 좌표 (좌표 없을 때 fallback)
const DEFAULT_COORDS = { lat: 37.5665, lon: 126.978 };

// 시간대별 그라데이션
export const TIME_GRADIENTS: Record<TimeOfDay, { from: string; to: string }> = {
  dawn: { from: '#a1c4fd', to: '#ffecd2' },
  morning: { from: '#fcb69f', to: '#ffecd2' },
  day: { from: '#56ccf2', to: '#2f80ed' },
  evening: { from: '#ee9ca7', to: '#ffdde1' },
  night: { from: '#0f0c29', to: '#302b63' },
};

// 계절별 액센트 색상
export const SEASON_ACCENTS: Record<Season, string> = {
  spring: '#fcd5ce',
  summer: '#99e9f2',
  autumn: '#f4a261',
  winter: '#a5d8ff',
};

// 시간대별 텍스트 색상 (밝은 배경 vs 어두운 배경)
export const TIME_TEXT_COLORS: Record<TimeOfDay, { isLight: boolean }> = {
  dawn: { isLight: true },
  morning: { isLight: true },
  day: { isLight: false },
  evening: { isLight: true },
  night: { isLight: false },
};

// 날씨별 오버레이 효과
export const WEATHER_OVERLAYS: Record<WeatherType, string> = {
  clear: '',
  clouds: 'bg-slate-500/20',
  rain: 'bg-slate-700/30',
  snow: 'bg-blue-200/20',
  mist: 'bg-gray-400/25',
};

/**
 * suncalc을 사용하여 좌표 기반 일출/일몰 시간 계산
 */
export function getSunTimes(
  lat: number = DEFAULT_COORDS.lat,
  lon: number = DEFAULT_COORDS.lon,
  date: Date = new Date()
): { sunrise: number; sunset: number; dawn: number; dusk: number } {
  const times = SunCalc.getTimes(date, lat, lon);

  // Date를 소수점 시간으로 변환 (예: 7:30 → 7.5)
  const toDecimalHour = (d: Date) => d.getHours() + d.getMinutes() / 60;

  return {
    sunrise: toDecimalHour(times.sunrise),
    sunset: toDecimalHour(times.sunset),
    dawn: toDecimalHour(times.dawn), // 시민 박명 시작
    dusk: toDecimalHour(times.dusk), // 시민 박명 끝
  };
}

/**
 * 현재 시간으로 시간대 판별 (좌표 기반 일출/일몰 사용)
 *
 * 시간대 분류:
 * - dawn (새벽): 시민 박명 시작 ~ 일출 후 30분
 * - morning (아침): 일출 후 30분 ~ 일출 후 2시간
 * - day (낮): 일출 후 2시간 ~ 일몰 전 1시간
 * - evening (저녁): 일몰 전 1시간 ~ 시민 박명 끝
 * - night (밤): 그 외
 */
export function getTimeOfDay(
  hour?: number,
  coords?: { lat: number; lon: number }
): TimeOfDay {
  const now = new Date();
  const h = hour ?? now.getHours() + now.getMinutes() / 60;

  const { sunrise, sunset, dawn, dusk } = getSunTimes(
    coords?.lat,
    coords?.lon,
    now
  );

  // 시간대 경계 계산
  const dawnEnd = sunrise + 0.5; // 일출 후 30분
  const morningEnd = sunrise + 2; // 일출 후 2시간
  const eveningStart = sunset - 1; // 일몰 전 1시간

  if (h >= dawn && h < dawnEnd) return 'dawn';
  if (h >= dawnEnd && h < morningEnd) return 'morning';
  if (h >= morningEnd && h < eveningStart) return 'day';
  if (h >= eveningStart && h < dusk) return 'evening';
  return 'night';
}

/**
 * 현재 월로 계절 판별 (북반구 기준)
 */
export function getSeason(month?: number): Season {
  const m = month ?? new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

/**
 * 날씨 문자열을 WeatherType으로 변환
 */
export function getWeatherType(weatherMain: string): WeatherType {
  const weather = weatherMain.toLowerCase();
  if (weather === 'clear') return 'clear';
  if (weather === 'clouds') return 'clouds';
  if (['rain', 'drizzle', 'thunderstorm'].includes(weather)) return 'rain';
  if (weather === 'snow') return 'snow';
  return 'mist';
}

export interface ThemeConfig {
  gradient: { from: string; to: string };
  overlay: string;
  isLight: boolean;
  seasonAccent: string;
  timeOfDay: TimeOfDay;
  season: Season;
}

/**
 * 시간대 + 날씨 + 계절 기반 테마 설정 반환
 */
export function getThemeConfig(
  weatherMain: string,
  overrideHour?: number,
  coords?: { lat: number; lon: number }
): ThemeConfig {
  const timeOfDay = getTimeOfDay(overrideHour, coords);
  const season = getSeason();
  const weatherType = getWeatherType(weatherMain);

  return {
    gradient: TIME_GRADIENTS[timeOfDay],
    overlay: WEATHER_OVERLAYS[weatherType],
    isLight: TIME_TEXT_COLORS[timeOfDay].isLight,
    seasonAccent: SEASON_ACCENTS[season],
    timeOfDay,
    season,
  };
}

/**
 * 테마에 맞는 CSS 스타일 문자열 생성
 */
export function getGradientStyle(gradient: { from: string; to: string }): React.CSSProperties {
  return {
    background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})`,
  };
}

/**
 * 시간대별 인사말
 */
export function getTimeGreeting(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case 'dawn':
      return '좋은 새벽이에요';
    case 'morning':
      return '좋은 아침이에요';
    case 'day':
      return '좋은 하루 보내세요';
    case 'evening':
      return '좋은 저녁이에요';
    case 'night':
      return '편안한 밤 되세요';
  }
}

/**
 * 계절별 인사말
 */
export function getSeasonGreeting(season: Season): string {
  switch (season) {
    case 'spring':
      return '따스한 봄';
    case 'summer':
      return '무더운 여름';
    case 'autumn':
      return '선선한 가을';
    case 'winter':
      return '추운 겨울';
  }
}
