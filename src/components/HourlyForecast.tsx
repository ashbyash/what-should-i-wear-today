'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { HourlyForecastItem } from '@/types/weather';
import { getWeatherEmoji } from '@/lib/weather-utils';

interface HourlyForecastProps {
  data: HourlyForecastItem[] | null;
  loading: boolean;
}

function HourlySkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1.5 w-14 shrink-0 py-2 px-1 bg-white/10 rounded-lg animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="w-8 h-2.5 bg-white/20 rounded" />
          <div className="w-7 h-7 bg-white/20 rounded-full" />
          <div className="w-6 h-3 bg-white/20 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function HourlyForecast({ data, loading }: HourlyForecastProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  // 현재 시각의 HH 구하기 (클라이언트 로컬 시간)
  const nowHour = String(new Date().getHours()).padStart(2, '0');
  const nowLabel = `${nowHour}:00`;

  return (
    <div className="relative" role="region" aria-label="시간별 예보">
      {/* 스크롤 컨테이너 */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
      >
        {data.map((item, i) => {
          const isNow = i === 0 || item.time === nowLabel;
          return (
            <div
              key={`${item.time}-${i}`}
              className={`flex flex-col items-center gap-1 w-14 shrink-0 py-2 px-1 rounded-lg snap-start transition-colors
                ${isNow
                  ? 'bg-white/25 shadow-md scale-105'
                  : 'bg-white/10 hover:bg-white/15'
                }`}
            >
              <span className={`text-xs ${isNow ? 'text-glass-primary font-semibold' : 'text-glass-muted'}`}>
                {isNow && i === 0 ? '지금' : item.time}
              </span>
              <span className="text-xl" aria-hidden="true">
                {getWeatherEmoji(item.weatherMain)}
              </span>
              <span className={`text-sm ${isNow ? 'text-glass-primary font-semibold' : 'text-glass-secondary'}`}>
                {item.temperature}°
              </span>
            </div>
          );
        })}
      </div>

      {/* 데스크톱 좌우 화살표 */}
      <button
        onClick={() => scroll('left')}
        className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10
          w-8 h-8 items-center justify-center rounded-full
          bg-black/30 hover:bg-black/40 border border-white/20
          text-white transition-all duration-200
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
          bg-black/30 hover:bg-black/40 border border-white/20
          text-white transition-all duration-200
          ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="다음 시간"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
