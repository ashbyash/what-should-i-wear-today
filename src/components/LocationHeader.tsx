'use client';

interface LocationHeaderProps {
  locationName: string;
  isLoading?: boolean;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
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
}: LocationHeaderProps) {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <header
      className="flex flex-col items-center py-4"
      role="banner"
      aria-label={isLoading ? '위치 확인 중' : `현재 위치: ${locationName}`}
    >
      {/* 위치 - 메인 */}
      {isLoading ? (
        <span className="loading loading-dots loading-sm text-glass-primary" aria-hidden="true"></span>
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
