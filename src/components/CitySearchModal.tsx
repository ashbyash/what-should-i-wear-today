'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import { CITIES, getDomesticCities, getOverseasCitiesByRegion } from '@/lib/cities';
import type { CityData } from '@/lib/cities';
import { useLocationSearch } from '@/lib/useLocationSearch';
import { TIME_GRADIENTS, type ThemeConfig } from '@/lib/theme';
import { DURATION } from '@/lib/design-tokens';
import type { SearchResult } from '@/types/location';

// theme 없을 때 기본값 (night)
const DEFAULT_GRADIENT = TIME_GRADIENTS.night;

// 빠른 선택용 도시
const FEATURED_DOMESTIC = ['jeju', 'busan', 'gangneung'];
const FEATURED_OVERSEAS = ['osaka', 'bangkok', 'tokyo'];

const DOMESTIC_PREVIEW_COUNT = 5;

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
  const [searchTab, setSearchTab] = useState<'domestic' | 'overseas'>('domestic');
  const [showAllDomestic, setShowAllDomestic] = useState(false);

  // 통합 검색 훅
  const { domesticResults, overseasResults, isLoading, isEmpty } = useLocationSearch(searchQuery);

  // 현재 탭의 검색 결과
  const activeSearchResults = useMemo(() => {
    return searchTab === 'domestic' ? domesticResults : overseasResults;
  }, [searchTab, domesticResults, overseasResults]);

  // 해외 도시를 지역별로 그룹핑 (일본/동남아/기타)
  const overseasByRegion = useMemo(() => getOverseasCitiesByRegion(), []);

  const domesticCities = useMemo(() => getDomesticCities(), []);

  // 빠른 선택용 도시 데이터
  const featuredDomestic = useMemo(() => {
    return FEATURED_DOMESTIC.map((slug) =>
      CITIES.find((city) => city.slug === slug)
    ).filter(Boolean) as CityData[];
  }, []);

  const featuredOverseas = useMemo(() => {
    return FEATURED_OVERSEAS.map((slug) =>
      CITIES.find((city) => city.slug === slug)
    ).filter(Boolean) as CityData[];
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
  const backgroundStyle = {
    background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.via}, ${gradient.to})`,
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
          transition={{ duration: DURATION.fast }}
        >
          {/* 검색 가독성을 위한 오버레이 */}
          <div
            className="absolute inset-0 bg-black/20"
          />
          {/* 헤더 */}
          <m.header
            className="relative z-10 flex items-center justify-between px-4 py-4 border-b border-interactive"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-title text-skin-primary">
              도시 선택
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-interactive-hover active:bg-interactive-active transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-6 h-6 text-skin-secondary"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-skin-muted"
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
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-interactive-hover border border-interactive-strong
                           text-skin-primary
                           placeholder:text-skin-muted
                           focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent
                           transition-all"
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
                    className="p-1 rounded-full hover:bg-interactive-hover"
                    aria-label="검색어 지우기"
                  >
                    <svg
                      className="w-4 h-4 text-skin-muted"
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
            className="relative z-10 px-4 pb-3 border-b border-interactive"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18 }}
          >
            <button
              onClick={handleGoToCurrentLocation}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                         bg-interactive-active border border-interactive-strong
                         hover:bg-interactive-hover active:bg-interactive-active
                         transition-colors text-left"
            >
              <svg
                className="w-5 h-5 text-skin-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="flex-1 text-skin-primary font-medium">내 현재 위치 사용</p>
              <svg
                className="w-5 h-5 text-skin-muted"
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
                className="pt-4 mb-6"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* 국내 인기 */}
                <div className="mb-3">
                  <h3 className="text-label text-skin-muted mb-2">
                    국내 인기
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {featuredDomestic.map((city) => (
                      <button
                        key={city.slug}
                        onClick={() => handleCitySelect(city.slug)}
                        className="px-4 py-2 rounded-full bg-interactive-active border border-interactive-strong
                                   text-body text-skin-secondary
                                   hover:bg-interactive-hover active:bg-interactive-active
                                   transition-colors"
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 해외 인기 */}
                <div>
                  <h3 className="text-label text-skin-muted mb-2">
                    해외 인기
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {featuredOverseas.map((city) => (
                      <button
                        key={city.slug}
                        onClick={() => handleCitySelect(city.slug)}
                        className="px-4 py-2 rounded-full bg-interactive-active border border-interactive-strong
                                   text-body text-skin-secondary
                                   hover:bg-interactive-hover active:bg-interactive-active
                                   transition-colors"
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
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
                {/* 국내/해외 탭 */}
                <div className="flex gap-2 pt-3 mb-3" role="tablist">
                  <button
                    role="tab"
                    aria-selected={searchTab === 'domestic'}
                    onClick={() => setSearchTab('domestic')}
                    className={`px-4 py-2 rounded-full text-body font-medium transition-colors
                      ${searchTab === 'domestic'
                        ? 'bg-interactive-active text-skin-primary shadow-sm'
                        : 'bg-interactive-hover text-skin-muted hover:bg-interactive-active'
                      }`}
                  >
                    국내 {domesticResults.length > 0 && domesticResults.length}
                  </button>
                  <button
                    role="tab"
                    aria-selected={searchTab === 'overseas'}
                    onClick={() => setSearchTab('overseas')}
                    className={`px-4 py-2 rounded-full text-body font-medium transition-colors
                      ${searchTab === 'overseas'
                        ? 'bg-interactive-active text-skin-primary shadow-sm'
                        : 'bg-interactive-hover text-skin-muted hover:bg-interactive-active'
                      }`}
                  >
                    해외 {overseasResults.length > 0 && overseasResults.length}
                  </button>
                </div>

                {/* 탭 결과 */}
                <div className="space-y-1" role="tabpanel">
                  {activeSearchResults.length > 0 ? (
                    activeSearchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.name}-${index}`}
                        onClick={() => handleSelect(result)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                   hover:bg-interactive-hover active:bg-interactive-active
                                   transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-skin-primary font-medium flex items-center gap-2">
                            {result.name}
                            {result.type === 'predefined' && result.nameEn && (
                              <span className="text-body text-skin-muted">
                                {result.nameEn}
                              </span>
                            )}
                            {result.type === 'openmeteo' && result.country && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-caption rounded-full
                                               bg-sky-400/15 border-sky-400/20 text-sky-300
                                               border">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                                  <path strokeWidth="1.5" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                {result.country}
                              </span>
                            )}
                          </p>
                          <p className="text-body text-skin-muted mt-0.5 truncate">
                            {result.description}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-skin-muted flex-shrink-0"
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
                      <p className="text-skin-muted font-medium">
                        &apos;{searchQuery}&apos; 검색 결과가 없습니다
                      </p>
                      <p className="text-skin-muted text-body mt-2">
                        다른 키워드로 검색해보세요
                      </p>
                    </div>
                  ) : !isLoading ? (
                    <div className="text-center py-8">
                      <p className="text-skin-muted text-body">
                        {searchTab === 'domestic' ? '국내' : '해외'} 검색 결과가 없습니다
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
                  <h3 className="text-body font-medium text-skin-muted mb-3">
                    국내 도시 ({domesticCities.length})
                  </h3>
                  <div className="space-y-1">
                    {(showAllDomestic ? domesticCities : domesticCities.slice(0, DOMESTIC_PREVIEW_COUNT)).map((city) => (
                      <button
                        key={city.slug}
                        onClick={() => handleCitySelect(city.slug)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                   hover:bg-interactive-hover active:bg-interactive-active
                                   transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-skin-primary font-medium">
                            {city.name}
                            <span className="ml-2 text-body text-skin-muted">
                              {city.nameEn}
                            </span>
                          </p>
                          <p className="text-body text-skin-muted mt-0.5 truncate">
                            {city.description}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-skin-muted flex-shrink-0"
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
                  {domesticCities.length > DOMESTIC_PREVIEW_COUNT && (
                    <button
                      onClick={() => setShowAllDomestic(!showAllDomestic)}
                      className="w-full mt-2 py-2.5 rounded-xl text-body font-medium
                                 bg-interactive-hover border border-interactive
                                 text-skin-secondary
                                 hover:bg-interactive-active active:bg-interactive-active
                                 transition-colors"
                    >
                      {showAllDomestic
                        ? '접기'
                        : `더 보기 (+${domesticCities.length - DOMESTIC_PREVIEW_COUNT})`}
                    </button>
                  )}
                </m.section>

                {/* 해외 여행지 (지역별 칩 레이아웃) */}
                <m.section
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-body font-medium text-skin-muted mb-3">
                    해외 여행지
                  </h3>
                  <div className="space-y-3">
                    {overseasByRegion.map(([region, cities]) => (
                      <div key={region} className="flex items-start gap-2">
                        <span className="text-label text-skin-muted pt-2 shrink-0 w-12">
                          {region}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {cities.map((city) => (
                            <button
                              key={city.slug}
                              onClick={() => handleCitySelect(city.slug)}
                              className="px-3 py-1.5 rounded-full bg-interactive-hover border border-interactive
                                         text-body text-skin-secondary
                                         hover:bg-interactive-active active:bg-interactive-active
                                         transition-colors"
                            >
                              {city.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </m.section>
              </>
            )}
          </div>

        </m.div>
      )}
    </AnimatePresence>
  );
}
