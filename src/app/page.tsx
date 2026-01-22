'use client';

import LocationHeader from '@/components/LocationHeader';
import ScoreGauge from '@/components/ScoreGauge';
import OutfitCard from '@/components/OutfitCard';
import WeatherCard from '@/components/WeatherCard';
import DustCard from '@/components/DustCard';
import UvCard from '@/components/UvCard';
import { useGeolocation } from '@/lib/geolocation';
import { useWeatherData } from '@/lib/useWeatherData';
import { calculateOutingScore } from '@/lib/score';
import { getOutfitRecommendation } from '@/lib/outfit';
import type { WeatherData, AirQualityData } from '@/types/weather';

interface WeatherTheme {
  bgClass: string;
  isLight: boolean;
}

function getWeatherTheme(weatherMain: string): WeatherTheme {
  const weather = weatherMain.toLowerCase();
  switch (weather) {
    case 'clear':
      return { bgClass: 'bg-gradient-to-b from-sky-400 to-blue-500', isLight: false };
    case 'clouds':
      return { bgClass: 'bg-gradient-to-b from-slate-400 to-slate-500', isLight: false };
    case 'rain':
    case 'drizzle':
      return { bgClass: 'bg-gradient-to-b from-slate-500 to-blue-600', isLight: false };
    case 'thunderstorm':
      return { bgClass: 'bg-gradient-to-b from-slate-600 to-gray-700', isLight: false };
    case 'snow':
      return { bgClass: 'bg-gradient-to-b from-slate-300 to-blue-400', isLight: true };
    case 'mist':
    case 'fog':
    case 'haze':
      return { bgClass: 'bg-gradient-to-b from-gray-400 to-slate-500', isLight: false };
    default:
      return { bgClass: 'bg-gradient-to-b from-sky-400 to-blue-500', isLight: false };
  }
}

export default function Home() {
  const { coordinates, loading: geoLoading, error: geoError } = useGeolocation();
  const { weather, airQuality, uv, location, loading: dataLoading, error: dataError } = useWeatherData(coordinates);

  // 위치 로딩 중
  if (geoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-500 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-white"></span>
          <p className="mt-4 text-white/80 font-light">위치를 확인하고 있어요...</p>
        </div>
      </div>
    );
  }

  // 위치 에러
  if (geoError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-500 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-4">📍</div>
          <p className="text-white font-medium">{geoError}</p>
          <p className="mt-2 text-white/70 text-sm font-light">
            위치 권한을 허용해주세요.
          </p>
        </div>
      </div>
    );
  }

  // 데이터 로딩 중
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-500 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-white"></span>
          <p className="mt-4 text-white/80 font-light">날씨 정보를 가져오고 있어요...</p>
        </div>
      </div>
    );
  }

  // 데이터 에러
  if (dataError || !weather) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-500 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-4">🌧️</div>
          <p className="text-white font-medium">{dataError || '날씨 정보를 가져올 수 없습니다.'}</p>
          <p className="mt-2 text-white/70 text-sm font-light">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  // 위치 포맷팅: 카카오 API 데이터 우선, 없으면 에어코리아 측정소 주소 사용
  const formatLocation = (): string => {
    // 카카오 API 데이터가 있으면 우선 사용
    if (location) {
      // "서울특별시" → "서울", "경기도" → "경기" 등 축약
      const region1 = location.region1
        .replace(/특별시|광역시|특별자치시|특별자치도/g, '')
        .trim();
      return `${region1} ${location.region2} ${location.region3}`.trim();
    }
    // 폴백: 에어코리아 측정소 주소
    if (airQuality?.stationAddr) {
      return airQuality.stationAddr
        .replace(/특별시|광역시|특별자치시|특별자치도/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return '현재 위치';
  };

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
    locationName: formatLocation(),
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

  const { bgClass, isLight } = getWeatherTheme(weatherData.weatherMain);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${bgClass}`}
      data-theme={isLight ? 'light' : 'dark'}
    >
      <div className="max-w-3xl mx-auto px-4 pb-8">
        {/* 벤토박스 그리드: 모바일 2열, 데스크탑 3열 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* 위치 헤더 - 전체 너비 */}
          <div className="col-span-2 md:col-span-3">
            <LocationHeader locationName={weatherData.locationName} />
          </div>

          {/* 외출 점수 - 모바일 전체, 데스크탑 1열 */}
          <div className="col-span-2 md:col-span-1">
            <ScoreGauge score={score} />
          </div>

          {/* 옷차림 추천 - 모바일 전체, 데스크탑 2열 */}
          <div className="col-span-2 md:col-span-2">
            <OutfitCard outfit={outfit} />
          </div>

          {/* 날씨 - 모바일 전체, 데스크탑 1열 */}
          <div className="col-span-2 md:col-span-1">
            <WeatherCard weather={weatherData} />
          </div>

          {/* 미세먼지 - 1열 */}
          <div className="col-span-1">
            <DustCard airQuality={airQualityData} />
          </div>

          {/* 자외선 - 1열 */}
          <div className="col-span-1">
            <UvCard uvIndex={uv?.uvIndex} />
          </div>
        </div>
      </div>
    </div>
  );
}
