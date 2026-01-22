'use client';

import LocationHeader from '@/components/LocationHeader';
import ScoreGauge from '@/components/ScoreGauge';
import OutfitCard from '@/components/OutfitCard';
import WeatherCard from '@/components/WeatherCard';
import AirQualityCard from '@/components/AirQualityCard';
import { useGeolocation } from '@/lib/geolocation';
import { useWeatherData } from '@/lib/useWeatherData';
import { calculateOutingScore } from '@/lib/score';
import { getOutfitRecommendation } from '@/lib/outfit';
import type { WeatherData, AirQualityData } from '@/types/weather';

export default function Home() {
  const { coordinates, loading: geoLoading, error: geoError } = useGeolocation();
  const { weather, airQuality, uv, loading: dataLoading, error: dataError } = useWeatherData(coordinates);

  // 위치 로딩 중
  if (geoLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">위치를 확인하고 있어요...</p>
        </div>
      </div>
    );
  }

  // 위치 에러
  if (geoError) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-4">📍</div>
          <p className="text-error font-medium">{geoError}</p>
          <p className="mt-2 text-base-content/70 text-sm">
            위치 권한을 허용해주세요.
          </p>
        </div>
      </div>
    );
  }

  // 데이터 로딩 중
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">날씨 정보를 가져오고 있어요...</p>
        </div>
      </div>
    );
  }

  // 데이터 에러
  if (dataError || !weather) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-4">🌧️</div>
          <p className="text-error font-medium">{dataError || '날씨 정보를 가져올 수 없습니다.'}</p>
          <p className="mt-2 text-base-content/70 text-sm">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  // API 데이터 → 컴포넌트 데이터 변환
  const weatherData: WeatherData = {
    temperature: weather.temperature,
    feelsLike: weather.temperature,
    tempMin: weather.tempMin ?? weather.temperature - 5,
    tempMax: weather.tempMax ?? weather.temperature + 5,
    humidity: weather.humidity,
    weatherMain: weather.sky,
    weatherDescription: weather.skyDescription,
    weatherIcon: '',
    windSpeed: weather.windSpeed,
    cloudiness: 0,
    locationName: airQuality?.stationName ?? '현재 위치',
  };

  const airQualityData: AirQualityData = {
    aqi: 0,
    aqiLevel: airQuality?.pm25Grade ?? 'moderate',
    pm25: airQuality?.pm25 ?? 0,
    pm10: airQuality?.pm10 ?? 0,
  };

  // 점수 계산
  const score = calculateOutingScore({
    temperature: weatherData.temperature,
    pm25: airQualityData.pm25,
    weatherMain: weatherData.weatherMain,
    uvIndex: uv?.uvIndex,
  });

  // 옷차림 추천
  const outfit = getOutfitRecommendation({
    temperature: weatherData.temperature,
    tempMin: weatherData.tempMin,
    tempMax: weatherData.tempMax,
    pm25: airQualityData.pm25,
    weatherMain: weatherData.weatherMain,
  });

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-md mx-auto px-4 pb-8">
        {/* 위치 */}
        <LocationHeader locationName={weatherData.locationName} />

        {/* 외출 점수 */}
        <ScoreGauge score={score} />

        {/* 옷차림 추천 */}
        <div className="mt-4">
          <OutfitCard outfit={outfit} />
        </div>

        {/* 날씨/온도 */}
        <div className="mt-4">
          <WeatherCard weather={weatherData} />
        </div>

        {/* 미세먼지 + 자외선 */}
        <div className="mt-4">
          <AirQualityCard airQuality={airQualityData} uvIndex={uv?.uvIndex} />
        </div>
      </div>
    </div>
  );
}
