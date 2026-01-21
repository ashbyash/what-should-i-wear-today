'use client';

import LocationHeader from '@/components/LocationHeader';
import ScoreGauge from '@/components/ScoreGauge';
import OutfitCard from '@/components/OutfitCard';
import WeatherCard from '@/components/WeatherCard';
import AirQualityCard from '@/components/AirQualityCard';
import type { OutingScore, OutfitRecommendation } from '@/types/score';
import type { WeatherData, AirQualityData } from '@/types/weather';

// 임시 mock 데이터 (API 연동 전 테스트용)
const mockWeather: WeatherData = {
  temperature: 22,
  feelsLike: 20,
  tempMin: 15,
  tempMax: 26,
  humidity: 45,
  weatherMain: 'Clear',
  weatherDescription: '맑음',
  weatherIcon: '01d',
  windSpeed: 3.5,
  cloudiness: 10,
  locationName: '서울특별시',
};

const mockAirQuality: AirQualityData = {
  aqi: 2,
  aqiLevel: 'good',
  pm25: 12,
  pm10: 25,
};

const mockScore: OutingScore = {
  total: 85,
  breakdown: {
    temperature: 30,
    fineDust: 30,
    weather: 25,
    uv: 10,
  },
  level: 'excellent',
  message: '외출하기 최고의 날씨예요!',
};

const mockOutfit: OutfitRecommendation = {
  clothes: ['얇은 가디건', '맨투맨', '긴팔티'],
  alerts: ['겉옷 챙기세요'],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-md mx-auto px-4 pb-8">
        {/* 위치 */}
        <LocationHeader locationName={mockWeather.locationName} />

        {/* 외출 점수 */}
        <ScoreGauge score={mockScore} />

        {/* 옷차림 추천 */}
        <div className="mt-4">
          <OutfitCard outfit={mockOutfit} />
        </div>

        {/* 날씨/온도 */}
        <div className="mt-4">
          <WeatherCard weather={mockWeather} />
        </div>

        {/* 미세먼지 + 자외선 */}
        <div className="mt-4">
          <AirQualityCard airQuality={mockAirQuality} uvIndex={4} />
        </div>
      </div>
    </div>
  );
}
