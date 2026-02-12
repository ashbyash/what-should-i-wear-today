/**
 * Open-Meteo API 연동 (해외 도시용)
 * - 무료, API 키 불필요
 * - InitialWeatherData와 동일한 shape 반환
 */

import type { InitialWeatherData, HourlyForecastItem } from '@/types/weather';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';
const OPEN_METEO_AQ_BASE = 'https://air-quality-api.open-meteo.com/v1';
const FETCH_TIMEOUT = 5000;

// WMO Weather Code → weatherMain 매핑
function wmoCodeToWeatherMain(code: number): string {
  // https://open-meteo.com/en/docs → WMO Weather interpretation codes
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Clouds';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Shower';
  if (code >= 85 && code <= 86) return 'Snow';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Clouds';
}

function wmoCodeToDescription(code: number): string {
  if (code === 0) return '맑음';
  if (code <= 2) return '구름 조금';
  if (code === 3) return '흐림';
  if (code >= 45 && code <= 48) return '안개';
  if (code >= 51 && code <= 55) return '이슬비';
  if (code === 56 || code === 57) return '얼어붙는 이슬비';
  if (code >= 61 && code <= 65) return '비';
  if (code === 66 || code === 67) return '얼어붙는 비';
  if (code >= 71 && code <= 75) return '눈';
  if (code === 77) return '싸락눈';
  if (code >= 80 && code <= 82) return '소나기';
  if (code >= 85 && code <= 86) return '눈보라';
  if (code >= 95 && code <= 99) return '뇌우';
  return '흐림';
}

// PM2.5 등급 판정
function getPm25Grade(pm25: number): 'good' | 'moderate' | 'bad' | 'very_bad' {
  if (pm25 <= 15) return 'good';
  if (pm25 <= 35) return 'moderate';
  if (pm25 <= 75) return 'bad';
  return 'very_bad';
}

function getPm10Grade(pm10: number): 'good' | 'moderate' | 'bad' | 'very_bad' {
  if (pm10 <= 30) return 'good';
  if (pm10 <= 80) return 'moderate';
  if (pm10 <= 150) return 'bad';
  return 'very_bad';
}

// UV 레벨 판정
function getUvLevel(uvIndex: number): 'low' | 'moderate' | 'high' | 'very_high' | 'danger' {
  if (uvIndex <= 2) return 'low';
  if (uvIndex <= 5) return 'moderate';
  if (uvIndex <= 7) return 'high';
  if (uvIndex <= 10) return 'very_high';
  return 'danger';
}

function getUvDescription(level: string): string {
  switch (level) {
    case 'low': return '낮음';
    case 'moderate': return '보통';
    case 'high': return '높음';
    case 'very_high': return '매우 높음';
    case 'danger': return '위험';
    default: return '보통';
  }
}

// 타임아웃 fetch
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 현재 날씨 데이터 (기온, 습도, 풍속, 날씨코드)
 * KMA의 fetchKmaCurrentWeather 대응
 */
export async function fetchOpenMeteoCurrent(lat: number, lon: number) {
  const url = `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Open-Meteo current API error: ${res.status}`);
  const data = await res.json();

  const current = data.current;
  const weatherCode = current.weather_code ?? 0;
  const weatherMain = wmoCodeToWeatherMain(weatherCode);

  return {
    temperature: Math.round(current.temperature_2m),
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round((current.wind_speed_10m / 3.6) * 10) / 10, // km/h → m/s
    precipitation: ['Rain', 'Drizzle', 'Shower', 'Thunderstorm'].includes(weatherMain) ? weatherMain : '',
    precipitationDescription: ['Rain', 'Drizzle', 'Shower', 'Thunderstorm'].includes(weatherMain) ? wmoCodeToDescription(weatherCode) : '',
    sky: weatherMain,
    skyDescription: wmoCodeToDescription(weatherCode),
  };
}

/**
 * 예보 데이터 (최저/최고 기온)
 * KMA의 fetchKmaForecastWeather 대응
 */
export async function fetchOpenMeteoForecast(lat: number, lon: number) {
  const url = `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Open-Meteo forecast API error: ${res.status}`);
  const data = await res.json();

  const daily = data.daily;
  return {
    tempMin: daily.temperature_2m_min?.[0] != null ? Math.round(daily.temperature_2m_min[0]) : null,
    tempMax: daily.temperature_2m_max?.[0] != null ? Math.round(daily.temperature_2m_max[0]) : null,
    sky: 'Clear',
    skyDescription: '맑음',
  };
}

/**
 * 대기질 데이터 (PM2.5, PM10)
 * AirKorea의 fetchAirKorea 대응
 */
export async function fetchOpenMeteoAirQuality(lat: number, lon: number) {
  const url = `${OPEN_METEO_AQ_BASE}/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Open-Meteo air quality API error: ${res.status}`);
  const data = await res.json();

  const current = data.current;
  const pm25 = Math.round(current.pm2_5 ?? 0);
  const pm10 = Math.round(current.pm10 ?? 0);

  return {
    stationName: 'Open-Meteo',
    stationAddr: '',
    pm10,
    pm25,
    pm10Grade: getPm10Grade(pm10),
    pm25Grade: getPm25Grade(pm25),
    dataTime: new Date().toISOString(),
  };
}

/**
 * UV 지수 데이터
 * KMA의 fetchUVIndex 대응
 */
export async function fetchOpenMeteoUV(lat: number, lon: number) {
  const url = `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&current=uv_index&timezone=auto`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Open-Meteo UV API error: ${res.status}`);
  const data = await res.json();

  const uvIndex = Math.round(data.current.uv_index ?? 0);
  const uvLevel = getUvLevel(uvIndex);

  return {
    uvIndex,
    uvLevel,
    uvDescription: getUvDescription(uvLevel),
  };
}

/**
 * 시간별 예보 데이터 (36시간)
 * timezone=auto로 현지 시간 자동 반환
 */
export async function fetchOpenMeteoHourly(lat: number, lon: number): Promise<HourlyForecastItem[]> {
  const url = `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code,precipitation_probability&forecast_hours=36&timezone=auto`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Open-Meteo hourly API error: ${res.status}`);
  const data = await res.json();

  const hourly = data.hourly;
  if (!hourly?.time || !hourly?.temperature_2m || !hourly?.weather_code) {
    return [];
  }

  const result: HourlyForecastItem[] = [];
  for (let i = 0; i < hourly.time.length; i++) {
    const timeStr: string = hourly.time[i];
    const parts = timeStr.split('T');
    const date = parts[0];
    const hour = parts[1]?.substring(0, 2);
    if (!hour) continue;

    result.push({
      time: `${hour}:00`,
      temperature: Math.round(hourly.temperature_2m[i]),
      weatherMain: wmoCodeToWeatherMain(hourly.weather_code[i]),
      date,
      precipitationProbability: hourly.precipitation_probability?.[i],
    });
  }

  return result;
}

/**
 * 통합 해외 날씨 데이터 fetch (서버 컴포넌트용)
 * server-weather.ts의 fetchInitialWeatherData 대응
 * Promise.allSettled로 개별 API 실패해도 다른 데이터 반환
 */
export async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<InitialWeatherData> {
  const [currentResult, forecastResult, airQualityResult, uvResult] =
    await Promise.allSettled([
      fetchOpenMeteoCurrent(lat, lon),
      fetchOpenMeteoForecast(lat, lon),
      fetchOpenMeteoAirQuality(lat, lon),
      fetchOpenMeteoUV(lat, lon),
    ]);

  // current + forecast 합치기
  const current = currentResult.status === 'fulfilled' ? currentResult.value : null;
  const forecast = forecastResult.status === 'fulfilled' ? forecastResult.value : null;

  return {
    current: current ? {
      temperature: current.temperature,
      humidity: current.humidity,
      windSpeed: current.windSpeed,
      precipitation: current.precipitation,
      precipitationDescription: current.precipitationDescription,
    } : null,
    forecast: forecast ? {
      tempMin: forecast.tempMin,
      tempMax: forecast.tempMax,
      sky: current?.sky ?? forecast.sky,
      skyDescription: current?.skyDescription ?? forecast.skyDescription,
    } : null,
    location: null, // 해외는 CityData에서 직접 표시
    airQuality: airQualityResult.status === 'fulfilled' ? airQualityResult.value : null,
    uv: uvResult.status === 'fulfilled' ? uvResult.value : null,
  };
}
