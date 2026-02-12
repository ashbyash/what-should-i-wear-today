'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
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

const CitySearchModal = dynamic(() => import('@/components/CitySearchModal'), {
  ssr: false,
});
import { useGeolocation } from '@/lib/geolocation';
import { useWeatherData } from '@/lib/useWeatherData';
import { calculateOutingScore, getFeelsLikeTemp } from '@/lib/score';
import { getOutfitRecommendation } from '@/lib/outfit';
import { formatLocation } from '@/lib/format-location';
import { getThemeConfig, getGradientStyle, getTimeOfDay, getSeason, TIME_GRADIENTS, TIME_TEXT_COLORS, SEASON_ACCENTS, type ThemeConfig } from '@/lib/theme';
import { containerVariants, cardVariants } from '@/lib/animation-variants';
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
              isFromCache={isFromCache}
              cacheReason={cacheReason}
              onSearchClick={() => setIsSearchModalOpen(true)}
              isViewingOtherLocation={!!queryCoordinates}
              onReturnToCurrentLocation={() => router.push('/')}
            />
          </m.div>

          {/* 옷차림 추천 */}
          <m.div className="col-span-2 md:col-span-3" variants={cardVariants}>
            <OutfitCard
              outfit={outfit}
              weatherContext={{
                temperature: weatherData.temperature,
                feelsLike: weatherData.feelsLike,
                weatherMain: weatherData.weatherMain,
                pm25: airQualityData.pm25,
              }}
            />
          </m.div>

          {/* 날씨 */}
          <m.div className="col-span-2 md:col-span-2" variants={cardVariants}>
            <WeatherCard weather={weatherData} />
          </m.div>

          {/* 외출 점수 */}
          <m.div className="col-span-2 md:col-span-1" variants={cardVariants}>
            <ScoreGauge
              score={score}
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
          </m.div>

          {/* 미세먼지 */}
          <m.div className="col-span-1 md:col-span-2" variants={cardVariants}>
            <DustCard airQuality={airQualityData} loading={airQualityLoading} />
          </m.div>

          {/* 자외선 */}
          <m.div className="col-span-1" variants={cardVariants}>
            <UvCard uvIndex={uv?.uvIndex} loading={uvLoading} />
          </m.div>
        </m.div>
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
