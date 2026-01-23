import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-SVJ6ZNVQYV";

export const metadata: Metadata = {
  metadataBase: new URL("https://ootd-by-weather.vercel.app"),
  title: "기온별 옷차림 | 오늘 뭐 입지?",
  description: "날씨로 알아보는 오늘의 OOTD",
  keywords: ["날씨", "옷차림", "기온별 옷", "오늘 뭐 입지", "OOTD", "외출 점수", "미세먼지", "자외선"],
  verification: {
    google: "zBGvDIS1SeYmg6RNhW8w1tRTSDsFU4QTMUZWaxWR1GQ",
    other: {
      "naver-site-verification": ["8fec5651cccdcb938128ba67a06342f6844d92db"],
    },
  },
  openGraph: {
    title: "기온별 옷차림 | 오늘 뭐 입지?",
    description: "날씨로 알아보는 오늘의 OOTD",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "기온별 옷차림 | 오늘 뭐 입지?",
    description: "날씨로 알아보는 오늘의 OOTD",
  },
};

// JSON-LD 구조화 데이터
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://ootd-by-weather.vercel.app/#website",
      "url": "https://ootd-by-weather.vercel.app",
      "name": "기온별 옷차림 | 오늘 뭐 입지?",
      "description": "날씨로 알아보는 오늘의 OOTD",
      "inLanguage": "ko-KR",
    },
    {
      "@type": "WebApplication",
      "@id": "https://ootd-by-weather.vercel.app/#app",
      "name": "오늘 뭐 입지?",
      "description": "현재 위치의 날씨, 미세먼지, 자외선 정보를 기반으로 외출 점수와 옷차림을 추천하는 서비스",
      "url": "https://ootd-by-weather.vercel.app",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "KRW",
      },
      "featureList": [
        "실시간 날씨 정보",
        "미세먼지 농도 확인",
        "자외선 지수 확인",
        "외출 점수 계산",
        "기온별 옷차림 추천",
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "오늘 뭐 입지?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "현재 기온과 날씨에 따라 적절한 옷차림을 추천해드립니다. 28℃ 이상이면 린넨 반팔, 23~27℃는 면 반팔, 17~22℃는 긴팔과 바람막이, 12~16℃는 맨투맨과 니트, 11℃ 이하는 코트와 패딩을 추천합니다.",
          },
        },
        {
          "@type": "Question",
          "name": "외출 점수는 어떻게 계산되나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "외출 점수는 기온(60%), 날씨(20%), 미세먼지(15%), 자외선(5%)을 종합하여 100점 만점으로 계산됩니다. 80점 이상이면 외출하기 좋은 날씨입니다.",
          },
        },
        {
          "@type": "Question",
          "name": "미세먼지가 나쁠 때 어떻게 해야 하나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PM2.5 기준 36㎍/㎥ 이상이면 '나쁨' 단계입니다. 야외 활동을 자제하고, 외출 시 마스크 착용을 권장합니다.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
