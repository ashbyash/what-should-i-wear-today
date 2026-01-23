import type { ScoreInput, OutingScore, ScoreBreakdown, OutingLevel } from '@/types/score';
import {
  SCORE_WEIGHTS,
  TEMP_SCORE,
  PM25,
  UV_INDEX,
  OUTING_LEVEL,
  THRESHOLDS,
  WEATHER_CONDITIONS,
} from './constants';

// 온도 점수 (60점 만점) - 가장 중요한 요소
function calcTemperatureScore(temp: number): number {
  if (temp >= TEMP_SCORE.IDEAL_MIN && temp <= TEMP_SCORE.IDEAL_MAX) {
    return SCORE_WEIGHTS.TEMPERATURE;
  }
  if (
    (temp >= TEMP_SCORE.GOOD_COLD_MIN && temp <= TEMP_SCORE.GOOD_COLD_MAX) ||
    (temp >= TEMP_SCORE.GOOD_HOT_MIN && temp <= TEMP_SCORE.GOOD_HOT_MAX)
  ) {
    return 40;
  }
  if (
    (temp >= TEMP_SCORE.CAUTION_COLD_MIN && temp <= TEMP_SCORE.CAUTION_COLD_MAX) ||
    (temp >= TEMP_SCORE.CAUTION_HOT_MIN && temp <= TEMP_SCORE.CAUTION_HOT_MAX)
  ) {
    return 20;
  }
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

// 자외선 점수 (5점 만점)
function calcUvScore(uvIndex: number | undefined): number {
  if (uvIndex === undefined) return 3; // UV 정보 없으면 보통으로 처리

  if (uvIndex <= UV_INDEX.LOW) return SCORE_WEIGHTS.UV;
  if (uvIndex <= UV_INDEX.MODERATE) return 3;
  if (uvIndex <= UV_INDEX.HIGH) return 2;
  if (uvIndex <= UV_INDEX.VERY_HIGH) return 1;
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

// 레벨별 메시지 (7단계)
function getOutingMessage(level: OutingLevel): string {
  switch (level) {
    case 'perfect':
      return '완벽한 외출 날씨예요!';
    case 'excellent':
      return '외출하기 최고의 날씨예요';
    case 'good':
      return '외출하기 좋은 날씨예요';
    case 'fair':
      return '외출하기 괜찮은 날씨예요';
    case 'moderate':
      return '외출 시 주의가 필요해요';
    case 'poor':
      return '가급적 실내 활동을 추천해요';
    case 'bad':
      return '외출을 피하는 게 좋겠어요';
  }
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
  const breakdown: ScoreBreakdown = {
    temperature: calcTemperatureScore(input.temperature),
    weather: calcWeatherScore(input.weatherMain),
    fineDust: calcFineDustScore(input.pm25),
    uv: calcUvScore(input.uvIndex),
  };

  const total =
    breakdown.temperature + breakdown.fineDust + breakdown.weather + breakdown.uv;

  const level = getOutingLevel(total);
  const message = getOutingMessage(level);
  const tips = getTips(input);

  return {
    total,
    breakdown,
    level,
    message,
    tips,
  };
}
