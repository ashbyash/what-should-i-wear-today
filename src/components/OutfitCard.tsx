'use client';

import type { OutfitRecommendation } from '@/types/score';
import { useAIStylingTip } from '@/lib/useAIStylingTip';
import GlassCard from './GlassCard';

interface OutfitCardProps {
  outfit: OutfitRecommendation;
  isLight?: boolean;
  weatherContext?: {
    temperature: number;
    feelsLike: number;
    weatherMain: string;
    pm25: number;
  };
}

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string }> = {
  outer: { label: '아우터', emoji: '🧥' },
  top: { label: '상의', emoji: '👕' },
  bottom: { label: '하의', emoji: '👖' },
  shoes: { label: '신발', emoji: '👟' },
  accessory: { label: '악세서리', emoji: '🧣' },
};

const CATEGORY_ORDER = ['outer', 'top', 'bottom', 'shoes', 'accessory'] as const;

export default function OutfitCard({ outfit, isLight = false, weatherContext }: OutfitCardProps) {
  const { categories, alerts } = outfit;

  // AI 스타일링 팁 훅 (weatherContext가 있을 때만 활성화)
  const stylingTipInput = weatherContext ? {
    categories,
    alerts,
    temperature: weatherContext.temperature,
    feelsLike: weatherContext.feelsLike,
    weatherMain: weatherContext.weatherMain,
    pm25: weatherContext.pm25,
  } : null;

  const { tip: stylingTip, isLoading: tipLoading } = useAIStylingTip(stylingTipInput);
  const isTipLoading = weatherContext && tipLoading && !stylingTip;

  // 접근성을 위한 옷차림 요약 생성
  const outfitSummary = CATEGORY_ORDER
    .filter((key) => categories[key] && categories[key]!.length > 0)
    .map((key) => `${CATEGORY_CONFIG[key].label}: ${categories[key]!.join(', ')}`)
    .join('. ');

  // isLight 기반 텍스트 색상
  const colorPrimary = isLight ? 'text-[rgba(30,30,50,0.85)]' : 'text-white/95';
  const colorSecondary = isLight ? 'text-[rgba(30,30,50,0.7)]' : 'text-white/80';
  const colorMuted = isLight ? 'text-[rgba(30,30,50,0.4)]' : 'text-white/45';
  const borderColor = isLight ? 'border-black/10' : 'border-white/20';

  return (
    <GlassCard
      variant="outer"
      isLight={isLight}
      className="h-full"
    >
      <div
        className="md:max-w-lg md:mx-auto"
        role="region"
        aria-label={`오늘의 옷차림 추천. ${outfitSummary}${alerts.length > 0 ? `. 주의사항: ${alerts.join(', ')}` : ''}${stylingTip ? `. 스타일링 팁: ${stylingTip}` : ''}`}
      >
        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <svg
            className={`w-4 h-4 ${colorMuted}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          <span
            className={`${colorMuted} uppercase font-medium`}
            style={{ fontSize: '10px', letterSpacing: '0.5px' }}
          >
            TODAY&apos;S OUTFIT
          </span>
        </div>

        {/* Category rows */}
        <div className="space-y-2">
          {CATEGORY_ORDER.map((key) => {
            const items = categories[key];
            if (!items || items.length === 0) return null;

            const { label, emoji } = CATEGORY_CONFIG[key];

            return (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="shrink-0 text-center"
                  style={{ fontSize: '18px', width: '24px' }}
                  aria-hidden="true"
                >
                  {emoji}
                </span>
                <span
                  className={`${colorMuted} shrink-0 uppercase`}
                  style={{ fontSize: '11px', width: '32px' }}
                >
                  {label}
                </span>
                <span className={`${colorSecondary}`} style={{ fontSize: '13px' }}>
                  {items.join(', ')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className={`mt-3 pt-3 border-t ${borderColor} space-y-1`} role="alert">
            {alerts.map((alert) => (
              <div key={alert} className={`flex items-center justify-center gap-1.5 ${colorPrimary}`}>
                <span className="text-amber-300" aria-hidden="true">⚠️</span>
                <span className="text-sm font-medium">{alert}</span>
              </div>
            ))}
          </div>
        )}

        {/* AI Styling Tip */}
        {(stylingTip || isTipLoading) && (
          <div className={`mt-3 pt-3 border-t ${borderColor}`}>
            <div className={`flex items-center justify-center gap-1.5 ${colorPrimary} min-h-[1.5rem]`}>
              <span className="text-purple-300" aria-hidden="true">✨</span>
              {isTipLoading ? (
                <span className="flex items-center gap-1">
                  <span className={`inline-block w-1.5 h-1.5 ${isLight ? 'bg-black/20' : 'bg-white/30'} rounded-full animate-pulse`} />
                  <span className={`inline-block w-1.5 h-1.5 ${isLight ? 'bg-black/20' : 'bg-white/30'} rounded-full animate-pulse [animation-delay:0.2s]`} />
                  <span className={`inline-block w-1.5 h-1.5 ${isLight ? 'bg-black/20' : 'bg-white/30'} rounded-full animate-pulse [animation-delay:0.4s]`} />
                </span>
              ) : (
                <span className="text-sm font-medium">{stylingTip}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
