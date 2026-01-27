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

// 통합 검색 결과 타입
export interface SearchResult {
  type: 'predefined' | 'kakao';
  name: string;
  description: string;
  lat: number;
  lon: number;
  nameEn?: string; // predefined만
  slug?: string; // predefined만
}
