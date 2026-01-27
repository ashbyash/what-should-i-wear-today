'use client';

import { m } from 'framer-motion';
import type { WeatherData } from '@/types/weather';

interface WeatherCardProps {
  weather: WeatherData;
}

import type { TargetAndTransition, Transition } from 'framer-motion';

// 날씨별 이모지 애니메이션 설정
const weatherAnimations: Record<string, { animate: TargetAndTransition; transition: Transition }> = {
  clear: {
    animate: { rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  clouds: {
    animate: { x: [-3, 3, -3], opacity: [0.9, 1, 0.9] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  rain: {
    animate: { y: [0, 3, 0] },
    transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
  },
  drizzle: {
    animate: { y: [0, 2, 0], opacity: [0.8, 1, 0.8] },
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  },
  thunderstorm: {
    animate: { scale: [1, 1.1, 1], opacity: [1, 0.7, 1] },
    transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
  },
  snow: {
    animate: { y: [0, 5, 0], rotate: [0, 180, 360] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  mist: {
    animate: { opacity: [0.6, 1, 0.6], scale: [0.98, 1.02, 0.98] },
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
  default: {
    animate: { scale: [1, 1.02, 1] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

function getWeatherEmoji(weatherMain: string): string {
  const weather = weatherMain.toLowerCase();
  switch (weather) {
    case 'clear':
      return '☀️';
    case 'clouds':
      return '☁️';
    case 'rain':
    case 'drizzle':
      return '🌧️';
    case 'thunderstorm':
      return '⛈️';
    case 'snow':
      return '❄️';
    case 'mist':
    case 'fog':
    case 'haze':
      return '🌫️';
    default:
      return '🌤️';
  }
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

export default function WeatherCard({ weather }: WeatherCardProps) {
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
      </div>
    </div>
  );
}
