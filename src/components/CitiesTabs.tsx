'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CityData } from '@/lib/cities';
import GlassCard from './GlassCard';

interface CitiesTabsProps {
  domesticRegions: [string, CityData[]][];
  overseasRegions: [string, CityData[]][];
  domesticCount: number;
  overseasCount: number;
}

export default function CitiesTabs({
  domesticRegions, overseasRegions, domesticCount, overseasCount,
}: CitiesTabsProps) {
  const [tab, setTab] = useState<'domestic' | 'overseas'>('domestic');

  return (
    <>
      {/* 탭 토글 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('domestic')}
          className={`px-4 py-2 rounded-full text-body font-medium transition-colors
            ${tab === 'domestic'
              ? 'bg-interactive-active text-skin-primary shadow-md'
              : 'bg-interactive-hover text-skin-muted hover:bg-interactive-active'
            }`}
        >
          국내 {domesticCount}
        </button>
        <button
          onClick={() => setTab('overseas')}
          className={`px-4 py-2 rounded-full text-body font-medium transition-colors
            ${tab === 'overseas'
              ? 'bg-interactive-active text-skin-primary shadow-md'
              : 'bg-interactive-hover text-skin-muted hover:bg-interactive-active'
            }`}
        >
          해외 {overseasCount}
        </button>
      </div>

      {/* 국내 도시 — SEO: hidden이어도 HTML에 <a> 존재 */}
      <section className={tab === 'domestic' ? '' : 'hidden'}>
        <div className="space-y-3">
          {domesticRegions.map(([region, cities]) => (
            <GlassCard key={region}>
              <h3 className="text-label text-skin-muted mb-2">{region}</h3>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${city.slug}`}
                    className="px-3 py-1.5 rounded-full bg-interactive-hover border border-interactive text-body text-skin-secondary hover:bg-interactive-active active:bg-interactive-active transition-colors"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 해외 여행지 — SEO: hidden이어도 HTML에 <a> 존재 */}
      <section className={tab === 'overseas' ? '' : 'hidden'}>
        <div className="space-y-3">
          {overseasRegions.map(([region, cities]) => (
            <GlassCard key={region}>
              <h3 className="text-label text-skin-muted mb-2">{region}</h3>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${city.slug}`}
                    className="px-3 py-1.5 rounded-full bg-interactive-hover border border-interactive text-body text-skin-secondary hover:bg-interactive-active active:bg-interactive-active transition-colors"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </>
  );
}
