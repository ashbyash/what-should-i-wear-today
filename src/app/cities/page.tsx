import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { getDomesticCitiesByRegion, getOverseasCitiesByRegion, getDomesticCities, getOverseasCities } from '@/lib/cities';
import CitiesTabs from '@/components/CitiesTabs';

const SITE_URL = 'https://ootd-by-weather.vercel.app';

export const metadata: Metadata = {
  title: '전체 도시 날씨 옷차림 | 오늘 뭐 입지?',
  description: '국내 43개, 해외 14개 도시의 날씨별 옷차림 추천. 서울, 부산, 제주, 오사카, 도쿄, 방콕 등 주요 도시의 실시간 날씨와 외출 점수를 확인하세요.',
  keywords: [
    '도시별 날씨', '전국 날씨 옷차림', '기온별 옷차림',
    '해외 여행 날씨', '오늘 뭐 입지', 'OOTD',
  ],
  alternates: {
    canonical: '/cities',
  },
  openGraph: {
    title: '전체 도시 날씨 옷차림 | 오늘 뭐 입지?',
    description: '국내 43개, 해외 14개 도시의 날씨별 옷차림 추천',
    type: 'website',
    locale: 'ko_KR',
    url: `${SITE_URL}/cities`,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: '전체 도시 날씨 옷차림' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '전체 도시 날씨 옷차림 | 오늘 뭐 입지?',
    description: '국내 43개, 해외 14개 도시의 날씨별 옷차림 추천',
    images: ['/opengraph-image'],
  },
};

function generateJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '전체 도시 날씨 옷차림 | 오늘 뭐 입지?',
    description: '국내 43개, 해외 14개 도시의 날씨별 옷차림 추천',
    url: `${SITE_URL}/cities`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: '오늘 뭐 입지?',
    },
  };
}

export default function CitiesPage() {
  const domesticRegions = getDomesticCitiesByRegion();
  const overseasRegions = getOverseasCitiesByRegion();
  const domesticCount = getDomesticCities().length;
  const overseasCount = getOverseasCities().length;

  // JSON-LD: 정적 데이터만 사용 (XSS 위험 없음)
  const jsonLdHtml = JSON.stringify(generateJsonLd());

  return (
    <div
      className="min-h-screen"
      data-theme="dark"
      style={{ background: 'linear-gradient(to bottom, #56ccf2, #2f80ed)' }}
    >
      <Script
        id="cities-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml }}
      />

      <div className="max-w-3xl mx-auto px-4 pb-8">
        {/* 뒤로가기 */}
        <div className="pt-6 pb-4">
          <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
            ← 홈으로
          </Link>
        </div>

        {/* 페이지 타이틀 */}
        <div className="mb-6">
          <h1 className="text-heading-1 text-white font-semibold">전체 도시 날씨</h1>
          <p className="text-sm text-white/70 mt-1">국내 {domesticCount}개 · 해외 {overseasCount}개</p>
        </div>

        <CitiesTabs
          domesticRegions={domesticRegions}
          overseasRegions={overseasRegions}
          domesticCount={domesticCount}
          overseasCount={overseasCount}
        />
      </div>
    </div>
  );
}
