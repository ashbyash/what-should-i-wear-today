'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import HeroCard from '@/components/HeroCard';
import OutfitCard from '@/components/OutfitCard';
import HourlyForecast from '@/components/HourlyForecast';
import ConditionsRow from '@/components/ConditionsRow';
import PopularCities from '@/components/PopularCities';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

const CitySearchModal = dynamic(() => import('@/components/CitySearchModal'), {
  ssr: false,
});
import { useWeatherData } from '@/lib/useWeatherData';
import { calculateOutingScore, getFeelsLikeTemp } from '@/lib/score';
import { getOutfitRecommendation } from '@/lib/outfit';
import { formatLocation } from '@/lib/format-location';
import { getThemeConfig, getGradientStyle, getTimeOfDay, TIME_GRADIENTS } from '@/lib/theme';
import { useClientHour } from '@/lib/useClientHour';
import type { WeatherData, AirQualityData, InitialWeatherData } from '@/types/weather';
import type { CityData } from '@/lib/cities';

interface CityWeatherPageProps {
  city: CityData;
  initialData?: InitialWeatherData;
}

export default function CityWeatherPage({ city, initialData }: CityWeatherPageProps) {
  const router = useRouter();
  const clientHour = useClientHour();
  const coordinates = { lat: city.lat, lon: city.lon };
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const {
    weather,
    weatherLoading,
    airQuality,
    airQualityLoading,
    uv,
    location,
    error: dataError,
    lastUpdated,
    refetch,
    isRefetching,
    hourlyForecast,
    hourlyLoading,
  } = useWeatherData(coordinates, { initialData });

  // 기본 그라데이션 (로딩/에러 상태용)
  const defaultGradientStyle = useMemo(() => {
    const gradient = TIME_GRADIENTS[getTimeOfDay(clientHour, { lat: city.lat, lon: city.lon })];
    return { background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})` };
  }, [clientHour, city.lat, city.lon]);

  // initialData가 있으면 SWR hydration 완료까지 대기하지 않고 바로 사용
  const hasInitialData = !!(initialData?.current && initialData?.forecast);

  // Weather 로딩 중 (initialData 없을 때만 로딩 표시)
  if (weatherLoading && !hasInitialData) {
    return (
      <div className="min-h-screen pt-safe pb-safe" style={defaultGradientStyle}>
        <LoadingState message={`${city.name} 날씨 정보를 가져오고 있어요...`} />
      </div>
    );
  }

  // 데이터 에러 (initialData 없을 때만 에러 표시)
  if ((dataError || !weather) && !hasInitialData) {
    return (
      <div className="min-h-screen pt-safe pb-safe flex items-center justify-center" style={defaultGradientStyle}>
        <ErrorState message={dataError || '날씨 정보를 가져올 수 없습니다.'} />
      </div>
    );
  }

  // API 데이터 → 컴포넌트 데이터 변환
  // SWR 데이터 우선, 없으면 initialData 사용 (hydration 중)
  const currentData = weather ?? (hasInitialData ? {
    temperature: initialData.current!.temperature,
    humidity: initialData.current!.humidity,
    windSpeed: initialData.current!.windSpeed,
    sky: initialData.current!.precipitation || initialData.forecast!.sky,
    skyDescription: initialData.current!.precipitationDescription || initialData.forecast!.skyDescription,
    tempMin: initialData.forecast!.tempMin,
    tempMax: initialData.forecast!.tempMax,
  } : null);

  // currentData가 없으면 여기서 리턴 (이론상 도달하지 않음)
  if (!currentData) {
    return (
      <div className="min-h-screen pt-safe pb-safe flex items-center justify-center" style={defaultGradientStyle}>
        <ErrorState message="날씨 정보를 가져올 수 없습니다." />
      </div>
    );
  }

  const locationName = city.isOverseas
    ? `${city.name}, ${city.country}`
    : (location
      ? formatLocation(location, airQuality)
      : (initialData?.location ? formatLocation(initialData.location, initialData.airQuality) : city.name));

  const weatherData: WeatherData = {
    temperature: currentData.temperature,
    feelsLike: Math.round(getFeelsLikeTemp(currentData.temperature, currentData.windSpeed, currentData.humidity)),
    tempMin: currentData.tempMin ?? currentData.temperature - 5,
    tempMax: currentData.tempMax ?? currentData.temperature + 5,
    humidity: currentData.humidity,
    weatherMain: currentData.sky,
    weatherDescription: currentData.skyDescription,
    weatherIcon: '',
    windSpeed: currentData.windSpeed,
    cloudiness: 0,
    locationName,
  };

  // SWR 데이터 우선, 없으면 initialData 사용
  const airQualitySource = airQuality ?? initialData?.airQuality;
  const airQualityData: AirQualityData = {
    aqi: 0,
    aqiLevel: airQualitySource?.pm25Grade ?? 'moderate',
    pm25: airQualitySource?.pm25 ?? 0,
    pm10: airQualitySource?.pm10 ?? 0,
  };

  // SWR 데이터 우선, 없으면 initialData 사용
  const uvSource = uv ?? initialData?.uv;

  // 점수 & 옷차림 계산
  const score = calculateOutingScore({
    temperature: weatherData.temperature,
    tempMin: weatherData.tempMin,
    tempMax: weatherData.tempMax,
    pm25: airQualityData.pm25,
    weatherMain: weatherData.weatherMain,
    uvIndex: uvSource?.uvIndex,
    humidity: weatherData.humidity,
    windSpeed: weatherData.windSpeed,
    timestamp: Date.now(),
    isOverseas: city.isOverseas,
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

  // 테마 계산
  const theme = getThemeConfig(weatherData.weatherMain, clientHour, coordinates);
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
          locationName={locationName}
          weather={weatherData}
          score={score}
          isLight={theme.isLight}
          lastUpdated={lastUpdated}
          onRefresh={refetch}
          isRefreshing={isRefetching}
          onSearchClick={() => setIsSearchModalOpen(true)}
          isViewingOtherLocation={true}
          onReturnToCurrentLocation={() => router.push('/')}
          weatherContext={{
            temperature: weatherData.temperature,
            feelsLike: weatherData.feelsLike,
            weatherMain: weatherData.weatherMain,
            pm25: airQualityData.pm25,
            humidity: weatherData.humidity,
            windSpeed: weatherData.windSpeed,
            uvIndex: uvSource?.uvIndex,
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
          uvIndex={uvSource?.uvIndex}
          humidity={weatherData.humidity}
          isLight={theme.isLight}
          loading={airQualityLoading && !airQualitySource}
        />

        {/* Popular Cities — full width */}
        <PopularCities currentCitySlug={city.slug} isLight={theme.isLight} />
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
