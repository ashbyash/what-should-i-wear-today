'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import { CITIES } from '@/lib/cities';

// 빠른 선택용 도시 (여행지/거주지 구분 아님)
const FEATURED_SLUGS = [
  'jeju',
  'gangneung',
  'sokcho',
  'gyeongju',
  'yeosu',
  'busan',
];

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CitySearchModal({
  isOpen,
  onClose,
}: CitySearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 필터링
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return CITIES;

    const query = searchQuery.toLowerCase().trim();
    return CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(query) ||
        city.nameEn.toLowerCase().includes(query) ||
        city.slug.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 빠른 선택용 도시 데이터
  const featuredCities = useMemo(() => {
    return FEATURED_SLUGS.map((slug) =>
      CITIES.find((city) => city.slug === slug)
    ).filter(Boolean);
  }, []);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 to-slate-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* 헤더 */}
          <m.header
            className="flex items-center justify-between px-4 py-4 border-b border-white/10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-glass-primary">
              도시 선택
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-6 h-6 text-glass-secondary"
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
            className="px-4 py-3"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-glass-muted"
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
                placeholder="도시 검색..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20
                           text-glass-primary placeholder:text-glass-muted
                           focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent
                           transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
                  aria-label="검색어 지우기"
                >
                  <svg
                    className="w-4 h-4 text-glass-muted"
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
          </m.div>

          {/* 컨텐츠 영역 */}
          <div className="flex-1 overflow-y-auto px-4 pb-24">
            {/* 빠른 선택 (검색어 없을 때만) */}
            {!searchQuery && (
              <m.section
                className="mb-6"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-sm font-medium text-glass-muted mb-3">
                  빠른 선택
                </h3>
                <div className="flex flex-wrap gap-2">
                  {featuredCities.map((city) => (
                    <button
                      key={city!.slug}
                      onClick={() => handleCitySelect(city!.slug)}
                      className="px-4 py-2 rounded-full bg-white/15 border border-white/20
                                 text-sm text-glass-secondary
                                 hover:bg-white/25 active:bg-white/30
                                 transition-colors"
                    >
                      {city!.name}
                    </button>
                  ))}
                </div>
              </m.section>
            )}

            {/* 도시 리스트 */}
            <m.section
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className="text-sm font-medium text-glass-muted mb-3">
                {searchQuery ? `검색 결과 (${filteredCities.length})` : '전체 도시'}
              </h3>
              <div className="space-y-1">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <button
                      key={city.slug}
                      onClick={() => handleCitySelect(city.slug)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                 hover:bg-white/10 active:bg-white/15
                                 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <p className="text-glass-primary font-medium">
                          {city.name}
                          <span className="ml-2 text-sm text-glass-muted">
                            {city.nameEn}
                          </span>
                        </p>
                        <p className="text-sm text-glass-muted mt-0.5">
                          {city.description}
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-glass-muted"
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
                ) : (
                  <p className="text-center text-glass-muted py-8">
                    검색 결과가 없습니다
                  </p>
                )}
              </div>
            </m.section>
          </div>

          {/* 하단 고정 버튼 */}
          <m.div
            className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleGoToCurrentLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                         bg-white/15 border border-white/20
                         text-glass-primary font-medium
                         hover:bg-white/25 active:bg-white/30
                         transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              현재 위치로 돌아가기
            </button>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
