'use client';

import Link from 'next/link';
import { getPopularCities } from '@/lib/cities';

interface PopularCitiesProps {
  currentCitySlug?: string;
  isLight: boolean;
}

export default function PopularCities({ currentCitySlug, isLight }: PopularCitiesProps) {
  const cities = getPopularCities(currentCitySlug);

  const secondaryText = isLight ? 'text-[rgba(30,30,50,0.7)]' : 'text-white/80';
  const mutedText = isLight ? 'text-[rgba(30,30,50,0.4)]' : 'text-white/45';

  const glassOuter = isLight
    ? 'bg-white/25 border border-white/35'
    : 'bg-white/15 border border-white/20';

  const glassInner = isLight
    ? 'bg-white/20 border border-white/15'
    : 'bg-white/10 border border-white/15';

  return (
    <div className={`${glassOuter} backdrop-blur-md rounded-[18px] p-5 shadow-lg mt-3`}>
      <div className="flex flex-col items-center">
        <h3 className={`text-xs font-medium ${mutedText} mb-3`}>
          다른 도시 날씨
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className={`${glassInner} backdrop-blur rounded-[20px] px-4 py-2 text-sm ${secondaryText}
                         transition-colors hover:bg-white/25 active:bg-white/30`}
            >
              {city.name}
            </Link>
          ))}
        </div>
        <Link
          href="/cities"
          className={`text-sm ${mutedText} hover:underline mt-2 transition-colors`}
        >
          전체 도시 보기 →
        </Link>
      </div>
    </div>
  );
}
