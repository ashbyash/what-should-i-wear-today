'use client';

import { getDeviceInfo } from '@/lib/device';

interface PermissionGuideProps {
  error: string;
}

export default function PermissionGuide({ error }: PermissionGuideProps) {
  const { type, isMobile } = getDeviceInfo();

  return (
    <div className="text-center px-6 max-w-sm">
      <div className="text-5xl mb-4">📍</div>
      <p className="text-white font-semibold text-lg mb-4">{error}</p>

      <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 text-left">
        <p className="text-white/90 font-medium text-sm mb-3">
          위치 권한 허용 방법
        </p>

        {isMobile ? (
          type === 'ios' ? (
            <ol className="text-white/80 text-sm space-y-2 list-decimal list-inside">
              <li>iPhone <span className="font-semibold">설정</span> 앱 열기</li>
              <li><span className="font-semibold">Safari</span> → <span className="font-semibold">위치</span></li>
              <li><span className="font-semibold">허용</span> 선택</li>
              <li>이 페이지 새로고침</li>
            </ol>
          ) : (
            <ol className="text-white/80 text-sm space-y-2 list-decimal list-inside">
              <li>주소창 왼쪽 <span className="font-semibold">자물쇠</span> 아이콘 탭</li>
              <li><span className="font-semibold">권한</span> → <span className="font-semibold">위치</span></li>
              <li><span className="font-semibold">허용</span> 선택</li>
              <li>이 페이지 새로고침</li>
            </ol>
          )
        ) : (
          <ol className="text-white/80 text-sm space-y-2 list-decimal list-inside">
            <li>주소창 왼쪽 <span className="font-semibold">자물쇠</span> 아이콘 클릭</li>
            <li><span className="font-semibold">사이트 설정</span> 또는 <span className="font-semibold">권한</span></li>
            <li>위치를 <span className="font-semibold">허용</span>으로 변경</li>
            <li>이 페이지 새로고침</li>
          </ol>
        )}
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-colors"
      >
        새로고침
      </button>
    </div>
  );
}
