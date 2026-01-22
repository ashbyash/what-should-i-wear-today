'use client';

import { useState, useEffect } from 'react';
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

type TimeOfDay = 'night' | 'dawn' | 'morning' | 'day' | 'evening';
type WeatherType = 'clear' | 'clouds' | 'rain' | 'snow' | 'mist';

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night'; // 21-5시
}

function getWeatherType(weatherMain: string): WeatherType {
  const weather = weatherMain.toLowerCase();
  if (weather === 'clear') return 'clear';
  if (weather === 'clouds') return 'clouds';
  if (['rain', 'drizzle', 'thunderstorm'].includes(weather)) return 'rain';
  if (weather === 'snow') return 'snow';
  return 'mist';
}

// 시간대 + 날씨 조합 테마
const themeMap: Record<TimeOfDay, Record<WeatherType, WeatherTheme>> = {
  night: {
    clear: { bgClass: 'bg-gradient-to-b from-indigo-900 to-slate-900', isLight: false },
    clouds: { bgClass: 'bg-gradient-to-b from-slate-700 to-slate-800', isLight: false },
    rain: { bgClass: 'bg-gradient-to-b from-slate-800 to-gray-900', isLight: false },
    snow: { bgClass: 'bg-gradient-to-b from-slate-600 to-indigo-800', isLight: false },
    mist: { bgClass: 'bg-gradient-to-b from-slate-700 to-gray-800', isLight: false },
  },
  dawn: {
    clear: { bgClass: 'bg-gradient-to-b from-indigo-800 to-orange-300', isLight: false },
    clouds: { bgClass: 'bg-gradient-to-b from-slate-600 to-rose-300', isLight: false },
    rain: { bgClass: 'bg-gradient-to-b from-slate-700 to-slate-500', isLight: false },
    snow: { bgClass: 'bg-gradient-to-b from-slate-500 to-blue-300', isLight: false },
    mist: { bgClass: 'bg-gradient-to-b from-slate-600 to-gray-400', isLight: false },
  },
  morning: {
    clear: { bgClass: 'bg-gradient-to-b from-orange-300 to-sky-400', isLight: true },
    clouds: { bgClass: 'bg-gradient-to-b from-rose-200 to-slate-400', isLight: true },
    rain: { bgClass: 'bg-gradient-to-b from-slate-400 to-blue-500', isLight: false },
    snow: { bgClass: 'bg-gradient-to-b from-slate-200 to-blue-300', isLight: true },
    mist: { bgClass: 'bg-gradient-to-b from-gray-300 to-slate-400', isLight: true },
  },
  day: {
    clear: { bgClass: 'bg-gradient-to-b from-sky-400 to-blue-500', isLight: false },
    clouds: { bgClass: 'bg-gradient-to-b from-slate-400 to-slate-500', isLight: false },
    rain: { bgClass: 'bg-gradient-to-b from-slate-500 to-blue-600', isLight: false },
    snow: { bgClass: 'bg-gradient-to-b from-slate-300 to-blue-400', isLight: true },
    mist: { bgClass: 'bg-gradient-to-b from-gray-400 to-slate-500', isLight: false },
  },
  evening: {
    clear: { bgClass: 'bg-gradient-to-b from-orange-400 to-purple-600', isLight: false },
    clouds: { bgClass: 'bg-gradient-to-b from-rose-400 to-slate-600', isLight: false },
    rain: { bgClass: 'bg-gradient-to-b from-purple-500 to-slate-700', isLight: false },
    snow: { bgClass: 'bg-gradient-to-b from-rose-300 to-indigo-500', isLight: false },
    mist: { bgClass: 'bg-gradient-to-b from-gray-400 to-purple-600', isLight: false },
  },
};

function getWeatherTheme(weatherMain: string, overrideHour?: number): WeatherTheme {
  const hour = overrideHour ?? new Date().getHours();
  const timeOfDay = getTimeOfDay(hour);
  const weatherType = getWeatherType(weatherMain);

  return themeMap[timeOfDay][weatherType];
}

export default function Home() {
  const [devHour, setDevHour] = useState<number | undefined>(undefined);

  // 개발 환경에서 콘솔로 시간 테스트 가능
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as typeof window & { setHour: (h: number | undefined) => void }).setHour = (h) => {
        setDevHour(h);
        console.log(`시간 설정: ${h ?? '현재 시간'} (${h !== undefined ? getTimeOfDay(h) : getTimeOfDay(new Date().getHours())})`);
      };
      console.log('🕐 시간 테스트: setHour(19) / setHour() 로 리셋');
    }
  }, []);

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
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;

    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-500 flex items-center justify-center">
        <div className="text-center px-6 max-w-sm">
          <div className="text-5xl mb-4">📍</div>
          <p className="text-white font-semibold text-lg mb-4">{geoError}</p>

          <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 text-left">
            <p className="text-white/90 font-medium text-sm mb-3">
              위치 권한 허용 방법
            </p>

            {isMobile ? (
              isIOS ? (
                <ol className="text-white/80 text-sm space-y-2 list-decimal list-inside">
                  <li>iPhone <span className="font-semibold">설정</span> 앱 열기</li>
                  <li><span className="font-semibold">Safari</span> → <span className="font-semibold">위치</span></li>
                  <li><span className="font-semibold">허용</span> 선택</li>
                  <li>이 페이지 새로고침</li>
                </ol>
              ) : (
                <ol className="text-white/80 text-sm space-y-2 list-decimal list-inside">
                  <li>주소창 왼쪽 <span className="font-semibold">자물쇠</span> 아이콘 탭</li>
                  <li><span className="font-semibold">권한</span> → <span className="font-semibold">위치</span></li>
                  <li><span className="font-semibold">허용</span> 선택</li>
                  <li>이 페이지 새로고침</li>
                </ol>
              )
            ) : (
              <ol className="text-white/80 text-sm space-y-2 list-decimal list-inside">
                <li>주소창 왼쪽 <span className="font-semibold">자물쇠</span> 아이콘 클릭</li>
                <li><span className="font-semibold">사이트 설정</span> 또는 <span className="font-semibold">권한</span></li>
                <li>위치를 <span className="font-semibold">허용</span>으로 변경</li>
                <li>이 페이지 새로고침</li>
              </ol>
            )}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-colors"
          >
            새로고침
          </button>
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

  const { bgClass, isLight } = getWeatherTheme(weatherData.weatherMain, devHour);

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
