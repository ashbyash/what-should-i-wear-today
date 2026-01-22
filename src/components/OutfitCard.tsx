import type { OutfitRecommendation } from '@/types/score';

interface OutfitCardProps {
  outfit: OutfitRecommendation;
}

const CATEGORY_LABELS: Record<string, string> = {
  outer: '아우터',
  top: '상의',
  bottom: '하의',
  shoes: '신발',
  accessory: '악세서리',
};

const CATEGORY_ORDER = ['outer', 'top', 'bottom', 'shoes', 'accessory'] as const;

export default function OutfitCard({ outfit }: OutfitCardProps) {
  const { categories, alerts } = outfit;

  return (
    <div className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full">
      <div className="card-body p-4">
        <h3 className="card-title text-heading-2 justify-center text-glass-secondary">
          <svg className="w-5 h-5 text-glass-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            return (
              <div key={key} className="flex items-baseline gap-3">
                <span className="text-caption text-glass-muted w-14 shrink-0">
                  {CATEGORY_LABELS[key]}
                </span>
                <span className="text-body text-glass-secondary">
                  {items.join(', ')}
                </span>
              </div>
            );
          })}
        </div>

        {alerts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20 space-y-1">
            {alerts.map((alert) => (
              <div key={alert} className="flex items-center justify-center gap-1 text-amber-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-body">{alert}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
