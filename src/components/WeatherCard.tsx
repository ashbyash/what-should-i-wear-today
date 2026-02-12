'use client';

import { m } from 'framer-motion';
import { weatherAnimations } from '@/lib/animation-variants';
import { getWeatherEmoji } from '@/lib/weather-utils';
import HourlyForecast from './HourlyForecast';
import type { WeatherData, HourlyForecastItem } from '@/types/weather';

interface WeatherCardProps {
  weather: WeatherData;
  hourlyForecast?: HourlyForecastItem[] | null;
  hourlyLoading?: boolean;
}

function getWeatherLabel(weatherMain: string): string {
  const weather = weatherMain.toLowerCase();
  switch (weather) {
    case 'clear':
      return '맑음';
    case 'clouds':
    case 'overcast':
      return '흐림';
    case 'rain':
      return '비';
    case 'drizzle':
      return '이슬비';
    case 'thunderstorm':
      return '천둥번개';
    case 'snow':
      return '눈';
    case 'mist':
    case 'fog':
      return '안개';
    case 'haze':
      return '연무';
    default:
      return weatherMain;
  }
}

export default function WeatherCard({ weather, hourlyForecast, hourlyLoading = false }: WeatherCardProps) {
  const emoji = getWeatherEmoji(weather.weatherMain);
  const label = getWeatherLabel(weather.weatherMain);
  const weatherKey = weather.weatherMain.toLowerCase();
  const animation = weatherAnimations[weatherKey] || weatherAnimations.default;

  return (
    <div
      className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full"
      role="region"
      aria-label={`현재 날씨 ${label}, 기온 ${weather.temperature}도, 최저 ${weather.tempMin}도, 최고 ${weather.tempMax}도`}
    >
      <div className="card-body p-4 items-center text-center">
        {/* 상단: 이모지 + 날씨 상태 */}
        <div className="flex items-center gap-2">
          <m.span
            className="text-3xl"
            aria-hidden="true"
            animate={animation.animate}
            transition={animation.transition}
          >
            {emoji}
          </m.span>
          <span className="text-title text-glass-primary">{label}</span>
        </div>

        {/* 중앙: 현재 기온 / 체감 기온 2열 */}
        <div className="flex justify-center gap-8 mt-3">
          <div className="text-center">
            <div className="text-caption text-glass-muted">현재</div>
            <div className="text-display text-glass-primary">{weather.temperature}°</div>
          </div>
          <div className="text-center">
            <div className="text-caption text-glass-muted">체감</div>
            <div className="text-display text-glass-primary">{weather.feelsLike}°</div>
          </div>
        </div>

        {/* 하단: 최저/최고 + 바람/습도 두 줄 */}
        <div className="text-caption text-glass-muted mt-3 space-y-1">
          <div>최저 {weather.tempMin}° · 최고 {weather.tempMax}°</div>
          <div>바람 {weather.windSpeed}m/s · 습도 {weather.humidity}%</div>
        </div>

        {/* 시간별 예보 */}
        {(hourlyLoading || (hourlyForecast && hourlyForecast.length > 0)) && (
          <div className="border-t border-white/20 pt-3 mt-3 w-full">
            <HourlyForecast data={hourlyForecast ?? null} loading={hourlyLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
