import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import CityWeatherPage from '@/components/CityWeatherPage';
import { getCityBySlug, getAllCitySlugs } from '@/lib/cities';

interface PageProps {
  params: Promise<{ city: string }>;
}

// 빌드 시 정적 페이지 생성
export function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({ city }));
}

// 도시별 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    return {
      title: '페이지를 찾을 수 없습니다',
    };
  }

  const title = `${city.name} 날씨 옷차림 | 오늘 뭐 입지?`;
  const description = `${city.name} 오늘 날씨와 기온별 옷차림 추천. ${city.description}의 실시간 날씨, 미세먼지, 자외선 정보를 확인하고 외출 점수와 옷차림을 추천받으세요.`;

  return {
    title,
    description,
    keywords: [
      `${city.name} 날씨`,
      `${city.name} 날씨 옷차림`,
      `${city.name} 기온별 옷차림`,
      `${city.name} 오늘 뭐 입지`,
      `${city.name} 옷차림`,
      `${city.name} 기온`,
      `${city.name} 미세먼지`,
      `${city.name} 여행 날씨`,
      `${city.name} 여행 옷차림`,
      `${city.name} 뭐 입고 가지`,
      '기온별 옷차림',
      '오늘 뭐 입지',
      'OOTD',
    ],
    alternates: {
      canonical: `/${city.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ko_KR',
      url: `https://ootd-by-weather.vercel.app/${city.slug}`,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  };
}

// JSON-LD 구조화 데이터 생성 (정적 데이터만 사용 - XSS 위험 없음)
function generateJsonLd(city: NonNullable<ReturnType<typeof getCityBySlug>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${city.name} 날씨 옷차림 | 오늘 뭐 입지?`,
    description: `${city.name} 오늘 날씨와 기온별 옷차림 추천`,
    url: `https://ootd-by-weather.vercel.app/${city.slug}`,
    mainEntity: {
      '@type': 'Place',
      name: city.name,
      description: city.description,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: city.lat,
        longitude: city.lon,
      },
    },
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://ootd-by-weather.vercel.app/#website',
      name: '오늘 뭐 입지?',
    },
  };
}

export default async function CityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    notFound();
  }

  const jsonLd = generateJsonLd(city);

  return (
    <>
      <Script
        id={`json-ld-${city.slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>
      <CityWeatherPage city={city} />
    </>
  );
}
