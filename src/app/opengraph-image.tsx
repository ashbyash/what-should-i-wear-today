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
        {/* SVG 아이콘 */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 40 }}>
          {/* Sun 아이콘 */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
          {/* Shirt 아이콘 */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
          </svg>
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
