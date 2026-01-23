import type { OutfitInput, OutfitRecommendation, OutfitByCategory } from '@/types/score';
import { OUTFIT_TEMP, PM25, THRESHOLDS, WEATHER_CONDITIONS } from './constants';

// 온도별 옷차림 추천 (카테고리별)
function getClothesForTemp(temp: number): OutfitByCategory {
  // 28℃ 이상 (한여름)
  if (temp >= OUTFIT_TEMP.HOT) {
    return {
      top: ['린넨 반팔 셔츠', '면 민소매'],
      bottom: ['면 반바지', '린넨 반바지'],
      shoes: ['샌들', '캔버스 스니커즈'],
    };
  }
  // 23~27℃ (초여름/초가을)
  if (temp >= OUTFIT_TEMP.WARM) {
    return {
      outer: ['얇은 가디건'],
      top: ['면 반팔 티셔츠', '샴브레이 반팔 셔츠'],
      bottom: ['얇은 면바지', '면 슬랙스'],
      shoes: ['캔버스 스니커즈', '로퍼'],
    };
  }
  // 17~22℃ (봄/가을)
  if (temp >= OUTFIT_TEMP.MILD) {
    return {
      outer: ['나일론 바람막이', '면 가디건'],
      top: ['면 긴팔 티셔츠', '얇은 맨투맨'],
      bottom: ['청바지', '면바지'],
      shoes: ['스니커즈', '로퍼'],
    };
  }
  // 12~16℃ (환절기)
  if (temp >= OUTFIT_TEMP.COOL) {
    return {
      outer: ['면 자켓', '니트 가디건'],
      top: ['쭈리 맨투맨', '울 니트'],
      bottom: ['청바지', '슬랙스'],
      shoes: ['가죽 스니커즈', '더비슈즈'],
    };
  }
  // 6~11℃ (초겨울)
  if (temp >= OUTFIT_TEMP.COLD) {
    return {
      outer: ['울 코트', '가죽자켓'],
      top: ['기모 맨투맨', '플란넬 셔츠', '울 니트'],
      bottom: ['두꺼운 슬랙스', '코듀로이 팬츠'],
      shoes: ['가죽 스니커즈', '부츠'],
      accessory: ['목도리'],
    };
  }
  // 5℃ 이하 (한겨울)
  return {
    outer: ['다운 롱패딩', '울 코트'],
    top: ['기모 맨투맨', '울 니트', '기모 셔츠'],
    bottom: ['기모 바지', '코듀로이 팬츠'],
    shoes: ['부츠', '방한 부츠'],
    accessory: ['목도리', '장갑', '비니'],
  };
}

// 비 상황 체크
function getRainGear(weatherMain: string): Partial<OutfitByCategory> {
  const weather = weatherMain.toLowerCase();
  if (WEATHER_CONDITIONS.RAINY.some((w) => weather === w)) {
    return {
      outer: ['방수 자켓'],
      shoes: ['레인부츠'],
    };
  }
  return {};
}

// 일교차 체크
function checkTempRange(tempMin: number, tempMax: number): string | null {
  const range = tempMax - tempMin;
  if (range >= THRESHOLDS.TEMP_RANGE_ALERT) {
    return '일교차가 커요, 겉옷 챙기세요';
  }
  return null;
}

// 미세먼지 체크
function checkFineDust(pm25: number): string | null {
  if (pm25 >= PM25.MASK_THRESHOLD) {
    return '마스크 착용 권장';
  }
  return null;
}

// 카테고리 병합 (비 상황 등 추가 아이템)
function mergeCategories(base: OutfitByCategory, additional: Partial<OutfitByCategory>): OutfitByCategory {
  const result = { ...base };

  for (const key of Object.keys(additional) as (keyof OutfitByCategory)[]) {
    const addItems = additional[key];
    if (addItems && addItems.length > 0) {
      result[key] = [...(result[key] || []), ...addItems];
    }
  }

  return result;
}

// 옷차림 추천 메인 함수
export function getOutfitRecommendation(input: OutfitInput): OutfitRecommendation {
  const baseClothes = getClothesForTemp(input.temperature);
  const rainGear = getRainGear(input.weatherMain);

  const categories = mergeCategories(baseClothes, rainGear);

  const alerts: string[] = [];

  const tempAlert = checkTempRange(input.tempMin, input.tempMax);
  if (tempAlert) {
    alerts.push(tempAlert);
  }

  const dustAlert = checkFineDust(input.pm25);
  if (dustAlert) {
    alerts.push(dustAlert);
  }

  return {
    categories,
    alerts,
  };
}
