'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import HeroCard from '@/components/HeroCard';
import OutfitCard from '@/components/OutfitCard';
import HourlyForecast from '@/components/HourlyForecast';
import WeatherModule from '@/components/WeatherModule';
import WeatherModuleGrid from '@/components/WeatherModuleGrid';
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
    return { background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.via}, ${gradient.to})` };
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
      data-theme-mode={theme.isLight ? 'light' : 'dark'}
    >
      <div className="flex flex-col gap-4 max-w-3xl mx-auto px-4 pb-8 pt-4">
        {/* Hero Card — full width */}
        <HeroCard
          locationName={locationName}
          weather={weatherData}
          score={score}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-start">
          <OutfitCard
            outfit={outfit}
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
            value={uvSource?.uvIndex !== undefined ? getUVLevel(uvSource.uvIndex) : '--'}
            description={uvSource?.uvIndex !== undefined ? `UV 지수 ${uvSource.uvIndex}` : '데이터 없음'}
            color={uvSource?.uvIndex !== undefined ? getUVColor(uvSource.uvIndex) : undefined}
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
        <PopularCities currentCitySlug={city.slug} />
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
