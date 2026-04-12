'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import HeroCard from '@/components/HeroCard';
import OutfitCard from '@/components/OutfitCard';
import HourlyForecast from '@/components/HourlyForecast';
import WeatherModule from '@/components/WeatherModule';
import WeatherModuleGrid from '@/components/WeatherModuleGrid';
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

function getPM25Level(pm25: number): string {
  if (pm25 <= 15) return '좋음';
  if (pm25 <= 35) return '보통';
  if (pm25 <= 75) return '나쁨';
  return '매우나쁨';
}

function getPM25Color(pm25: number): string {
  if (pm25 <= 15) return '#4ade80';
  if (pm25 <= 35) return '#fbbf24';
  return '#f87171';
}

function getUVLevel(uvIndex: number): string {
  if (uvIndex <= 2) return '낮음';
  if (uvIndex <= 5) return '보통';
  if (uvIndex <= 7) return '높음';
  if (uvIndex <= 10) return '매우높음';
  return '위험';
}

function getUVColor(uvIndex: number): string {
  if (uvIndex <= 2) return '#4ade80';
  if (uvIndex <= 5) return '#fbbf24';
  return '#f87171';
}

function getHumidityDescription(humidity?: number): string {
  if (humidity === undefined) return '데이터 없음';
  if (humidity >= 40 && humidity <= 60) return '쾌적한 수준';
  if (humidity < 40) return '건조한 편';
  return '습한 편';
}

function getWindDescription(windSpeed?: number): string {
  if (windSpeed === undefined) return '데이터 없음';
  if (windSpeed < 2) return '바람 거의 없음';
  if (windSpeed < 5) return '산들바람';
  if (windSpeed < 8) return '약간 강한 바람';
  return '강풍';
}

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
    return { background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.via}, ${gradient.to})` };
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
      data-theme-mode={theme.isLight ? 'light' : 'dark'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-start">
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

        {/* Weather Modules — full width */}
        <WeatherModuleGrid>
          <WeatherModule
            icon="💨"
            label="미세먼지"
            value={airQualityData.pm25 !== undefined ? getPM25Level(airQualityData.pm25) : '--'}
            description={airQualityData.pm25 !== undefined ? `PM2.5 ${airQualityData.pm25}㎍/㎥` : '데이터 없음'}
            color={airQualityData.pm25 !== undefined ? getPM25Color(airQualityData.pm25) : undefined}
          />
          <WeatherModule
            icon="☀️"
            label="자외선"
            value={uv?.uvIndex !== undefined ? getUVLevel(uv.uvIndex) : '--'}
            description={uv?.uvIndex !== undefined ? `UV 지수 ${uv.uvIndex}` : '데이터 없음'}
            color={uv?.uvIndex !== undefined ? getUVColor(uv.uvIndex) : undefined}
          />
          <WeatherModule
            icon="💧"
            label="습도"
            value={weatherData.humidity !== undefined ? `${weatherData.humidity}%` : '--'}
            description={getHumidityDescription(weatherData.humidity)}
          />
          <WeatherModule
            icon="🌬️"
            label="바람"
            value={weatherData.windSpeed !== undefined ? `${weatherData.windSpeed}` : '--'}
            unit="m/s"
            description={getWindDescription(weatherData.windSpeed)}
          />
        </WeatherModuleGrid>

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
