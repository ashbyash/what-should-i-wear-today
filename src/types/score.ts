// 각 요소별 점수
export interface ScoreBreakdown {
  temperature: number; // 0-60
  weather: number; // 0-20
  fineDust: number; // 0-15
  uv: number; // 0-5
}

// 외출 점수 레벨 (7단계)
export type OutingLevel = 'perfect' | 'excellent' | 'good' | 'fair' | 'moderate' | 'poor' | 'bad';

// 외출 점수 결과
export interface OutingScore {
  total: number; // 0-100
  breakdown: ScoreBreakdown;
  level: OutingLevel;
  message: string;
  tips: string[]; // 상황별 팁 메시지
}

// 카테고리별 옷차림
export interface OutfitByCategory {
  outer?: string[];      // 아우터
  top?: string[];        // 상의
  bottom?: string[];     // 하의
  shoes?: string[];      // 신발
  accessory?: string[];  // 악세서리 (방한용품 등)
}

// 옷차림 추천 결과
export interface OutfitRecommendation {
  categories: OutfitByCategory;
  alerts: string[];
}

// 점수 계산에 필요한 입력값
export interface ScoreInput {
  temperature: number;
  tempMin: number;
  tempMax: number;
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
  weatherMain: string;
}
