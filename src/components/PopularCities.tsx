'use client';

import Link from 'next/link';
import { getPopularCities } from '@/lib/cities';
import GlassCard, { GlassInner } from './GlassCard';

interface PopularCitiesProps {
  currentCitySlug?: string;
}

export default function PopularCities({ currentCitySlug }: PopularCitiesProps) {
  const cities = getPopularCities(currentCitySlug);

  return (
    <GlassCard className="mt-3">
      <div className="flex flex-col items-center">
        <h3 className="text-label text-skin-muted mb-3">
          다른 도시 날씨
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
            >
              <GlassInner
                className="px-4 py-2 text-sm text-skin-secondary
                           hover:brightness-125 active:brightness-150
                           transition-all cursor-pointer"
              >
                {city.name}
              </GlassInner>
            </Link>
          ))}
        </div>
        <Link
          href="/cities"
          className="text-sm text-skin-muted hover:underline mt-2 transition-colors"
        >
          전체 도시 보기 →
        </Link>
      </div>
    </GlassCard>
  );
}
