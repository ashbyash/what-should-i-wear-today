// 각 요소별 점수
export interface ScoreBreakdown {
  temperature: number; // 0-30
  fineDust: number; // 0-30
  weather: number; // 0-25
  uv: number; // 0-15
}

// 외출 점수 레벨
export type OutingLevel = 'excellent' | 'good' | 'moderate' | 'poor';

// 외출 점수 결과
export interface OutingScore {
  total: number; // 0-100
  breakdown: ScoreBreakdown;
  level: OutingLevel;
  message: string;
}

// 옷차림 추천 결과
export interface OutfitRecommendation {
  clothes: string[];
  alerts: string[];
}

// 점수 계산에 필요한 입력값
export interface ScoreInput {
  temperature: number;
  pm25: number;
  weatherMain: string;
  uvIndex?: number;
}

// 옷차림 추천에 필요한 입력값
export interface OutfitInput {
  temperature: number;
  tempMin: number;
  tempMax: number;
  pm25: number;
}
