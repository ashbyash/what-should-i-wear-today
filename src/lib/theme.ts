// 시간대별/계절별 컬러 팔레트 시스템

export type TimeOfDay = 'dawn' | 'morning' | 'day' | 'evening' | 'night';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeatherType = 'clear' | 'clouds' | 'rain' | 'snow' | 'mist';

// 서울 기준 월별 일출/일몰 시간 (시:분을 소수점 시간으로 변환)
// 예: 5:30 = 5.5, 19:15 = 19.25
const MONTHLY_SUN_TIMES: Record<number, { sunrise: number; sunset: number }> = {
  1: { sunrise: 7.75, sunset: 17.5 },   // 1월: 7:45, 17:30
  2: { sunrise: 7.33, sunset: 18.08 },  // 2월: 7:20, 18:05
  3: { sunrise: 6.67, sunset: 18.58 },  // 3월: 6:40, 18:35
  4: { sunrise: 5.92, sunset: 19.08 },  // 4월: 5:55, 19:05
  5: { sunrise: 5.33, sunset: 19.58 },  // 5월: 5:20, 19:35
  6: { sunrise: 5.17, sunset: 19.92 },  // 6월: 5:10, 19:55
  7: { sunrise: 5.33, sunset: 19.83 },  // 7월: 5:20, 19:50
  8: { sunrise: 5.75, sunset: 19.33 },  // 8월: 5:45, 19:20
  9: { sunrise: 6.17, sunset: 18.58 },  // 9월: 6:10, 18:35
  10: { sunrise: 6.67, sunset: 17.83 }, // 10월: 6:40, 17:50
  11: { sunrise: 7.17, sunset: 17.33 }, // 11월: 7:10, 17:20
  12: { sunrise: 7.67, sunset: 17.25 }, // 12월: 7:40, 17:15
};

// 시간대별 그라데이션 (사용자 정의 팔레트)
export const TIME_GRADIENTS: Record<TimeOfDay, { from: string; to: string }> = {
  dawn: { from: '#1e3a5f', to: '#f4a261' },
  morning: { from: '#ffecd2', to: '#fcb69f' },
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
  dawn: { isLight: false },
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
 * 현재 시간으로 시간대 판별 (계절별 일출/일몰 반영)
 *
 * 시간대 분류:
 * - dawn (새벽): 일출 1시간 전 ~ 일출 1시간 후
 * - morning (아침): 일출 1시간 후 ~ 일출 3시간 후
 * - day (낮): 일출 3시간 후 ~ 일몰 2시간 전
 * - evening (저녁): 일몰 2시간 전 ~ 일몰 1.5시간 후
 * - night (밤): 그 외
 */
export function getTimeOfDay(hour?: number, month?: number): TimeOfDay {
  const now = new Date();
  const h = hour ?? now.getHours() + now.getMinutes() / 60; // 소수점 시간
  const m = month ?? now.getMonth() + 1;

  const { sunrise, sunset } = MONTHLY_SUN_TIMES[m] || MONTHLY_SUN_TIMES[6];

  // 시간대 경계 계산
  const dawnStart = sunrise - 1;
  const dawnEnd = sunrise + 1;
  const morningEnd = sunrise + 3;
  const eveningStart = sunset - 2;
  const eveningEnd = sunset + 1.5;

  if (h >= dawnStart && h < dawnEnd) return 'dawn';
  if (h >= dawnEnd && h < morningEnd) return 'morning';
  if (h >= morningEnd && h < eveningStart) return 'day';
  if (h >= eveningStart && h < eveningEnd) return 'evening';
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
  overrideMonth?: number
): ThemeConfig {
  const timeOfDay = getTimeOfDay(overrideHour);
  const season = getSeason(overrideMonth);
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
