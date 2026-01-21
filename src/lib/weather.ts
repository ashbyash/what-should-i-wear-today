import type {
  WeatherResponse,
  AirQualityResponse,
  WeatherData,
  AirQualityData,
  LocationParams,
} from '@/types/weather';

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function fetchCurrentWeather(
  params: LocationParams,
  apiKey: string
): Promise<WeatherResponse> {
  const url = `${OPENWEATHER_BASE_URL}/weather?lat=${params.lat}&lon=${params.lon}&appid=${apiKey}&units=metric&lang=kr`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchAirQuality(
  params: LocationParams,
  apiKey: string
): Promise<AirQualityResponse> {
  const url = `${OPENWEATHER_BASE_URL}/air_pollution?lat=${params.lat}&lon=${params.lon}&appid=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Air Quality API error: ${response.status}`);
  }

  return response.json();
}

export function parseWeatherData(raw: WeatherResponse): WeatherData {
  return {
    temperature: Math.round(raw.main.temp),
    feelsLike: Math.round(raw.main.feels_like),
    tempMin: Math.round(raw.main.temp_min),
    tempMax: Math.round(raw.main.temp_max),
    humidity: raw.main.humidity,
    weatherMain: raw.weather[0]?.main ?? 'Unknown',
    weatherDescription: raw.weather[0]?.description ?? '',
    weatherIcon: raw.weather[0]?.icon ?? '',
    windSpeed: raw.wind.speed,
    cloudiness: raw.clouds.all,
    locationName: raw.name,
  };
}

export function parseAirQualityData(raw: AirQualityResponse): AirQualityData {
  const data = raw.list[0];
  const aqi = data.main.aqi;

  // AQI level mapping based on PM2.5 (WHO standards)
  // PM2.5: 0-15 good, 16-35 moderate, 36-75 bad, 76+ very bad
  const pm25 = data.components.pm2_5;
  let aqiLevel: AirQualityData['aqiLevel'];

  if (pm25 <= 15) {
    aqiLevel = 'good';
  } else if (pm25 <= 35) {
    aqiLevel = 'moderate';
  } else if (pm25 <= 75) {
    aqiLevel = 'bad';
  } else {
    aqiLevel = 'very_bad';
  }

  return {
    aqi,
    aqiLevel,
    pm25: Math.round(data.components.pm2_5),
    pm10: Math.round(data.components.pm10),
  };
}
