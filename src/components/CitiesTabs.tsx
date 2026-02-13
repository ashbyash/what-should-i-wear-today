'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CityData } from '@/lib/cities';

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
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${tab === 'domestic'
              ? 'bg-white/25 text-white shadow-md'
              : 'bg-white/10 text-white/60 hover:bg-white/15'
            }`}
        >
          국내 {domesticCount}
        </button>
        <button
          onClick={() => setTab('overseas')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${tab === 'overseas'
              ? 'bg-white/25 text-white shadow-md'
              : 'bg-white/10 text-white/60 hover:bg-white/15'
            }`}
        >
          해외 {overseasCount}
        </button>
      </div>

      {/* 국내 도시 — SEO: hidden이어도 HTML에 <a> 존재 */}
      <section className={tab === 'domestic' ? '' : 'hidden'}>
        <div className="space-y-3">
          {domesticRegions.map(([region, cities]) => (
            <div key={region} className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg">
              <div className="card-body p-4">
                <h3 className="text-xs font-medium text-white/70 mb-2">{region}</h3>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/${city.slug}`}
                      className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm text-white/90 hover:bg-white/20 active:bg-white/25 transition-colors"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 해외 여행지 — SEO: hidden이어도 HTML에 <a> 존재 */}
      <section className={tab === 'overseas' ? '' : 'hidden'}>
        <div className="space-y-3">
          {overseasRegions.map(([region, cities]) => (
            <div key={region} className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg">
              <div className="card-body p-4">
                <h3 className="text-xs font-medium text-white/70 mb-2">{region}</h3>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/${city.slug}`}
                      className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm text-white/90 hover:bg-white/20 active:bg-white/25 transition-colors"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
