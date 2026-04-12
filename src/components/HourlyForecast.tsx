'use client';

import { Fragment, useRef, useState, useEffect, useCallback } from 'react';
import type { HourlyForecastItem } from '@/types/weather';
import type { CityData } from '@/lib/cities';
import { getWeatherEmoji, getTimeCategoryForHour } from '@/lib/weather-utils';
import GlassCard, { GlassInner } from './GlassCard';

interface HourlyForecastProps {
  data: HourlyForecastItem[] | null;
  loading: boolean;
  city?: CityData;
}

function getDateLabel(dateStr: string): string {
  const itemDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((itemDate.getTime() - today.getTime()) / 86400000);
  if (diffDays === 1) return '내일';
  if (diffDays === 2) return '모레';
  return `${itemDate.getMonth() + 1}/${itemDate.getDate()}`;
}

function HourlySkeleton() {
  return (
    <GlassCard variant="outer">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-0.5 w-14 shrink-0 py-2 px-1 bg-interactive-hover rounded-lg animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-8 h-2.5 bg-white/20 rounded" />
            <div className="w-7 h-7 bg-white/20 rounded-full" />
            <div className="w-6 h-3 bg-white/20 rounded" />
            <div className="w-5 h-2 bg-white/20 rounded" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function HourlyForecast({ data, loading, city }: HourlyForecastProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const primaryColor = 'text-skin-primary';
  const mutedColor = 'text-skin-muted';

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll, data]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  if (loading) return <HourlySkeleton />;
  if (!data || data.length === 0) return null;

  return (
    <GlassCard variant="outer">
      {/* 제목 */}
      <div className={`${mutedColor} text-label uppercase tracking-wide mb-3`}>
        HOURLY FORECAST
      </div>

      <div className="relative" role="region" aria-label="시간별 예보">
        {/* 스크롤 컨테이너 */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth px-1 flex-1 items-stretch"
        >
          {data.map((item, i) => {
            const isNow = i === 0;

            const timeCategory = (item.date && city)
              ? getTimeCategoryForHour(item.time, city.lat, city.lon, city.utcOffset)
              : undefined;
            const emoji = getWeatherEmoji(item.weatherMain, timeCategory);

            const prevDate = i > 0 ? data[i - 1]?.date : undefined;
            const showDivider = item.date && prevDate && item.date !== prevDate;

            return (
              <Fragment key={`${item.date}-${item.time}-${i}`}>
                {showDivider && (
                  <div
                    className="flex flex-col items-center justify-center w-12 shrink-0 snap-start"
                    role="separator"
                  >
                    <div className="h-5 w-px bg-white/30" />
                    <span className={`text-xs font-medium bg-interactive-active px-2 py-0.5 rounded-full whitespace-nowrap ${primaryColor}`}>
                      {getDateLabel(item.date!)}
                    </span>
                    <div className="h-5 w-px bg-white/30" />
                  </div>
                )}

                <GlassInner
                  className={`flex flex-col items-center justify-center gap-1 shrink-0 snap-start transition-colors self-stretch
                    min-w-[52px] md:min-w-[64px] text-center !py-3 !px-2 md:!px-3
                    ${isNow ? 'shadow-md scale-105' : ''}`}
                >
                  <span className={`text-caption md:text-body ${isNow ? `${primaryColor} font-semibold` : mutedColor}`}>
                    {isNow && i === 0 ? '지금' : item.time}
                  </span>

                  <span className="text-xl md:text-2xl" aria-hidden="true">{emoji}</span>

                  <span className={`text-body md:text-headline ${isNow ? `${primaryColor} font-semibold` : primaryColor}`}>
                    {item.temperature}°
                  </span>

                  {item.precipitationProbability != null && item.precipitationProbability > 0 && (
                    <span className="text-[11px] leading-none text-blue-200/80">
                      💧{item.precipitationProbability}%
                    </span>
                  )}
                </GlassInner>
              </Fragment>
            );
          })}
        </div>

        {/* 데스크톱 좌우 화살표 */}
        <button
          onClick={() => scroll('left')}
          className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10
            w-8 h-8 items-center justify-center rounded-full
            bg-black/30 hover:bg-black/40 border border-interactive-strong
            text-skin-primary transition-all duration-200
            ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-label="이전 시간"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => scroll('right')}
          className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10
            w-8 h-8 items-center justify-center rounded-full
            bg-black/30 hover:bg-black/40 border border-interactive-strong
            text-skin-primary transition-all duration-200
            ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-label="다음 시간"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </GlassCard>
  );
}
