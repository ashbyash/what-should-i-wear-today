/**
 * 서버 컴포넌트용 날씨 데이터 fetch 함수
 * ISR 빌드 시점 및 revalidate 시점에 호출
 */

import { fetchKmaCurrentWeather, fetchKmaForecastWeather, fetchUVIndex, fetchKmaHourlyForecast } from './kma-api';
import { fetchLocation } from './kakao-api';
import { fetchAirKorea } from './airkorea-api';
import { fetchOpenMeteoWeather, fetchOpenMeteoHourly } from './open-meteo-api';
import { isKoreaCoordinates } from './cities';
import type { InitialWeatherData } from '@/types/weather';

/**
 * 서버에서 초기 날씨 데이터를 병렬로 fetch
 * Promise.allSettled로 개별 API 실패해도 다른 데이터는 반환
 * 해외 좌표면 Open-Meteo, 한국이면 KMA/AirKorea/Kakao
 */
export async function fetchInitialWeatherData(
  lat: number,
  lon: number
): Promise<InitialWeatherData> {
  // 해외 좌표 → Open-Meteo API
  if (!isKoreaCoordinates(lat, lon)) {
    const [weatherResult, hourlyResult] = await Promise.allSettled([
      fetchOpenMeteoWeather(lat, lon),
      fetchOpenMeteoHourly(lat, lon),
    ]);
    const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : {
      current: null, forecast: null, location: null, airQuality: null, uv: null,
    };
    weather.hourly = hourlyResult.status === 'fulfilled' ? hourlyResult.value : null;
    return weather;
  }

  // 한국 좌표 → 기존 KMA/AirKorea/Kakao API
  const kmaApiKey = process.env.KMA_API_KEY;
  const kmaApihubAuthKey = process.env.KMA_APIHUB_AUTH_KEY;
  const kakaoApiKey = process.env.KAKAO_REST_API_KEY;
  const airkoreaApiKey = process.env.AIRKOREA_API_KEY;

  if (!kmaApiKey || !kakaoApiKey || !airkoreaApiKey) {
    console.error('Missing API keys for server weather fetch');
    return {
      current: null,
      forecast: null,
      location: null,
      airQuality: null,
      uv: null,
      hourly: null,
    };
  }

  const [currentResult, forecastResult, locationResult, airQualityResult, uvResult, hourlyResult] =
    await Promise.allSettled([
      fetchKmaCurrentWeather(lat, lon, kmaApiKey, kmaApihubAuthKey),
      fetchKmaForecastWeather(lat, lon, kmaApiKey),
      fetchLocation(lat, lon, kakaoApiKey),
      fetchAirKorea(lat, lon, airkoreaApiKey),
      fetchUVIndex(lat, lon, kmaApiKey),
      fetchKmaHourlyForecast(lat, lon, kmaApiKey),
    ]);

  return {
    current: currentResult.status === 'fulfilled' ? currentResult.value : null,
    forecast: forecastResult.status === 'fulfilled' ? forecastResult.value : null,
    location: locationResult.status === 'fulfilled' ? locationResult.value : null,
    airQuality: airQualityResult.status === 'fulfilled' ? airQualityResult.value : null,
    uv: uvResult.status === 'fulfilled' ? uvResult.value : null,
    hourly: hourlyResult.status === 'fulfilled' ? hourlyResult.value : null,
  };
}
