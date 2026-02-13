// 카카오 로컬 검색 API 응답 타입
export interface KakaoPlace {
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  category_name: string;
}

export interface KakaoPlaceResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

// Open-Meteo Geocoding API 응답 타입
export interface OpenMeteoResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
}

export interface OpenMeteoSearchResponse {
  results?: OpenMeteoResult[];
}

// 통합 검색 결과 타입
export interface SearchResult {
  type: 'predefined' | 'kakao' | 'openmeteo';
  name: string;
  description: string;
  lat: number;
  lon: number;
  nameEn?: string; // predefined만
  slug?: string; // predefined만
  country?: string; // openmeteo만
  isOverseas?: boolean; // predefined overseas + openmeteo = true
}
