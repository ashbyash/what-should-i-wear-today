'use client';

import Link from 'next/link';
import { getPopularCities } from '@/lib/cities';
import { getThemeColors } from '@/lib/theme-colors';

interface PopularCitiesProps {
  currentCitySlug?: string;
  isLight: boolean;
}

export default function PopularCities({ currentCitySlug, isLight }: PopularCitiesProps) {
  const colors = getThemeColors(isLight);
  const cities = getPopularCities(currentCitySlug);

  return (
    <div className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg mt-3">
      <div className="card-body p-4 items-center">
        <h3 className={`text-xs font-medium ${colors.muted} mb-3`}>
          다른 도시 날씨
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className={`px-3 py-1.5 rounded-full ${colors.bgStrong} border ${colors.borderStrong}
                         text-sm ${colors.secondary}
                         ${colors.hoverBg} ${colors.activeBg}
                         transition-colors`}
            >
              {city.name}
            </Link>
          ))}
        </div>
        <Link
          href="/cities"
          className={`text-sm ${colors.muted} hover:underline mt-2`}
        >
          전체 도시 보기 →
        </Link>
      </div>
    </div>
  );
}
