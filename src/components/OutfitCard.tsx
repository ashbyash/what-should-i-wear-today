'use client';

import type { OutfitRecommendation } from '@/types/score';

interface OutfitCardProps {
  outfit: OutfitRecommendation;
}

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string }> = {
  outer: { label: '아우터', emoji: '🧥' },
  top: { label: '상의', emoji: '👕' },
  bottom: { label: '하의', emoji: '👖' },
  shoes: { label: '신발', emoji: '👟' },
  accessory: { label: '악세서리', emoji: '🧣' },
};

const CATEGORY_ORDER = ['outer', 'top', 'bottom', 'shoes', 'accessory'] as const;

export default function OutfitCard({ outfit }: OutfitCardProps) {
  const { categories, alerts } = outfit;

  // 접근성을 위한 옷차림 요약 생성
  const outfitSummary = CATEGORY_ORDER
    .filter((key) => categories[key] && categories[key]!.length > 0)
    .map((key) => `${CATEGORY_CONFIG[key].label}: ${categories[key]!.join(', ')}`)
    .join('. ');

  return (
    <div
      className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full"
      role="region"
      aria-label={`오늘의 옷차림 추천. ${outfitSummary}${alerts.length > 0 ? `. 주의사항: ${alerts.join(', ')}` : ''}`}
    >
      <div className="card-body p-4">
        <h3 className="card-title text-heading-2 justify-center text-glass-secondary">
          <svg className="w-5 h-5 text-glass-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          오늘의 옷차림
        </h3>

        <div className="mt-3 space-y-2">
          {CATEGORY_ORDER.map((key) => {
            const items = categories[key];
            if (!items || items.length === 0) return null;

            const { label, emoji } = CATEGORY_CONFIG[key];

            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-base" aria-hidden="true">{emoji}</span>
                <span className="text-caption text-glass-muted w-12 shrink-0">
                  {label}
                </span>
                <span className="text-body text-glass-secondary">
                  {items.join(', ')}
                </span>
              </div>
            );
          })}
        </div>

        {alerts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20 space-y-1" role="alert">
            {alerts.map((alert) => (
              <div key={alert} className="flex items-center justify-center gap-1.5 text-white">
                <span className="text-amber-300" aria-hidden="true">⚠️</span>
                <span className="text-body font-medium">{alert}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
