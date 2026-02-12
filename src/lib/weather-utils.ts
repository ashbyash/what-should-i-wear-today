import SunCalc from 'suncalc';

export type TimeCategory = 'sunrise' | 'day' | 'sunset' | 'night';

/**
 * 시간별 아이템의 시간대 판정
 * - SunCalc.getTimes()로 일출/일몰 UTC 계산 후 현지 시간 변환
 * - getSunTimes()(theme.ts)는 KST 고정이라 해외 도시에서 사용 불가
 */
export function getTimeCategoryForHour(
  hourStr: string,
  lat: number,
  lon: number,
  utcOffset?: number
): TimeCategory {
  const hour = parseInt(hourStr.split(':')[0], 10);
  const times = SunCalc.getTimes(new Date(), lat, lon);

  const offset = utcOffset ?? 9;
  const toLocalHour = (d: Date) => {
    const utcH = d.getUTCHours() + d.getUTCMinutes() / 60;
    return ((utcH + offset) % 24 + 24) % 24;
  };

  const sunrise = toLocalHour(times.sunrise);
  const sunset = toLocalHour(times.sunset);

  if (hour >= sunrise - 0.5 && hour <= sunrise + 0.5) return 'sunrise';
  if (hour >= sunset - 0.5 && hour <= sunset + 0.5) return 'sunset';
  if (hour > sunrise + 0.5 && hour < sunset - 0.5) return 'day';
  return 'night';
}

export function getWeatherEmoji(
  weatherMain: string,
  timeCategory?: TimeCategory
): string {
  const w = weatherMain.toLowerCase();

  if (w === 'rain' || w === 'drizzle' || w === 'shower') return '🌧️';
  if (w === 'thunderstorm') return '⛈️';
  if (w === 'snow') return '❄️';
  if (w === 'mist' || w === 'fog' || w === 'haze') return '☁️';

  if (w === 'clear') {
    if (!timeCategory) return '☀️';
    if (timeCategory === 'night') return '🌙';
    if (timeCategory === 'sunrise' || timeCategory === 'sunset') return '🌤️';
    return '☀️';
  }

  if (w === 'clouds' || w === 'overcast') return '☁️';

  if (!timeCategory) return '🌤️';
  return timeCategory === 'night' ? '🌙' : '🌤️';
}
