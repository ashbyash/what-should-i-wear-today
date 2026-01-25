import type { ScoreInput, OutingScore, ScoreBreakdown, OutingLevel } from '@/types/score';
import {
  SCORE_WEIGHTS,
  PM25,
  UV_INDEX,
  OUTING_LEVEL,
  THRESHOLDS,
  WEATHER_CONDITIONS,
  HUMIDITY,
  WIND_SPEED,
  SEASON_TEMP_RANGES,
  MONTH_TO_SEASON,
  UV_TIME_MULTIPLIERS,
  HOUR_TO_TIME_OF_DAY,
  LEVEL_MESSAGES,
  type Season,
  type TimeOfDay,
} from './constants';

// ============================================
// 시간/계절 유틸리티
// ============================================

// 월에서 계절 판별
function getSeason(month: number): Season {
  return MONTH_TO_SEASON[month] || 'spring';
}

// 시간에서 시간대 판별
function getTimeOfDay(hour: number): TimeOfDay {
  return HOUR_TO_TIME_OF_DAY[hour] || 'afternoon';
}

// ============================================
// 체감온도 계산
// ============================================

// Wind Chill (10℃ 이하, 풍속 4.8km/h 이상)
function calcWindChill(temp: number, windSpeed: number): number {
  const windKmh = windSpeed * 3.6; // m/s → km/h
  if (temp > 10 || windKmh < 4.8) return temp;

  return (
    13.12 +
    0.6215 * temp -
    11.37 * Math.pow(windKmh, 0.16) +
    0.3965 * temp * Math.pow(windKmh, 0.16)
  );
}

// Heat Index (26℃ 이상, 습도 40% 이상)
function calcHeatIndex(temp: number, humidity: number): number {
  if (temp < 26 || humidity < 40) return temp;

  const T = temp;
  const R = humidity;

  return (
    -8.78469475556 +
    1.61139411 * T +
    2.33854883889 * R -
    0.14611605 * T * R -
    0.012308094 * T * T -
    0.0164248277778 * R * R +
    0.002211732 * T * T * R +
    0.00072546 * T * R * R -
    0.000003582 * T * T * R * R
  );
}

// 체감온도 계산 (Wind Chill + Heat Index 조합)
export function getFeelsLikeTemp(temp: number, windSpeed?: number, humidity?: number): number {
  const wind = windSpeed ?? 0;
  const hum = humidity ?? 50;

  if (temp <= 10 && wind > 0) {
    return calcWindChill(temp, wind);
  }
  if (temp >= 26 && hum >= 40) {
    return calcHeatIndex(temp, hum);
  }
  return temp;
}

// ============================================
// 체감온도 점수 (55점 만점, 계절별 기준)
// ============================================
function calcFeelsLikeTempScore(feelsLike: number, season: Season): number {
  const ranges = SEASON_TEMP_RANGES[season];

  // 쾌적 구간: 55점
  if (feelsLike >= ranges.ideal.min && feelsLike <= ranges.ideal.max) {
    return SCORE_WEIGHTS.FEELS_LIKE_TEMP;
  }
  // 양호 구간: 40점
  if (
    (feelsLike >= ranges.good.coldMin && feelsLike <= ranges.good.coldMax) ||
    (feelsLike >= ranges.good.hotMin && feelsLike <= ranges.good.hotMax)
  ) {
    return 40;
  }
  // 주의 구간: 20점
  if (
    (feelsLike >= ranges.caution.coldMin && feelsLike <= ranges.caution.coldMax) ||
    (feelsLike >= ranges.caution.hotMin && feelsLike <= ranges.caution.hotMax)
  ) {
    return 20;
  }
  // 위험 구간: 0점
  return 0;
}

// 날씨 점수 (20점 만점)
function calcWeatherScore(weatherMain: string): number {
  const weather = weatherMain.toLowerCase();

  if (WEATHER_CONDITIONS.CLEAR.some((w) => weather === w)) return SCORE_WEIGHTS.WEATHER;
  if (WEATHER_CONDITIONS.CLOUDY.some((w) => weather === w)) return 14;
  if (WEATHER_CONDITIONS.OVERCAST.some((w) => weather === w)) return 8;
  if (WEATHER_CONDITIONS.RAINY.some((w) => weather === w) || WEATHER_CONDITIONS.SNOWY.some((w) => weather === w)) {
    return 0;
  }
  return 8; // 기타
}

// 미세먼지 점수 (15점 만점) - PM2.5 기준
function calcFineDustScore(pm25: number): number {
  if (pm25 <= PM25.GOOD) return SCORE_WEIGHTS.FINE_DUST;
  if (pm25 <= PM25.MODERATE) return 10;
  if (pm25 <= PM25.BAD) return 5;
  return 0;
}

// 자외선 점수 (5점 만점, 시간대 배율 적용)
function calcUvScore(uvIndex: number | undefined, timeOfDay: TimeOfDay): number {
  if (uvIndex === undefined) return 3; // UV 정보 없으면 보통으로 처리

  // 시간대별 배율 적용
  const multiplier = UV_TIME_MULTIPLIERS[timeOfDay];
  const adjustedUv = uvIndex * multiplier;

  if (adjustedUv <= UV_INDEX.LOW) return SCORE_WEIGHTS.UV;
  if (adjustedUv <= UV_INDEX.MODERATE) return 3;
  if (adjustedUv <= UV_INDEX.HIGH) return 2;
  if (adjustedUv <= UV_INDEX.VERY_HIGH) return 1;
  return 0;
}

// 습도 점수 (5점 만점)
function calcHumidityScore(humidity: number | undefined): number {
  if (humidity === undefined) return 3; // 습도 정보 없으면 보통으로 처리

  // 쾌적 구간: 40-60%
  if (humidity >= HUMIDITY.IDEAL_MIN && humidity <= HUMIDITY.IDEAL_MAX) {
    return SCORE_WEIGHTS.HUMIDITY;
  }
  // 양호 구간: 30-39%, 61-70%
  if (humidity >= HUMIDITY.GOOD_MIN && humidity <= HUMIDITY.GOOD_MAX) {
    return 3;
  }
  // 불쾌 구간: 30% 미만 또는 70% 초과
  return 1;
}

// 풍속 페널티 (0 ~ -10점)
function calcWindPenalty(windSpeed: number | undefined): number {
  if (windSpeed === undefined) return 0; // 풍속 정보 없으면 페널티 없음

  if (windSpeed >= WIND_SPEED.STRONG) return SCORE_WEIGHTS.WIND_PENALTY_MAX; // -10점
  if (windSpeed >= WIND_SPEED.MODERATE) return -5;
  return 0;
}

// 레벨 판정 (7단계)
function getOutingLevel(total: number): OutingLevel {
  if (total >= OUTING_LEVEL.PERFECT) return 'perfect';
  if (total >= OUTING_LEVEL.EXCELLENT) return 'excellent';
  if (total >= OUTING_LEVEL.GOOD) return 'good';
  if (total >= OUTING_LEVEL.FAIR) return 'fair';
  if (total >= OUTING_LEVEL.MODERATE) return 'moderate';
  if (total >= OUTING_LEVEL.POOR) return 'poor';
  return 'bad';
}

// ============================================
// 랜덤 변동 & 메시지 선택
// ============================================

// 랜덤 변동 (±2점, 1분마다 변경되는 pseudo-random)
function getRandomVariation(timestamp: number): number {
  // 1분 단위로 시드 생성 (같은 분 내에는 같은 값)
  const minuteSeed = Math.floor(timestamp / 60000);
  // pseudo-random: 시드를 기반으로 -2 ~ +2 사이 값 생성
  const hash = (minuteSeed * 2654435761) % 4294967296;
  return (hash % 5) - 2; // -2, -1, 0, 1, 2
}

// 메시지 선택 (시간 기반 랜덤)
function getOutingMessage(level: OutingLevel, timestamp: number): string {
  const messages = LEVEL_MESSAGES[level];
  // 1분 단위로 메시지 인덱스 결정
  const minuteSeed = Math.floor(timestamp / 60000);
  const index = minuteSeed % messages.length;
  return messages[index];
}

// 상황별 팁 메시지
function getTips(input: ScoreInput): string[] {
  const tips: string[] = [];

  // 기온 관련
  if (input.temperature <= THRESHOLDS.COLD_ALERT) {
    tips.push('방한용품 챙기세요');
  }
  if (input.temperature >= THRESHOLDS.HOT_ALERT) {
    tips.push('수분 섭취에 신경 쓰세요');
  }

  // 미세먼지 관련
  if (input.pm25 >= PM25.MASK_THRESHOLD) {
    tips.push('마스크 챙기세요');
  }

  // 자외선 관련
  if (input.uvIndex !== undefined && input.uvIndex >= UV_INDEX.SUNSCREEN_THRESHOLD) {
    tips.push('선크림 바르세요');
  }

  // 날씨 관련
  const weather = input.weatherMain.toLowerCase();
  if (
    WEATHER_CONDITIONS.RAINY.some((w) => weather === w) ||
    WEATHER_CONDITIONS.SNOWY.some((w) => weather === w)
  ) {
    tips.push('우산 챙기세요');
  }

  return tips;
}

// 외출 점수 계산 메인 함수
export function calculateOutingScore(input: ScoreInput): OutingScore {
  // timestamp 처리 (없으면 현재 시간)
  const timestamp = input.timestamp ?? Date.now();
  const date = new Date(timestamp);
  const month = date.getMonth() + 1; // 0-indexed → 1-indexed
  const hour = date.getHours();

  // 계절/시간대 판별
  const season = getSeason(month);
  const timeOfDay = getTimeOfDay(hour);

  // 체감온도 계산
  const feelsLike = getFeelsLikeTemp(input.temperature, input.windSpeed, input.humidity);

  // 점수 계산
  const breakdown: ScoreBreakdown = {
    feelsLikeTemp: calcFeelsLikeTempScore(feelsLike, season),
    weather: calcWeatherScore(input.weatherMain),
    fineDust: calcFineDustScore(input.pm25),
    uv: calcUvScore(input.uvIndex, timeOfDay),
    humidity: calcHumidityScore(input.humidity),
    windPenalty: calcWindPenalty(input.windSpeed),
  };

  // 기본 점수 합산
  const baseTotal =
    breakdown.feelsLikeTemp +
    breakdown.weather +
    breakdown.fineDust +
    breakdown.uv +
    breakdown.humidity +
    breakdown.windPenalty;

  // 랜덤 변동 적용 (±2점, 0-100 범위 제한)
  const variation = getRandomVariation(timestamp);
  const total = Math.max(0, Math.min(100, baseTotal + variation));

  const level = getOutingLevel(total);
  const message = getOutingMessage(level, timestamp);
  const tips = getTips(input);

  return {
    total,
    breakdown,
    level,
    message,
    tips,
  };
}
