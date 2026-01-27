'use client';

interface LocationHeaderProps {
  locationName: string;
  isLoading?: boolean;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  /** 캐시된 위치 사용 중인지 여부 */
  isFromCache?: boolean;
  /** 캐시 사용 이유 (GPS 실패 메시지) */
  cacheReason?: string | null;
  /** 도시 검색 모달 열기 */
  onSearchClick?: () => void;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return '방금 업데이트';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return '오래 전';
}

export default function LocationHeader({
  locationName,
  isLoading,
  lastUpdated,
  onRefresh,
  isRefreshing,
  isFromCache,
  cacheReason,
  onSearchClick,
}: LocationHeaderProps) {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleLocationReset = () => {
    // 캐시 삭제 후 새로고침
    try {
      localStorage.removeItem('last_location');
    } catch {
      // localStorage 사용 불가
    }
    window.location.reload();
  };

  return (
    <header
      className="flex flex-col items-center py-4"
      role="banner"
      aria-label={isLoading ? '위치 확인 중' : `현재 위치: ${locationName}`}
    >
      {/* 캐시 사용 알림 배너 */}
      {isFromCache && cacheReason && !isLoading && (
        <div className="flex items-center gap-2 mb-3 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
          <svg
            className="w-4 h-4 text-amber-300 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-xs text-amber-200">
            이전 위치 표시 중 ({cacheReason})
          </span>
          <button
            onClick={handleLocationReset}
            className="ml-1 px-2 py-0.5 text-xs text-amber-100 bg-amber-500/30
                       hover:bg-amber-500/50 rounded transition-colors"
          >
            위치 재설정
          </button>
        </div>
      )}

      {/* 위치 - 메인 */}
      {isLoading ? (
        <span className="loading loading-dots loading-sm text-glass-primary" aria-hidden="true"></span>
      ) : onSearchClick ? (
        <button
          onClick={onSearchClick}
          className="flex items-center gap-1.5 text-xl font-semibold text-glass-primary
                     hover:bg-white/5 active:bg-white/10 px-3 py-1.5 -mx-3 rounded-xl
                     transition-colors"
          aria-label="다른 도시 검색"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          {locationName}
          {/* 변경 가능 힌트 */}
          <svg
            className="w-4 h-4 text-glass-muted ml-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      ) : (
        <h1 className="flex items-center gap-1.5 text-xl font-semibold text-glass-primary">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          {locationName}
        </h1>
      )}

      {/* 업데이트 시간 + 새로고침 */}
      {lastUpdated && !isLoading && (
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full
                     hover:bg-glass-muted/10 active:bg-glass-muted/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors touch-manipulation"
          aria-label={isRefreshing ? '새로고침 중' : '새로고침'}
        >
          <span className="text-xs text-glass-muted">
            {isRefreshing ? '업데이트 중...' : getRelativeTime(lastUpdated)}
          </span>
          <svg
            className={`w-3 h-3 text-glass-muted ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      )}
    </header>
  );
}
