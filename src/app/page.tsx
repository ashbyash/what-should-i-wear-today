'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import HeroCard from '@/components/HeroCard';
import OutfitCard from '@/components/OutfitCard';
import HourlyForecast from '@/components/HourlyForecast';
import ConditionsRow from '@/components/ConditionsRow';
import PopularCities from '@/components/PopularCities';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import PermissionGuide from '@/components/PermissionGuide';

const CitySearchModal = dynamic(() => import('@/components/CitySearchModal'), {
  ssr: false,
});
import { useGeolocation } from '@/lib/geolocation';
import { useWeatherData } from '@/lib/useWeatherData';
import { calculateOutingScore, getFeelsLikeTemp } from '@/lib/score';
import { getOutfitRecommendation } from '@/lib/outfit';
import { formatLocation } from '@/lib/format-location';
import { getThemeConfig, getGradientStyle, getTimeOfDay, getSeason, TIME_GRADIENTS, TIME_TEXT_COLORS, SEASON_ACCENTS, type ThemeConfig } from '@/lib/theme';
import { useClientHour } from '@/lib/useClientHour';
import type { WeatherData, AirQualityData } from '@/types/weather';

function HomeContent() {
  const router = useRouter();
  const clientHour = useClientHour();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // URL 쿼리 파라미터 (카카오 검색 결과용)
  const searchParams = useSearchParams();
  const queryCoordinates = useMemo(() => {
    const lat = searchParams?.get('lat');
    const lon = searchParams?.get('lon');
    if (lat && lon) {
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
        return { lat: parsedLat, lon: parsedLon };
      }
    }
    return null;
  }, [searchParams]);

  const {
    coordinates: geoCoordinates,
    loading: geoLoading,
    error: geoError,
    locationChanged,
    isFromCache,
    cacheReason,
  } = useGeolocation();

  // 쿼리 파라미터 우선, 없으면 geolocation 사용
  const coordinates = queryCoordinates || geoCoordinates;
  const {
    weather,
    weatherLoading,
    airQuality,
    uv,
    location,
    error: dataError,
    lastUpdated,
    refetch,
    isRefetching,
    hourlyForecast,
    hourlyLoading,
  } = useWeatherData(coordinates, { locationChanged });

  // 기본 그라데이션 (로딩/에러 상태용) - 좌표 기반 일출/일몰 사용
  const timeOfDay = useMemo(() => getTimeOfDay(clientHour, coordinates ?? undefined), [clientHour, coordinates]);
  const defaultGradientStyle = useMemo(() => {
    const gradient = TIME_GRADIENTS[timeOfDay];
    return { background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})` };
  }, [timeOfDay]);

  // 기본 테마 (위치 에러 시 CitySearchModal에 전달)
  const defaultTheme = useMemo((): ThemeConfig => {
    const season = getSeason();
    return {
      gradient: TIME_GRADIENTS[timeOfDay],
      overlay: '',
      isLight: TIME_TEXT_COLORS[timeOfDay].isLight,
      seasonAccent: SEASON_ACCENTS[season],
      timeOfDay,
      season,
    };
  }, [timeOfDay]);

  // 위치 로딩 중 (쿼리 파라미터 없을 때만)
  if (!queryCoordinates && geoLoading) {
    return (
      <div className="min-h-screen pt-safe pb-safe" style={defaultGradientStyle}>
        <LoadingState message="위치를 확인하고 있어요..." />
      </div>
    );
  }

  // 위치 에러 (쿼리 파라미터 없을 때만)
  if (!queryCoordinates && geoError) {
    return (
      <div className="min-h-screen pt-safe pb-safe flex items-center justify-center" style={defaultGradientStyle}>
        <PermissionGuide
          error={geoError}
          onSearchClick={() => setIsSearchModalOpen(true)}
        />
        <CitySearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          theme={defaultTheme}
        />
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
    feelsLike: Math.round(getFeelsLikeTemp(weather.temperature, weather.windSpeed, weather.humidity)),
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
    timestamp: Date.now(),
  });

  // 테마 계산 - 좌표 기반 일출/일몰 사용
  const theme = getThemeConfig(weatherData.weatherMain, clientHour, coordinates ?? undefined);
  const gradientStyle = getGradientStyle(theme.gradient);

  return (
    <div
      className={`min-h-screen pt-safe pb-safe transition-colors duration-500 ${theme.overlay}`}
      style={gradientStyle}
      data-theme={theme.isLight ? 'light' : 'dark'}
    >
      <div className="flex flex-col gap-4 max-w-3xl mx-auto px-4 pb-8 pt-4">
        {/* Hero Card — full width */}
        <HeroCard
          locationName={weatherData.locationName}
          weather={weatherData}
          score={score}
          isLight={theme.isLight}
          lastUpdated={lastUpdated}
          onRefresh={refetch}
          isRefreshing={isRefetching}
          isFromCache={isFromCache}
          cacheReason={cacheReason}
          onSearchClick={() => setIsSearchModalOpen(true)}
          isViewingOtherLocation={!!queryCoordinates}
          onReturnToCurrentLocation={() => router.push('/')}
          weatherContext={{
            temperature: weatherData.temperature,
            feelsLike: weatherData.feelsLike,
            weatherMain: weatherData.weatherMain,
            pm25: airQualityData.pm25,
            humidity: weatherData.humidity,
            windSpeed: weatherData.windSpeed,
            uvIndex: uv?.uvIndex,
          }}
        />

        {/* Outfit + Hourly — 1col mobile, 2col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OutfitCard
            outfit={outfit}
            isLight={theme.isLight}
            weatherContext={{
              temperature: weatherData.temperature,
              feelsLike: weatherData.feelsLike,
              weatherMain: weatherData.weatherMain,
              pm25: airQualityData.pm25,
            }}
          />
          <HourlyForecast
            data={hourlyForecast}
            loading={hourlyLoading}
            isLight={theme.isLight}
          />
        </div>

        {/* Conditions Row — full width */}
        <ConditionsRow
          airQuality={airQualityData}
          uvIndex={uv?.uvIndex}
          humidity={weatherData.humidity}
          isLight={theme.isLight}
          loading={hourlyLoading}
        />

        {/* Popular Cities — full width */}
        <PopularCities isLight={theme.isLight} />
      </div>

      {/* 도시 검색 모달 */}
      <CitySearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        theme={theme}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingState message="로딩 중..." />}>
      <HomeContent />
    </Suspense>
  );
}
