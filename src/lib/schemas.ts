import { z } from 'zod';

/**
 * API 응답 Zod 스키마
 * 런타임 타입 검증 및 타입 추론
 */

// ============================================
// 클라이언트 API 응답 스키마 (가공된 데이터)
// ============================================

/**
 * 기상청 날씨 데이터 (가공됨)
 */
export const KmaWeatherDataSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  windSpeed: z.number(),
  sky: z.string(),
  skyDescription: z.string(),
  precipitation: z.string(),
  precipitationDescription: z.string(),
  tempMin: z.number().nullable(),
  tempMax: z.number().nullable(),
});

/**
 * 에어코리아 대기질 데이터 (가공됨)
 */
const AirGradeSchema = z.enum(['good', 'moderate', 'bad', 'very_bad']);

export const AirKoreaDataSchema = z.object({
  stationName: z.string(),
  stationAddr: z.string(),
  pm10: z.number(),
  pm25: z.number(),
  pm10Grade: AirGradeSchema,
  pm25Grade: AirGradeSchema,
  dataTime: z.string(),
});

/**
 * 자외선 지수 데이터 (가공됨)
 */
const UVLevelSchema = z.enum(['low', 'moderate', 'high', 'very_high', 'danger']);

export const UVIndexDataSchema = z.object({
  uvIndex: z.number(),
  uvLevel: UVLevelSchema,
  uvDescription: z.string(),
});

/**
 * 위치 데이터 (역지오코딩 결과)
 */
export const LocationDataSchema = z.object({
  address: z.string(),
  region1: z.string(),
  region2: z.string(),
  region3: z.string(),
});

// ============================================
// 타입 추론
// ============================================
export type KmaWeatherData = z.infer<typeof KmaWeatherDataSchema>;
export type AirKoreaData = z.infer<typeof AirKoreaDataSchema>;
export type UVIndexData = z.infer<typeof UVIndexDataSchema>;
export type LocationData = z.infer<typeof LocationDataSchema>;

// ============================================
// Safe Parse 헬퍼 (검증 실패 시 null 반환)
// ============================================
export function safeParseWeather(data: unknown): KmaWeatherData | null {
  const result = KmaWeatherDataSchema.safeParse(data);
  return result.success ? result.data : null;
}

export function safeParseAirKorea(data: unknown): AirKoreaData | null {
  const result = AirKoreaDataSchema.safeParse(data);
  return result.success ? result.data : null;
}

export function safeParseUVIndex(data: unknown): UVIndexData | null {
  const result = UVIndexDataSchema.safeParse(data);
  return result.success ? result.data : null;
}

export function safeParseLocation(data: unknown): LocationData | null {
  const result = LocationDataSchema.safeParse(data);
  return result.success ? result.data : null;
}
