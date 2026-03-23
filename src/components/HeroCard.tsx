'use client';

import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import GlassCard, { GlassInner } from './GlassCard';
import { useAIMessage } from '@/lib/useAIMessage';
import type { WeatherData } from '@/types/weather';
import type { OutingScore } from '@/types/score';

interface HeroCardProps {
  locationName: string;
  weather: WeatherData;
  score: OutingScore;
  isLight: boolean;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isFromCache?: boolean;
  cacheReason?: string | null;
  onSearchClick?: () => void;
  isViewingOtherLocation?: boolean;
  onReturnToCurrentLocation?: () => void;
  weatherContext?: {
    temperature: number;
    feelsLike: number;
    weatherMain: string;
    pm25: number;
    humidity?: number;
    windSpeed?: number;
    uvIndex?: number;
  };
}

// ── helpers ──────────────────────────────────────────────

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return '방금 업데이트';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return '오래 전';
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

function getWeatherEmoji(weatherMain: string): string {
  const w = weatherMain.toLowerCase();
  if (w === 'rain' || w === 'drizzle' || w === 'shower') return '🌧️';
  if (w === 'thunderstorm') return '⛈️';
  if (w === 'snow') return '❄️';
  if (w === 'mist' || w === 'fog' || w === 'haze') return '☁️';
  if (w === 'clear') return '☀️';
  if (w === 'clouds' || w === 'overcast') return '☁️';
  return '🌤️';
}

function getScoreColor(level: OutingScore['level'], isLight: boolean): string {
  if (isLight) {
    switch (level) {
      case 'perfect':
      case 'excellent':
      case 'good':
      case 'fair':
        return 'text-[rgba(30,30,50,0.85)]';
      case 'moderate':
        return 'text-amber-600';
      case 'poor':
        return 'text-orange-500';
      case 'bad':
        return 'text-rose-500';
    }
  }
  switch (level) {
    case 'perfect':
    case 'excellent':
      return 'text-white';
    case 'good':
      return 'text-white/90';
    case 'fair':
      return 'text-white/80';
    case 'moderate':
      return 'text-amber-200';
    case 'poor':
      return 'text-orange-200';
    case 'bad':
      return 'text-rose-200';
  }
}

function getScoreEmoji(level: OutingScore['level']): string {
  switch (level) {
    case 'perfect':
      return '🤩';
    case 'excellent':
      return '😊';
    case 'good':
      return '🙂';
    case 'fair':
      return '😌';
    case 'moderate':
      return '😐';
    case 'poor':
      return '🙁';
    case 'bad':
      return '🏠';
  }
}

const BREAKDOWN_LABELS: Record<string, { label: string; max: number; icon: string }> = {
  feelsLikeTemp: { label: '체감온도', max: 65, icon: '🌡️' },
  weather: { label: '날씨', max: 15, icon: '🌤️' },
  fineDust: { label: '미세먼지', max: 10, icon: '💨' },
  uv: { label: '자외선', max: 5, icon: '☀️' },
  humidity: { label: '습도', max: 5, icon: '💧' },
};

// ── sub-components ────────────────────────────────────────

function BreakdownBar({
  value,
  max,
  label,
  icon,
  delay = 0,
}: {
  value: number;
  max: number;
  label: string;
  icon: string;
  delay?: number;
}) {
  const percentage = (value / max) * 100;

  return (
    <m.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <span className="text-sm" aria-hidden="true">{icon}</span>
      <span className="text-caption text-glass-muted w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <m.div
          className="h-full rounded-full"
          style={{
            background: percentage >= 70
              ? 'linear-gradient(90deg, #34d399, #4ade80)'
              : percentage >= 40
                ? 'linear-gradient(90deg, #fbbf24, #facc15)'
                : 'linear-gradient(90deg, #fb923c, #f87171)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.1, duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-caption text-glass-secondary w-12 text-right">
        {value ?? 0}/{max}
      </span>
    </m.div>
  );
}

function MessageSkeleton() {
  return (
    <div className="flex items-center justify-center gap-1">
      <m.span
        className="inline-block w-2 h-2 bg-white/30 rounded-full"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
      />
      <m.span
        className="inline-block w-2 h-2 bg-white/30 rounded-full"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
      />
      <m.span
        className="inline-block w-2 h-2 bg-white/30 rounded-full"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
}

// ── main component ────────────────────────────────────────

export default function HeroCard({
  locationName,
  weather,
  score,
  isLight,
  lastUpdated,
  onRefresh,
  isRefreshing,
  isFromCache,
  cacheReason,
  onSearchClick,
  isViewingOtherLocation,
  onReturnToCurrentLocation,
  weatherContext,
}: HeroCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const scoreEmoji = getScoreEmoji(score.level);
  const scoreColorClass = getScoreColor(score.level, isLight);
  const weatherEmoji = getWeatherEmoji(weather.weatherMain);
  const weatherLabel = getWeatherLabel(weather.weatherMain);

  const primaryText = isLight ? 'text-[rgba(30,30,50,0.85)]' : 'text-white/95';
  const secondaryText = isLight ? 'text-[rgba(30,30,50,0.7)]' : 'text-white/80';
  const mutedText = isLight ? 'text-[rgba(30,30,50,0.4)]' : 'text-white/45';

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleLocationReset = () => {
    try {
      localStorage.removeItem('last_location');
    } catch {
      // localStorage 사용 불가
    }
    window.location.reload();
  };

  // AI 메시지 훅
  const aiMessageInput = weatherContext
    ? {
        score,
        temperature: weatherContext.temperature,
        feelsLike: weatherContext.feelsLike,
        weatherMain: weatherContext.weatherMain,
        pm25: weatherContext.pm25,
        humidity: weatherContext.humidity,
        windSpeed: weatherContext.windSpeed,
        uvIndex: weatherContext.uvIndex,
      }
    : null;

  const { message: aiMessage, isLoading: aiLoading } = useAIMessage(aiMessageInput);
  const displayMessage = aiMessage || score.message;
  const isMessageLoading = weatherContext && aiLoading && !aiMessage;

  return (
    <GlassCard isLight={isLight} className="flex flex-col gap-3">

      {/* 1. Cache banner */}
      {isFromCache && cacheReason && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
          <svg
            className="w-4 h-4 text-amber-300 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-xs text-amber-200 flex-1">
            이전 위치 표시 중 ({cacheReason})
          </span>
          <button
            onClick={handleLocationReset}
            className="px-2 py-0.5 text-xs text-amber-100 bg-amber-500/30
                       hover:bg-amber-500/50 rounded transition-colors"
          >
            위치 재설정
          </button>
        </div>
      )}

      {/* 2. Top row: location + update time + refresh */}
      <div className="flex items-center justify-between">
        {/* Location (tappable) */}
        {onSearchClick ? (
          <button
            onClick={onSearchClick}
            className="flex items-center gap-1 font-semibold text-base transition-opacity active:opacity-70"
            aria-label="다른 도시 검색"
          >
            <svg
              className={`w-4 h-4 ${mutedText}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className={primaryText}>{locationName}</span>
            <svg
              className={`w-3.5 h-3.5 ${mutedText}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : (
          <div className={`flex items-center gap-1 font-semibold text-base ${primaryText}`}>
            <svg
              className={`w-4 h-4 ${mutedText}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            {locationName}
          </div>
        )}

        {/* Update time + refresh */}
        {lastUpdated && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full
                       hover:bg-white/10 active:bg-white/15
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors touch-manipulation"
            aria-label={isRefreshing ? '새로고침 중' : '새로고침'}
          >
            <span className={`text-xs ${mutedText}`}>
              {isRefreshing ? '업데이트 중...' : getRelativeTime(lastUpdated)}
            </span>
            <svg
              className={`w-3 h-3 ${mutedText} ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 3. "내 위치로" button (conditional) */}
      {isViewingOtherLocation && onReturnToCurrentLocation && (
        <button
          onClick={onReturnToCurrentLocation}
          className={`self-start flex items-center gap-1 px-3 py-1 rounded-full text-xs
                     ${secondaryText} hover:bg-white/10 active:bg-white/15
                     transition-colors touch-manipulation`}
          aria-label="현재 위치로 돌아가기"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          내 위치로
        </button>
      )}

      {/* 4. Main area: weather (left) + score (right) */}
      <div className="flex items-start justify-between gap-4">

        {/* Left: temperature + weather info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <span
              className={primaryText}
              style={{ fontSize: '56px', lineHeight: 1, fontWeight: 200 }}
            >
              {weather.temperature}°
            </span>
            <m.span
              className="text-3xl mb-1"
              aria-hidden="true"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {weatherEmoji}
            </m.span>
          </div>
          <span className={`text-base font-medium ${secondaryText}`}>{weatherLabel}</span>
          <span className={`text-sm ${mutedText}`}>체감 {weather.feelsLike}°</span>
        </div>

        {/* Right: score (tappable to expand) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-col items-center gap-0.5 touch-manipulation"
          aria-expanded={isExpanded}
          aria-label={`외출 점수 ${score.total}점. 탭하여 상세 보기`}
        >
          <span className="text-2xl" aria-hidden="true">{scoreEmoji}</span>
          <span
            className={`font-semibold leading-none ${scoreColorClass}`}
            style={{ fontSize: '36px' }}
          >
            {score.total}
          </span>
          <div className="flex items-center gap-0.5">
            <span className={`text-[10px] uppercase tracking-widest ${mutedText}`}>SCORE</span>
            <m.svg
              className={`w-3 h-3 ${mutedText}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </m.svg>
          </div>
        </button>
      </div>

      {/* 5. Score breakdown (expandable) */}
      <AnimatePresence>
        {isExpanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <GlassInner isLight={isLight} className="space-y-3">
              <p className={`text-xs ${mutedText} text-center`}>점수 상세</p>
              {Object.entries(BREAKDOWN_LABELS).map(([key, { label, max, icon }], index) => (
                <BreakdownBar
                  key={key}
                  value={score.breakdown[key as keyof typeof score.breakdown] as number}
                  max={max}
                  label={label}
                  icon={icon}
                  delay={index * 0.1}
                />
              ))}

              {/* Wind penalty */}
              {score.breakdown.windPenalty < 0 && (
                <m.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <span className="text-sm" aria-hidden="true">💨</span>
                  <span className="text-caption text-glass-muted w-16 shrink-0">풍속</span>
                  <div className="flex-1" />
                  <span className="text-caption text-orange-300">
                    {score.breakdown.windPenalty}점
                  </span>
                </m.div>
              )}

              {/* Tips */}
              {score.tips.length > 0 && (
                <m.div
                  className={`pt-3 border-t border-white/10 text-xs text-center ${mutedText}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  💡 {score.tips.join(' · ')}
                </m.div>
              )}
            </GlassInner>
          </m.div>
        )}
      </AnimatePresence>

      {/* 6. AI message */}
      <GlassInner isLight={isLight}>
        <div className={`text-sm text-center min-h-[1.5rem] ${secondaryText}`}>
          {isMessageLoading ? (
            <MessageSkeleton />
          ) : (
            <p>{displayMessage}</p>
          )}
        </div>
      </GlassInner>

    </GlassCard>
  );
}
