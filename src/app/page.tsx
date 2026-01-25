'use client';

import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import LocationHeader from '@/components/LocationHeader';
import ScoreGauge from '@/components/ScoreGauge';
import OutfitCard from '@/components/OutfitCard';
import WeatherCard from '@/components/WeatherCard';
import DustCard from '@/components/DustCard';
import UvCard from '@/components/UvCard';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import PermissionGuide from '@/components/PermissionGuide';
import { useGeolocation } from '@/lib/geolocation';
import { useWeatherData } from '@/lib/useWeatherData';
import { calculateOutingScore } from '@/lib/score';
import { getOutfitRecommendation } from '@/lib/outfit';
import { formatLocation } from '@/lib/format-location';
import { getThemeConfig, getGradientStyle, getTimeOfDay, TIME_GRADIENTS } from '@/lib/theme';
import type { WeatherData, AirQualityData } from '@/types/weather';

// 애니메이션 variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

// 개발 환경 시간 테스트 훅
function useDevHour() {
  const [devHour, setDevHour] = useState<number | undefined>(undefined);

  useEffect(() => {
    const isDev =
      process.env.NODE_ENV === 'development' ||
      (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1'));

    if (isDev) {
      (window as typeof window & { setHour: (h: number | undefined) => void }).setHour = (h) => {
        setDevHour(h);
        console.log(`시간 설정: ${h ?? '현재 시간'} (${h !== undefined ? getTimeOfDay(h) : getTimeOfDay(new Date().getHours())})`);
      };
      console.log('🕐 시간 테스트: setHour(19) / setHour() 로 리셋');
    }
  }, []);

  return devHour;
}

// 클라이언트 시간 훅
function useClientHour() {
  const [clientHour, setClientHour] = useState<number>(12);

  useEffect(() => {
    const updateHour = () => {
      const now = new Date();
      setClientHour(now.getHours() + now.getMinutes() / 60);
    };
    updateHour();
    const interval = setInterval(updateHour, 60000);
    return () => clearInterval(interval);
  }, []);

  return clientHour;
}

export default function Home() {
  const devHour = useDevHour();
  const clientHour = useClientHour();
  const {
    coordinates,
    loading: geoLoading,
    error: geoError,
    locationChanged,
  } = useGeolocation();
  const {
    weather,
    weatherLoading,
    airQuality,
    airQualityLoading,
    uv,
    uvLoading,
    location,
    error: dataError,
    lastUpdated,
    refetch,
    isRefetching,
  } = useWeatherData(coordinates, { locationChanged });

  // 기본 그라데이션 (로딩/에러 상태용) - 좌표 기반 일출/일몰 사용
  const defaultGradient = TIME_GRADIENTS[getTimeOfDay(clientHour, coordinates ?? undefined)];
  const defaultGradientStyle = { background: `linear-gradient(to bottom, ${defaultGradient.from}, ${defaultGradient.to})` };

  // 위치 로딩 중
  if (geoLoading) {
    return (
      <div className="min-h-screen pt-safe pb-safe" style={defaultGradientStyle}>
        <LoadingState message="위치를 확인하고 있어요..." />
      </div>
    );
  }

  // 위치 에러
  if (geoError) {
    return (
      <div className="min-h-screen pt-safe pb-safe flex items-center justify-center" style={defaultGradientStyle}>
        <PermissionGuide error={geoError} />
      </div>
    );
  }

  // Weather 로딩 중 (핵심 데이터)
  if (weatherLoading) {
    return (
      <div className="min-h-screen pt-safe pb-safe" style={defaultGradientStyle}>
        <LoadingState message="날씨 정보를 가져오고 있어요..." />
      </div>
    );
  }

  // 데이터 에러
  if (dataError || !weather) {
    return (
      <div className="min-h-screen pt-safe pb-safe flex items-center justify-center" style={defaultGradientStyle}>
        <ErrorState message={dataError || '날씨 정보를 가져올 수 없습니다.'} />
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
    locationName: formatLocation(location, airQuality),
  };

  const airQualityData: AirQualityData = {
    aqi: 0,
    aqiLevel: airQuality?.pm25Grade ?? 'moderate',
    pm25: airQuality?.pm25 ?? 0,
    pm10: airQuality?.pm10 ?? 0,
  };

  // 점수 & 옷차림 계산
  const score = calculateOutingScore({
    temperature: weatherData.temperature,
    tempMin: weatherData.tempMin,
    tempMax: weatherData.tempMax,
    pm25: airQualityData.pm25,
    weatherMain: weatherData.weatherMain,
    uvIndex: uv?.uvIndex,
    humidity: weatherData.humidity,
    windSpeed: weatherData.windSpeed,
    timestamp: Date.now(),
  });

  const outfit = getOutfitRecommendation({
    temperature: weatherData.temperature,
    tempMin: weatherData.tempMin,
    tempMax: weatherData.tempMax,
    pm25: airQualityData.pm25,
    weatherMain: weatherData.weatherMain,
    windSpeed: weatherData.windSpeed,
    humidity: weatherData.humidity,
  });

  // 테마 계산 - 좌표 기반 일출/일몰 사용
  const theme = getThemeConfig(weatherData.weatherMain, devHour ?? clientHour, coordinates ?? undefined);
  const gradientStyle = getGradientStyle(theme.gradient);

  return (
    <div
      className={`min-h-screen pt-safe pb-safe transition-colors duration-500 ${theme.overlay}`}
      style={gradientStyle}
      data-theme={theme.isLight ? 'light' : 'dark'}
    >
      <div className="max-w-3xl mx-auto px-4 pb-8">
        <m.div
          className="grid grid-cols-2 md:grid-cols-3 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 위치 헤더 */}
          <m.div className="col-span-2 md:col-span-3" variants={cardVariants}>
            <LocationHeader
              locationName={weatherData.locationName}
              lastUpdated={lastUpdated}
              onRefresh={refetch}
              isRefreshing={isRefetching}
            />
          </m.div>

          {/* 외출 점수 */}
          <m.div className="col-span-2 md:col-span-1" variants={cardVariants}>
            <ScoreGauge score={score} />
          </m.div>

          {/* 옷차림 추천 */}
          <m.div className="col-span-2 md:col-span-2" variants={cardVariants}>
            <OutfitCard outfit={outfit} />
          </m.div>

          {/* 날씨 */}
          <m.div className="col-span-2 md:col-span-1" variants={cardVariants}>
            <WeatherCard weather={weatherData} />
          </m.div>

          {/* 미세먼지 */}
          <m.div className="col-span-1" variants={cardVariants}>
            <DustCard airQuality={airQualityData} loading={airQualityLoading} />
          </m.div>

          {/* 자외선 */}
          <m.div className="col-span-1" variants={cardVariants}>
            <UvCard uvIndex={uv?.uvIndex} loading={uvLoading} />
          </m.div>
        </m.div>
      </div>
    </div>
  );
}
