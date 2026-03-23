'use client';

import { GlassInner } from './GlassCard';
import type { AirQualityData } from '@/types/weather';

interface ConditionsRowProps {
  airQuality?: AirQualityData;
  uvIndex?: number;
  humidity?: number;
  isLight?: boolean;
  loading?: boolean;
}

function getColor(value: number, ranges: { green: number[]; yellow: number[] }): string {
  if (value <= ranges.green[1]) return '#4ade80'; // Green
  if (value <= ranges.yellow[1]) return '#fbbf24'; // Yellow
  return '#f87171'; // Red
}

function getPM25Level(pm25: number): string {
  if (pm25 <= 15) return '좋음';
  if (pm25 <= 35) return '보통';
  if (pm25 <= 75) return '나쁨';
  return '매우나쁨';
}

function getUVLevel(uvIndex: number): string {
  if (uvIndex <= 2) return '낮음';
  if (uvIndex <= 5) return '보통';
  if (uvIndex <= 7) return '높음';
  if (uvIndex <= 10) return '매우높음';
  return '위험';
}

function getPM25Color(pm25: number): string {
  return getColor(pm25, { green: [0, 15], yellow: [0, 35] });
}

function getUVColor(uvIndex: number): string {
  if (uvIndex <= 2) return '#4ade80'; // Green
  if (uvIndex <= 5) return '#fbbf24'; // Yellow
  return '#f87171'; // Red
}

function getHumidityColor(humidity: number): string {
  if (humidity >= 40 && humidity <= 60) return '#4ade80'; // Green
  if ((humidity >= 30 && humidity < 40) || (humidity > 60 && humidity <= 70)) return '#fbbf24'; // Yellow
  return '#f87171'; // Red
}

export default function ConditionsRow({
  airQuality,
  uvIndex,
  humidity,
  isLight = false,
  loading = false,
}: ConditionsRowProps) {
  const mutedColor = isLight ? 'text-[rgba(30,30,50,0.4)]' : 'text-white/45';

  if (loading) {
    return (
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <GlassInner key={i} isLight={isLight} className="flex-1 flex flex-col items-center gap-1 animate-pulse">
            <div className="text-base">-</div>
            <div className="text-[9px] opacity-50">-</div>
            <div className="h-5 bg-gray-300 rounded w-12 animate-pulse"></div>
          </GlassInner>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {/* PM2.5 Badge */}
      <GlassInner isLight={isLight} className="flex-1 flex flex-col items-center gap-1">
        <div className="text-base">💨</div>
        <div className={`text-[9px] ${mutedColor}`}>PM2.5</div>
        {airQuality?.pm25 !== undefined ? (
          <div style={{ color: getPM25Color(airQuality.pm25) }} className="text-[13px] font-semibold">
            {getPM25Level(airQuality.pm25)}
          </div>
        ) : (
          <div className={`text-[13px] font-semibold ${mutedColor}`}>--</div>
        )}
      </GlassInner>

      {/* UV Badge */}
      <GlassInner isLight={isLight} className="flex-1 flex flex-col items-center gap-1">
        <div className="text-base">☀️</div>
        <div className={`text-[9px] ${mutedColor}`}>자외선</div>
        {uvIndex !== undefined ? (
          <div style={{ color: getUVColor(uvIndex) }} className="text-[13px] font-semibold">
            {getUVLevel(uvIndex)}
          </div>
        ) : (
          <div className={`text-[13px] font-semibold ${mutedColor}`}>--</div>
        )}
      </GlassInner>

      {/* Humidity Badge */}
      <GlassInner isLight={isLight} className="flex-1 flex flex-col items-center gap-1">
        <div className="text-base">💧</div>
        <div className={`text-[9px] ${mutedColor}`}>습도</div>
        {humidity !== undefined ? (
          <div style={{ color: getHumidityColor(humidity) }} className="text-[13px] font-semibold">
            {humidity}%
          </div>
        ) : (
          <div className={`text-[13px] font-semibold ${mutedColor}`}>--</div>
        )}
      </GlassInner>
    </div>
  );
}
