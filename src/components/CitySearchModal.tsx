'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import { CITIES, getDomesticCities, getOverseasCities } from '@/lib/cities';
import type { CityData } from '@/lib/cities';
import { useLocationSearch } from '@/lib/useLocationSearch';
import { TIME_GRADIENTS, type ThemeConfig } from '@/lib/theme';
import type { SearchResult } from '@/types/location';

// theme 없을 때 기본값 (night)
const DEFAULT_GRADIENT = TIME_GRADIENTS.night;

// 빠른 선택용 도시 (국내 + 해외 인기)
const FEATURED_SLUGS = [
  'jeju',
  'gangneung',
  'busan',
  'osaka',
  'bangkok',
  'tokyo',
];

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeConfig;
}

export default function CitySearchModal({
  isOpen,
  onClose,
  theme,
}: CitySearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // 통합 검색 훅
  const { results, isLoading, isEmpty } = useLocationSearch(searchQuery);

  // 검색어 없을 때 전체 도시 표시
  const displayResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return CITIES.map((city) => ({
        type: 'predefined' as const,
        name: city.name,
        nameEn: city.nameEn,
        description: city.description,
        lat: city.lat,
        lon: city.lon,
        slug: city.slug,
      }));
    }
    return results;
  }, [searchQuery, results]);

  // 해외 도시를 국가별로 그룹핑
  const overseasByCountry = useMemo(() => {
    const overseas = getOverseasCities();
    const grouped: Record<string, CityData[]> = {};
    overseas.forEach((city) => {
      const country = city.country ?? '기타';
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(city);
    });
    return grouped;
  }, []);

  const domesticCities = useMemo(() => getDomesticCities(), []);

  // 빠른 선택용 도시 데이터
  const featuredCities = useMemo(() => {
    return FEATURED_SLUGS.map((slug) =>
      CITIES.find((city) => city.slug === slug)
    ).filter(Boolean);
  }, []);

  // 검색 결과 선택 핸들러
  const handleSelect = (result: SearchResult) => {
    onClose();
    if (result.type === 'predefined' && result.slug) {
      router.push(`/${result.slug}`);
    } else {
      router.push(`/?lat=${result.lat}&lon=${result.lon}`);
    }
  };

  const handleCitySelect = (slug: string) => {
    onClose();
    router.push(`/${slug}`);
  };

  const handleGoToCurrentLocation = () => {
    onClose();
    router.push('/');
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  // 테마 기반 스타일 계산
  const gradient = theme?.gradient ?? DEFAULT_GRADIENT;
  const isLight = theme?.isLight ?? false;
  const backgroundStyle = {
    background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})`,
  };

  // 테마별 색상 클래스
  const colors = {
    primary: isLight ? 'text-slate-900' : 'text-glass-primary',
    secondary: isLight ? 'text-slate-700' : 'text-glass-secondary',
    muted: isLight ? 'text-slate-500' : 'text-glass-muted',
    border: isLight ? 'border-black/10' : 'border-white/10',
    borderStrong: isLight ? 'border-black/20' : 'border-white/20',
    bg: isLight ? 'bg-black/5' : 'bg-white/10',
    bgStrong: isLight ? 'bg-black/10' : 'bg-white/15',
    hoverBg: isLight ? 'hover:bg-black/10' : 'hover:bg-white/10',
    activeBg: isLight ? 'active:bg-black/15' : 'active:bg-white/20',
    focusRing: isLight ? 'focus:ring-black/20' : 'focus:ring-white/30',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="fixed inset-0 z-50 flex flex-col"
          style={backgroundStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* 검색 가독성을 위한 오버레이 */}
          <div
            className={`absolute inset-0 ${isLight ? 'bg-black/5' : 'bg-black/20'}`}
          />
          {/* 헤더 */}
          <m.header
            className={`relative z-10 flex items-center justify-between px-4 py-4 border-b ${colors.border}`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className={`text-lg font-semibold ${colors.primary}`}>
              도시 선택
            </h2>
            <button
              onClick={handleClose}
              className={`p-2 rounded-full ${colors.hoverBg} ${colors.activeBg} transition-colors`}
              aria-label="닫기"
            >
              <svg
                className={`w-6 h-6 ${colors.secondary}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </m.header>

          {/* 검색창 */}
          <m.div
            className="relative z-10 px-4 py-3"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="relative">
              <svg
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${colors.muted}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="도시, 동네 검색..."
                className={`w-full pl-10 pr-12 py-3 rounded-xl ${colors.bg} border ${colors.borderStrong}
                           ${colors.primary}
                           ${isLight ? 'placeholder:text-slate-500' : 'placeholder:text-white/60'}
                           focus:outline-none focus:ring-2 ${colors.focusRing} focus:border-transparent
                           transition-all`}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* 로딩 스피너 */}
                {isLoading && (
                  <span className="loading loading-spinner loading-xs opacity-70"></span>
                )}
                {/* 검색어 지우기 버튼 */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`p-1 rounded-full ${colors.hoverBg}`}
                    aria-label="검색어 지우기"
                  >
                    <svg
                      className={`w-4 h-4 ${colors.muted}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </m.div>

          {/* 내 현재 위치 사용 버튼 (검색창 바로 아래 고정) */}
          <m.div
            className={`relative z-10 px-4 pb-3 border-b ${colors.border}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18 }}
          >
            <button
              onClick={handleGoToCurrentLocation}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                         ${colors.bgStrong} border ${colors.borderStrong}
                         ${colors.hoverBg} ${colors.activeBg}
                         transition-colors text-left`}
            >
              <svg
                className={`w-5 h-5 ${colors.primary}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className={`flex-1 ${colors.primary} font-medium`}>내 현재 위치 사용</p>
              <svg
                className={`w-5 h-5 ${colors.muted}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </m.div>

          {/* 컨텐츠 영역 */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-4">
            {/* 빠른 선택 (검색어 없을 때만) */}
            {!searchQuery && (
              <m.section
                className="mb-6"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className={`text-sm font-medium ${colors.muted} mb-3`}>
                  빠른 선택
                </h3>
                <div className="flex flex-wrap gap-2">
                  {featuredCities.map((city) => (
                    <button
                      key={city!.slug}
                      onClick={() => handleCitySelect(city!.slug)}
                      className={`px-4 py-2 rounded-full ${colors.bgStrong} border ${colors.borderStrong}
                                 text-sm ${colors.secondary}
                                 ${colors.hoverBg} ${colors.activeBg}
                                 transition-colors`}
                    >
                      {city!.name}
                    </button>
                  ))}
                </div>
              </m.section>
            )}

            {/* 검색 결과 리스트 */}
            {searchQuery ? (
              <m.section
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <h3 className={`text-sm font-medium ${colors.muted} mb-3`}>
                  검색 결과 ({displayResults.length})
                </h3>
                <div className="space-y-1">
                  {displayResults.length > 0 ? (
                    displayResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.name}-${index}`}
                        onClick={() => handleSelect(result)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                   ${colors.hoverBg} ${colors.activeBg}
                                   transition-colors text-left`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`${colors.primary} font-medium`}>
                            {result.name}
                            {result.type === 'predefined' && result.nameEn && (
                              <span className={`ml-2 text-sm ${colors.muted}`}>
                                {result.nameEn}
                              </span>
                            )}
                          </p>
                          <p className={`text-sm ${colors.muted} mt-0.5 truncate`}>
                            {result.description}
                          </p>
                        </div>
                        <svg
                          className={`w-5 h-5 ${colors.muted} flex-shrink-0`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ))
                  ) : isEmpty ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">🔍</div>
                      <p className={`${colors.muted} font-medium`}>
                        &apos;{searchQuery}&apos; 검색 결과가 없습니다
                      </p>
                      <p className={`${colors.muted} text-sm mt-2`}>
                        다른 키워드로 검색해보세요
                      </p>
                    </div>
                  ) : null}
                </div>
              </m.section>
            ) : (
              <>
                {/* 국내 도시 */}
                <m.section
                  className="mb-6"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <h3 className={`text-sm font-medium ${colors.muted} mb-3`}>
                    국내 도시 ({domesticCities.length})
                  </h3>
                  <div className="space-y-1">
                    {domesticCities.map((city) => (
                      <button
                        key={city.slug}
                        onClick={() => handleCitySelect(city.slug)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                   ${colors.hoverBg} ${colors.activeBg}
                                   transition-colors text-left`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`${colors.primary} font-medium`}>
                            {city.name}
                            <span className={`ml-2 text-sm ${colors.muted}`}>
                              {city.nameEn}
                            </span>
                          </p>
                          <p className={`text-sm ${colors.muted} mt-0.5 truncate`}>
                            {city.description}
                          </p>
                        </div>
                        <svg
                          className={`w-5 h-5 ${colors.muted} flex-shrink-0`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                </m.section>

                {/* 해외 여행지 (국가별 그룹핑) */}
                <m.section
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className={`text-sm font-medium ${colors.muted} mb-3`}>
                    해외 여행지 ({getOverseasCities().length})
                  </h3>
                  {Object.entries(overseasByCountry).map(([country, cities]) => (
                    <div key={country} className="mb-4">
                      <p className={`text-xs font-medium ${colors.muted} mb-1 px-2`}>
                        {country}
                      </p>
                      <div className="space-y-1">
                        {cities.map((city) => (
                          <button
                            key={city.slug}
                            onClick={() => handleCitySelect(city.slug)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                       ${colors.hoverBg} ${colors.activeBg}
                                       transition-colors text-left`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className={`${colors.primary} font-medium`}>
                                {city.name}
                                <span className={`ml-2 text-sm ${colors.muted}`}>
                                  {city.nameEn}
                                </span>
                              </p>
                              <p className={`text-sm ${colors.muted} mt-0.5 truncate`}>
                                {city.description}
                              </p>
                            </div>
                            <svg
                              className={`w-5 h-5 ${colors.muted} flex-shrink-0`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </m.section>
              </>
            )}
          </div>

        </m.div>
      )}
    </AnimatePresence>
  );
}
