'use client';

import { m } from 'framer-motion';

// 기본 스켈레톤 컴포넌트
function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <m.div
      className={`bg-white/20 rounded-lg ${className}`}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// 원형 스켈레톤
function SkeletonCircle({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    <m.div
      className={`bg-white/20 rounded-full ${sizeClasses[size]}`}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// 카드 형태 스켈레톤
function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg ${className}`}>
      <div className="card-body p-4 items-center">
        <SkeletonCircle size="lg" />
        <SkeletonBox className="h-4 w-16 mt-2" />
        <SkeletonBox className="h-10 w-20 mt-2" />
        <SkeletonBox className="h-4 w-24 mt-2" />
      </div>
    </div>
  );
}

// 위치 헤더 스켈레톤
function SkeletonLocationHeader() {
  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
      <SkeletonCircle size="sm" />
      <SkeletonBox className="h-4 w-32" />
    </div>
  );
}

// 점수 게이지 스켈레톤
function SkeletonScoreGauge() {
  return (
    <div className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full">
      <div className="card-body p-4 flex flex-col items-center justify-center">
        <SkeletonBox className="h-5 w-32 mb-3" />
        <m.div
          className="w-40 h-40 rounded-full bg-white/10 border-8 border-white/20"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <SkeletonBox className="h-4 w-40 mt-4" />
      </div>
    </div>
  );
}

// 옷차림 카드 스켈레톤
function SkeletonOutfitCard() {
  return (
    <div className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full">
      <div className="card-body p-4">
        <SkeletonBox className="h-5 w-28 mx-auto mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonBox className="h-5 w-5 rounded" />
              <SkeletonBox className="h-4 w-12" />
              <SkeletonBox className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 전체 페이지 스켈레톤
export function PageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* 위치 헤더 */}
        <div className="col-span-2 md:col-span-3">
          <SkeletonLocationHeader />
        </div>

        {/* 외출 점수 */}
        <div className="col-span-2 md:col-span-1">
          <SkeletonScoreGauge />
        </div>

        {/* 옷차림 추천 */}
        <div className="col-span-2 md:col-span-2">
          <SkeletonOutfitCard />
        </div>

        {/* 날씨 */}
        <div className="col-span-2 md:col-span-1">
          <SkeletonCard className="h-full" />
        </div>

        {/* 미세먼지 */}
        <div className="col-span-1">
          <SkeletonCard className="h-full" />
        </div>

        {/* 자외선 */}
        <div className="col-span-1">
          <SkeletonCard className="h-full" />
        </div>
      </div>
    </div>
  );
}

export { SkeletonBox, SkeletonCircle, SkeletonCard };
