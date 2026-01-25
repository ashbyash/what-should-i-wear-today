'use client';

import { m } from 'framer-motion';
import type { AirQualityData } from '@/types/weather';

interface DustCardProps {
  airQuality: AirQualityData;
  loading?: boolean;
}

function getAqiLabel(level: AirQualityData['aqiLevel']): string {
  switch (level) {
    case 'good':
      return '좋음';
    case 'moderate':
      return '보통';
    case 'bad':
      return '나쁨';
    case 'very_bad':
      return '매우나쁨';
  }
}

function getAqiColor(level: AirQualityData['aqiLevel']): string {
  switch (level) {
    case 'good':
      return 'text-white';
    case 'moderate':
      return 'text-white';
    case 'bad':
      return 'text-amber-300';
    case 'very_bad':
      return 'text-rose-300';
  }
}

function getAqiIcon(level: AirQualityData['aqiLevel']): string {
  switch (level) {
    case 'good':
      return '😊';
    case 'moderate':
      return '😐';
    case 'bad':
      return '😷';
    case 'very_bad':
      return '🚫';
  }
}

function getAqiDescription(level: AirQualityData['aqiLevel']): string {
  switch (level) {
    case 'good':
      return '야외 활동하기 좋아요';
    case 'moderate':
      return '민감군은 장시간 야외 활동 주의';
    case 'bad':
      return '야외 활동 자제, 마스크 권장';
    case 'very_bad':
      return '외출 자제, 마스크 필수';
  }
}

function getPm25Range(level: AirQualityData['aqiLevel']): string {
  switch (level) {
    case 'good':
      return '0~15';
    case 'moderate':
      return '16~35';
    case 'bad':
      return '36~75';
    case 'very_bad':
      return '76↑';
  }
}

function getAqiLevel(level: AirQualityData['aqiLevel']): number {
  switch (level) {
    case 'good':
      return 0;
    case 'moderate':
      return 1;
    case 'bad':
      return 2;
    case 'very_bad':
      return 3;
  }
}

const AQI_LEVELS = [
  { label: '좋음', color: 'bg-emerald-400' },
  { label: '보통', color: 'bg-sky-300' },
  { label: '나쁨', color: 'bg-amber-400' },
  { label: '매우나쁨', color: 'bg-rose-400' },
];

export default function DustCard({ airQuality, loading }: DustCardProps) {
  const aqiLabel = getAqiLabel(airQuality.aqiLevel);
  const aqiColor = getAqiColor(airQuality.aqiLevel);
  const aqiIcon = getAqiIcon(airQuality.aqiLevel);
  const description = getAqiDescription(airQuality.aqiLevel);
  const pm25Range = getPm25Range(airQuality.aqiLevel);
  const currentLevel = getAqiLevel(airQuality.aqiLevel);

  // 스켈레톤 로딩 상태
  if (loading) {
    return (
      <div className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full">
        <div className="card-body p-4 items-center text-center animate-pulse">
          <div className="w-12 h-12 bg-white/20 rounded-full" />
          <div className="w-16 h-3 bg-white/20 rounded mt-2" />
          <div className="w-20 h-6 bg-white/20 rounded mt-2" />
          <div className="w-28 h-3 bg-white/20 rounded mt-2" />
          <div className="w-32 h-3 bg-white/20 rounded mt-1" />
          <div className="flex gap-1.5 mt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white/20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full"
      role="region"
      aria-label={`미세먼지 ${aqiLabel}. 초미세먼지 ${airQuality.pm25}. ${description}`}
    >
      <div className="card-body p-4 items-center text-center">
        <div className="text-5xl" aria-hidden="true">💨</div>
        <h4 className="text-label text-glass-muted">미세먼지</h4>
        <div className={`text-heading-1 ${aqiColor} flex items-center gap-1`}>
          <span aria-hidden="true">{aqiIcon}</span>
          <span>{aqiLabel}</span>
        </div>
        <div className="text-caption text-glass-secondary">
          초미세: {airQuality.pm25} · 미세: {airQuality.pm10}
        </div>
        <div className="text-xs text-glass-muted mt-1">
          {description}
        </div>
        <div className="text-xs text-glass-muted mt-0.5">
          ({aqiLabel} 기준: 초미세 {pm25Range}㎍/㎥)
        </div>

        {/* 등급 인디케이터 */}
        <div className="flex gap-1.5 mt-2" aria-hidden="true">
          {AQI_LEVELS.map((level, i) => (
            <m.div
              key={level.label}
              className={`w-2 h-2 rounded-full ${
                i <= currentLevel ? level.color : 'bg-white/20'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 500 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
