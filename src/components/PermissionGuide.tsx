'use client';

import { getDeviceInfo } from '@/lib/device';

interface PermissionGuideProps {
  error: string;
  onSearchClick?: () => void;
}

export default function PermissionGuide({ error, onSearchClick }: PermissionGuideProps) {
  const { type, isMobile } = getDeviceInfo();

  return (
    <div className="text-center px-6 max-w-sm">
      <div className="text-5xl mb-4">📍</div>
      <p className="text-skin-primary text-title mb-4">{error}</p>

      <div
        className="p-4 text-left"
        style={{
          background: 'var(--glass-bg-outer)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          borderRadius: 'var(--glass-radius-outer)',
        }}
      >
        <p className="text-skin-secondary font-medium text-body mb-3">
          위치 권한 허용 방법
        </p>

        {isMobile ? (
          type === 'ios' ? (
            <ol className="text-skin-secondary text-body space-y-2 list-decimal list-inside">
              <li>iPhone <span className="font-semibold">설정</span> 앱 열기</li>
              <li><span className="font-semibold">Safari</span> → <span className="font-semibold">위치</span></li>
              <li><span className="font-semibold">허용</span> 선택</li>
              <li>이 페이지 새로고침</li>
            </ol>
          ) : (
            <ol className="text-skin-secondary text-body space-y-2 list-decimal list-inside">
              <li>주소창 왼쪽 <span className="font-semibold">자물쇠</span> 아이콘 탭</li>
              <li><span className="font-semibold">권한</span> → <span className="font-semibold">위치</span></li>
              <li><span className="font-semibold">허용</span> 선택</li>
              <li>이 페이지 새로고침</li>
            </ol>
          )
        ) : (
          <ol className="text-skin-secondary text-body space-y-2 list-decimal list-inside">
            <li>주소창 왼쪽 <span className="font-semibold">자물쇠</span> 아이콘 클릭</li>
            <li><span className="font-semibold">사이트 설정</span> 또는 <span className="font-semibold">권한</span></li>
            <li>위치를 <span className="font-semibold">허용</span>으로 변경</li>
            <li>이 페이지 새로고침</li>
          </ol>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="w-full px-6 py-2.5 bg-white/20 hover:bg-white/30 text-skin-primary rounded-full text-body font-medium transition-colors"
        >
          새로고침
        </button>

        {onSearchClick && (
          <button
            onClick={onSearchClick}
            className="w-full px-6 py-2.5 bg-white/20 hover:bg-white/30 text-skin-primary rounded-full text-body font-medium transition-colors"
          >
            도시 직접 검색
          </button>
        )}
      </div>
    </div>
  );
}
