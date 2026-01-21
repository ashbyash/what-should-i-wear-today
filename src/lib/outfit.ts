import type { OutfitInput, OutfitRecommendation } from '@/types/score';

// 온도별 옷차림 추천
function getClothesForTemp(temp: number): string[] {
  if (temp >= 30) {
    return ['민소매', '반팔', '반바지', '린넨'];
  }
  if (temp >= 26) {
    return ['반팔', '얇은 셔츠', '면바지'];
  }
  if (temp >= 20) {
    return ['얇은 가디건', '맨투맨', '긴팔티'];
  }
  if (temp >= 12) {
    return ['자켓', '가디건', '니트', '청바지'];
  }
  if (temp >= 5) {
    return ['코트', '가죽자켓', '히트텍'];
  }
  return ['패딩', '두꺼운 코트', '목도리'];
}

// 일교차 체크
function checkTempRange(tempMin: number, tempMax: number): string | null {
  const range = tempMax - tempMin;
  if (range >= 10) {
    return '겉옷 챙기세요';
  }
  return null;
}

// 미세먼지 체크
function checkFineDust(pm25: number): string | null {
  if (pm25 >= 36) {
    return '마스크 착용 권장';
  }
  return null;
}

// 옷차림 추천 메인 함수
export function getOutfitRecommendation(input: OutfitInput): OutfitRecommendation {
  const clothes = getClothesForTemp(input.temperature);
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
    clothes,
    alerts,
  };
}
