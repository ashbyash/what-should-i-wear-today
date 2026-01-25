/**
 * 앱 전역 상수 정의
 * CLAUDE.md의 비즈니스 로직 기준값들을 한 곳에서 관리
 */

// ============================================
// 점수 가중치 (100점 만점)
// ============================================
export const SCORE_WEIGHTS = {
  TEMPERATURE: 60,  // 기온 (60%) - 기존 호환용
  FEELS_LIKE_TEMP: 55, // 체감온도 (55%)
  WEATHER: 20,      // 날씨 (20%)
  FINE_DUST: 15,    // 미세먼지 (15%)
  UV: 5,            // 자외선 (5%)
  HUMIDITY: 5,      // 습도 (5%)
  WIND_PENALTY_MAX: -10, // 풍속 페널티 최대값
} as const;

// ============================================
// 기온 점수 기준 (℃) - 기존 호환용
// ============================================
export const TEMP_SCORE = {
  // 쾌적 구간 (60점)
  IDEAL_MIN: 20,
  IDEAL_MAX: 26,
  // 양호 구간 (40점)
  GOOD_COLD_MIN: 12,
  GOOD_COLD_MAX: 19,
  GOOD_HOT_MIN: 27,
  GOOD_HOT_MAX: 32,
  // 주의 구간 (20점)
  CAUTION_COLD_MIN: 5,
  CAUTION_COLD_MAX: 11,
  CAUTION_HOT_MIN: 33,
  CAUTION_HOT_MAX: 36,
  // 그 외 (0점)
} as const;

// ============================================
// 계절별 체감온도 점수 기준 (℃) - 55점 만점
// ============================================
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export const SEASON_TEMP_RANGES = {
  // 봄/가을 (3-5월, 9-11월)
  spring: {
    ideal: { min: 15, max: 23 },      // 쾌적 (55점)
    good: { coldMin: 10, coldMax: 14, hotMin: 24, hotMax: 27 }, // 양호 (40점)
    caution: { coldMin: 5, coldMax: 9, hotMin: 28, hotMax: 32 }, // 주의 (20점)
  },
  autumn: {
    ideal: { min: 15, max: 23 },
    good: { coldMin: 10, coldMax: 14, hotMin: 24, hotMax: 27 },
    caution: { coldMin: 5, coldMax: 9, hotMin: 28, hotMax: 32 },
  },
  // 여름 (6-8월)
  summer: {
    ideal: { min: 22, max: 28 },      // 쾌적 (55점)
    good: { coldMin: 18, coldMax: 21, hotMin: 29, hotMax: 33 }, // 양호 (40점)
    caution: { coldMin: 15, coldMax: 17, hotMin: 34, hotMax: 36 }, // 주의 (20점)
  },
  // 겨울 (12-2월)
  winter: {
    ideal: { min: 0, max: 10 },       // 쾌적 (55점)
    good: { coldMin: -5, coldMax: -1, hotMin: 11, hotMax: 15 }, // 양호 (40점)
    caution: { coldMin: -10, coldMax: -6, hotMin: 16, hotMax: 20 }, // 주의 (20점)
  },
} as const;

// 월 → 계절 매핑
export const MONTH_TO_SEASON: Record<number, Season> = {
  1: 'winter', 2: 'winter', 3: 'spring',
  4: 'spring', 5: 'spring', 6: 'summer',
  7: 'summer', 8: 'summer', 9: 'autumn',
  10: 'autumn', 11: 'autumn', 12: 'winter',
};

// ============================================
// 기온별 옷차림 기준 (℃)
// ============================================
export const OUTFIT_TEMP = {
  HOT: 28,          // 28℃↑: 무더움
  WARM: 23,         // 23~27℃: 따뜻함
  MILD: 17,         // 17~22℃: 선선함
  COOL: 12,         // 12~16℃: 쌀쌀함
  COLD: 6,          // 6~11℃: 추움
  FREEZING: 0,      // 0~5℃: 매우 추움
  BITTER: -5,       // -5~-1℃: 강추위
  // -6℃↓: 혹한
} as const;

// 온도 구간 레이블 (체감 기반)
export const TEMP_ZONE_LABELS: Record<string, string> = {
  HOT: '무더움',
  WARM: '따뜻함',
  MILD: '선선함',
  COOL: '쌀쌀함',
  COLD: '추움',
  FREEZING: '매우 추움',
  BITTER: '강추위',
  EXTREME: '혹한',
} as const;

// 온도 구간별 대표 겉옷
export const TEMP_ZONE_OUTER: Record<string, string> = {
  HOT: '민소매',
  WARM: '얇은 가디건',
  MILD: '바람막이',
  COOL: '자켓',
  COLD: '코트',
  FREEZING: '패딩',
  BITTER: '롱패딩',
  EXTREME: '롱패딩',
} as const;

// ============================================
// 미세먼지 기준 (PM2.5 μg/m³)
// ============================================
export const PM25 = {
  GOOD: 15,         // 좋음: 0~15
  MODERATE: 35,     // 보통: 16~35
  BAD: 75,          // 나쁨: 36~75
  // 매우나쁨: 76↑
  MASK_THRESHOLD: 36, // 마스크 착용 권장 기준
} as const;

// ============================================
// 자외선 지수 기준
// ============================================
export const UV_INDEX = {
  LOW: 2,           // 낮음: 0~2
  MODERATE: 5,      // 보통: 3~5
  HIGH: 7,          // 높음: 6~7
  VERY_HIGH: 10,    // 매우높음: 8~10
  // 위험: 11↑
  SUNSCREEN_THRESHOLD: 6, // 선크림 권장 기준
} as const;

// ============================================
// 시간대별 UV 배율
// ============================================
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export const UV_TIME_MULTIPLIERS: Record<TimeOfDay, number> = {
  morning: 0.3,     // 아침 (6-11시): 30%
  afternoon: 1.5,   // 낮 (12-17시): 150%
  evening: 0.2,     // 저녁 (18-20시): 20%
  night: 0,         // 밤 (21-5시): 0%
} as const;

// 시간 → 시간대 매핑
export const HOUR_TO_TIME_OF_DAY: Record<number, TimeOfDay> = {
  0: 'night', 1: 'night', 2: 'night', 3: 'night', 4: 'night', 5: 'night',
  6: 'morning', 7: 'morning', 8: 'morning', 9: 'morning', 10: 'morning', 11: 'morning',
  12: 'afternoon', 13: 'afternoon', 14: 'afternoon', 15: 'afternoon', 16: 'afternoon', 17: 'afternoon',
  18: 'evening', 19: 'evening', 20: 'evening',
  21: 'night', 22: 'night', 23: 'night',
} as const;

// ============================================
// 외출 점수 레벨 기준
// ============================================
export const OUTING_LEVEL = {
  PERFECT: 90,      // 완벽
  EXCELLENT: 80,    // 최고
  GOOD: 70,         // 좋음
  FAIR: 60,         // 괜찮음
  MODERATE: 45,     // 보통
  POOR: 25,         // 나쁨
  // BAD: 0~24
} as const;

// ============================================
// 레벨별 메시지 (각 레벨당 3개, 시간 기반 랜덤 선택)
// ============================================
import type { OutingLevel } from '@/types/score';

export const LEVEL_MESSAGES: Record<OutingLevel, string[]> = {
  perfect: [
    '완벽한 외출 날씨예요!',
    '나들이 가기 딱 좋은 날이에요!',
    '이런 날씨는 흔치 않아요, 밖으로 나가세요!',
  ],
  excellent: [
    '외출하기 최고의 날씨예요',
    '밖에서 시간 보내기 좋은 날이에요',
    '야외 활동하기 아주 좋아요',
  ],
  good: [
    '외출하기 좋은 날씨예요',
    '가볍게 산책하기 좋은 날이에요',
    '외출하기 무난한 날씨예요',
  ],
  fair: [
    '외출하기 괜찮은 날씨예요',
    '나쁘지 않은 날씨예요',
    '외출해도 괜찮아요',
  ],
  moderate: [
    '외출 시 주의가 필요해요',
    '컨디션 보고 외출 결정하세요',
    '짧은 외출은 괜찮아요',
  ],
  poor: [
    '가급적 실내 활동을 추천해요',
    '꼭 필요한 외출만 하세요',
    '외출은 자제하는 게 좋겠어요',
  ],
  bad: [
    '외출을 피하는 게 좋겠어요',
    '오늘은 집에서 쉬세요',
    '외출하기 힘든 날씨예요',
  ],
} as const;

// ============================================
// 기타 임계값
// ============================================
export const THRESHOLDS = {
  TEMP_RANGE_ALERT: 10,   // 일교차 경고 기준 (℃)
  COLD_ALERT: 5,          // 방한용품 권장 기준 (℃)
  HOT_ALERT: 33,          // 수분 섭취 권장 기준 (℃)
} as const;

// ============================================
// 습도 점수 기준 (%) - 5점 만점
// ============================================
export const HUMIDITY = {
  IDEAL_MIN: 40,    // 쾌적 구간 시작
  IDEAL_MAX: 60,    // 쾌적 구간 끝
  GOOD_MIN: 30,     // 양호 구간 시작
  GOOD_MAX: 70,     // 양호 구간 끝
  // 그 외: 불쾌
} as const;

// ============================================
// 풍속 페널티 기준 (m/s)
// ============================================
export const WIND_SPEED = {
  STRONG: 8,        // 8m/s 이상: -10점
  MODERATE: 5,      // 5-7m/s: -5점
  // 5m/s 미만: 페널티 없음
} as const;

// ============================================
// 날씨 조건 (소문자)
// ============================================
export const WEATHER_CONDITIONS = {
  CLEAR: ['clear'],
  CLOUDY: ['clouds', 'cloudy'],
  OVERCAST: ['overcast', 'mist', 'fog', 'haze'],
  RAINY: ['rain', 'drizzle', 'shower', 'thunderstorm'],
  SNOWY: ['snow'],
} as const;

// ============================================
// 캐시 설정
// ============================================
export const CACHE = {
  TTL: 5 * 60 * 1000, // 5분
} as const;
