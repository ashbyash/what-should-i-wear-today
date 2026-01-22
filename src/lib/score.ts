import type { ScoreInput, OutingScore, ScoreBreakdown, OutingLevel } from '@/types/score';

// 온도 점수 (60점 만점) - 가장 중요한 요소
function calcTemperatureScore(temp: number): number {
  if (temp >= 20 && temp <= 26) return 60;
  if ((temp >= 12 && temp <= 19) || (temp >= 27 && temp <= 32)) return 40;
  if ((temp >= 5 && temp <= 11) || (temp >= 33 && temp <= 36)) return 20;
  return 0;
}

// 날씨 점수 (20점 만점)
function calcWeatherScore(weatherMain: string): number {
  const weather = weatherMain.toLowerCase();

  if (weather === 'clear') return 20;
  if (weather === 'clouds' || weather === 'cloudy') return 14;
  if (weather === 'overcast' || weather === 'mist' || weather === 'fog' || weather === 'haze') {
    return 8;
  }
  if (
    weather === 'rain' ||
    weather === 'drizzle' ||
    weather === 'snow' ||
    weather === 'thunderstorm'
  ) {
    return 0;
  }
  return 8; // 기타
}

// 미세먼지 점수 (15점 만점) - PM2.5 기준
function calcFineDustScore(pm25: number): number {
  if (pm25 <= 15) return 15; // 좋음
  if (pm25 <= 35) return 10; // 보통
  if (pm25 <= 75) return 5; // 나쁨
  return 0; // 매우나쁨
}

// 자외선 점수 (5점 만점)
function calcUvScore(uvIndex: number | undefined): number {
  if (uvIndex === undefined) return 3; // UV 정보 없으면 보통으로 처리

  if (uvIndex <= 2) return 5; // 낮음
  if (uvIndex <= 5) return 3; // 보통
  if (uvIndex <= 7) return 2; // 높음
  if (uvIndex <= 10) return 1; // 매우높음
  return 0; // 위험
}

// 레벨 판정
function getOutingLevel(total: number): OutingLevel {
  if (total >= 80) return 'excellent';
  if (total >= 60) return 'good';
  if (total > 40) return 'moderate';
  return 'poor';
}

// 레벨별 메시지
function getOutingMessage(level: OutingLevel): string {
  switch (level) {
    case 'excellent':
      return '외출하기 최고의 날씨예요!';
    case 'good':
      return '외출하기 좋은 날씨예요';
    case 'moderate':
      return '외출 시 주의가 필요해요';
    case 'poor':
      return '가급적 실내 활동을 추천해요';
  }
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

  return {
    total,
    breakdown,
    level,
    message,
  };
}
