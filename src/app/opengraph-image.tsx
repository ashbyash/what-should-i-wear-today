import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '기온별 옷차림 | 오늘 뭐 입지?';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  // Pretendard 폰트 로드 (OTF만 지원됨)
  const pretendardBold = await fetch(
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/packages/pretendard/dist/public/static/Pretendard-Bold.otf'
  ).then((res) => res.arrayBuffer());

  const pretendardRegular = await fetch(
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/packages/pretendard/dist/public/static/Pretendard-Regular.otf'
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #38bdf8, #3b82f6)',
          fontFamily: 'Pretendard',
        }}
      >
        {/* 이모지 */}
        <div style={{ fontSize: 100, marginBottom: 32, display: 'flex', gap: 16 }}>
          <span>🤔</span>
          <span>👕</span>
        </div>

        {/* 타이틀 - 한 줄 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            fontSize: 52,
            fontWeight: 700,
            color: 'white',
            textShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <span>기온별 옷차림</span>
          <span style={{ opacity: 0.6 }}>|</span>
          <span>오늘 뭐 입지?</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Pretendard',
          data: pretendardBold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Pretendard',
          data: pretendardRegular,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );
}
