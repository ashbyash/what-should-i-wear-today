import type { OutfitInput, OutfitRecommendation, OutfitByCategory } from '@/types/score';
import { OUTFIT_TEMP, PM25, THRESHOLDS, WEATHER_CONDITIONS, TEMP_ZONE_OUTER } from './constants';
import { getFeelsLikeTemp } from './score';

// 마지막 글자 받침 여부 확인
function hasEndConsonant(word: string): boolean {
  const lastChar = word.charCodeAt(word.length - 1);
  return (lastChar - 0xac00) % 28 !== 0;
}

// 온도 → 구간 키 반환
function getTempZoneKey(temp: number): string {
  if (temp >= OUTFIT_TEMP.HOT) return 'HOT';
  if (temp >= OUTFIT_TEMP.WARM) return 'WARM';
  if (temp >= OUTFIT_TEMP.MILD) return 'MILD';
  if (temp >= OUTFIT_TEMP.COOL) return 'COOL';
  if (temp >= OUTFIT_TEMP.COLD) return 'COLD';
  if (temp >= OUTFIT_TEMP.FREEZING) return 'FREEZING';
  if (temp >= OUTFIT_TEMP.BITTER) return 'BITTER';
  return 'EXTREME';
}

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
  // 0~5℃ (겨울)
  if (temp >= OUTFIT_TEMP.FREEZING) {
    return {
      outer: ['다운 패딩', '울 코트'],
      top: ['기모 맨투맨', '울 니트', '히트텍'],
      bottom: ['기모 바지', '코듀로이 팬츠'],
      shoes: ['부츠', '가죽 스니커즈'],
      accessory: ['목도리', '장갑'],
    };
  }
  // -5~-1℃ (한겨울)
  if (temp >= OUTFIT_TEMP.BITTER) {
    return {
      outer: ['다운 롱패딩', '헤비 울 코트'],
      top: ['기모 맨투맨', '울 니트', '히트텍'],
      bottom: ['기모 바지', '두꺼운 코듀로이'],
      shoes: ['방한 부츠', '부츠'],
      accessory: ['두꺼운 목도리', '장갑', '비니'],
    };
  }
  // -6℃ 이하 (혹한)
  return {
    outer: ['다운 롱패딩', '헤비 다운'],
    top: ['히트텍', '기모 맨투맨', '울 니트'],
    bottom: ['기모 바지', '방한 팬츠'],
    shoes: ['방한 부츠'],
    accessory: ['두꺼운 목도리', '방한 장갑', '비니', '귀마개'],
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

// 일교차 체크 (시간대별 추천 포함)
function checkTempRange(tempMin: number, tempMax: number): string | null {
  const range = tempMax - tempMin;
  if (range < THRESHOLDS.TEMP_RANGE_ALERT) {
    return null;
  }

  // 아침(최저)과 낮(최고) 온도 구간 확인
  const minZone = getTempZoneKey(tempMin);
  const maxZone = getTempZoneKey(tempMax);

  // 아침(최저)과 낮(최고)의 대표 겉옷 확인
  const minOuter = TEMP_ZONE_OUTER[minZone];
  const maxOuter = TEMP_ZONE_OUTER[maxZone];

  // 겉옷이 다르면 시간대별 알림
  if (minOuter !== maxOuter) {
    const suffix = hasEndConsonant(maxOuter) ? '이면' : '면';
    return `아침엔 ${minOuter}, 낮엔 ${maxOuter}${suffix} 충분해요`;
  }

  // 겉옷이 같으면 극한 날씨 체크
  const coldZones = ['BITTER', 'EXTREME'];
  const hotZones = ['HOT'];

  if (coldZones.includes(minZone) && coldZones.includes(maxZone)) {
    return '종일 강추위예요, 방한에 신경 쓰세요';
  }
  if (hotZones.includes(minZone) && hotZones.includes(maxZone)) {
    return '종일 더워요, 시원하게 입으세요';
  }

  // 그 외 겉옷이 같은 경우
  const suffix = hasEndConsonant(minOuter) ? '이' : '';
  return `하루 종일 ${minOuter}${suffix} 필요해요`;
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

// 체감온도 알림 체크
function checkFeelsLikeTemp(
  temperature: number,
  feelsLike: number,
  windSpeed?: number
): string | null {
  const diff = temperature - feelsLike;

  // 체감온도가 5도 이상 낮을 때 (바람으로 인한 경우)
  if (diff >= 5 && windSpeed && windSpeed >= 3) {
    return '바람이 강해서 체감온도가 낮아요';
  }
  // 체감온도가 3도 이상 높을 때 (습도로 인한 경우)
  if (diff <= -3) {
    return '습도가 높아서 더 덥게 느껴져요';
  }
  return null;
}

// 옷차림 추천 메인 함수
export function getOutfitRecommendation(input: OutfitInput): OutfitRecommendation {
  // 체감온도 계산
  const feelsLike = getFeelsLikeTemp(input.temperature, input.windSpeed, input.humidity);

  // 체감온도 기반으로 옷차림 추천
  const baseClothes = getClothesForTemp(feelsLike);
  const rainGear = getRainGear(input.weatherMain);

  const categories = mergeCategories(baseClothes, rainGear);

  const alerts: string[] = [];

  // 체감온도 알림 (가장 먼저 표시)
  const feelsLikeAlert = checkFeelsLikeTemp(input.temperature, feelsLike, input.windSpeed);
  if (feelsLikeAlert) {
    alerts.push(feelsLikeAlert);
  }

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
