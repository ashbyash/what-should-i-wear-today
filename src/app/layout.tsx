import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-SVJ6ZNVQYV";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

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
          "name": "오늘 날씨에 뭐 입으면 좋을까요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "현재 기온에 따라 옷차림을 추천해드립니다. 28℃ 이상은 린넨 반팔과 반바지, 23~27℃는 면 반팔에 얇은 가디건, 17~22℃는 긴팔에 바람막이, 12~16℃는 맨투맨과 니트, 11℃ 이하는 코트나 패딩을 추천합니다.",
          },
        },
        {
          "@type": "Question",
          "name": "외출 점수는 어떻게 계산되나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "외출 점수는 기온(60%), 날씨(20%), 미세먼지(15%), 자외선(5%)을 종합하여 100점 만점으로 계산됩니다. 80점 이상이면 외출하기 좋은 날, 60~79점은 괜찮은 날, 40~59점은 보통, 40점 미만은 외출을 자제하는 게 좋습니다.",
          },
        },
        {
          "@type": "Question",
          "name": "미세먼지가 나쁠 때 어떻게 해야 하나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PM2.5 기준 0~15㎍/㎥는 좋음, 16~35는 보통, 36~75는 나쁨, 76 이상은 매우 나쁨입니다. 36㎍/㎥ 이상이면 야외 활동을 줄이고 외출 시 마스크 착용을 권장합니다.",
          },
        },
        {
          "@type": "Question",
          "name": "기온별 옷차림 기준이 어떻게 되나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "기온별 옷차림 기준은 다음과 같습니다. 28℃ 이상: 린넨 반팔, 반바지, 샌들. 23~27℃: 면 반팔, 얇은 면바지. 17~22℃: 긴팔 티셔츠, 청바지, 바람막이. 12~16℃: 맨투맨, 니트, 면 자켓. 6~11℃: 기모 맨투맨, 울 코트. 5℃ 이하: 롱패딩, 목도리, 장갑.",
          },
        },
        {
          "@type": "Question",
          "name": "자외선 지수가 높을 때 어떻게 해야 하나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "자외선 지수 0~2는 낮음, 3~5는 보통, 6~7은 높음, 8~10은 매우 높음, 11 이상은 위험 단계입니다. 지수 6 이상이면 자외선 차단제를 바르고, 모자나 긴 소매 옷으로 피부를 보호하세요.",
          },
        },
        {
          "@type": "Question",
          "name": "일교차가 클 때 뭐 입어야 하나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "하루 최고·최저 기온 차이가 10℃ 이상이면 일교차가 큰 날입니다. 아침저녁에는 쌀쌀하고 낮에는 따뜻하므로 얇은 겉옷(가디건, 바람막이)을 꼭 챙기세요. 레이어드 코디를 추천합니다.",
          },
        },
        {
          "@type": "Question",
          "name": "비 오는 날 뭐 입으면 좋을까요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "비 오는 날에는 방수 자켓과 레인부츠를 추천합니다. 우산과 함께 물에 젖어도 빨리 마르는 나일론 소재 옷을 입으면 좋습니다. 밝은 색상의 옷은 비에 젖으면 비쳐 보일 수 있으니 피하세요.",
          },
        },
        {
          "@type": "Question",
          "name": "한파가 올 때 어떻게 입어야 하나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "기온이 영하 10℃ 이하로 떨어지는 한파에는 보온이 핵심입니다. 내복이나 히트텍을 기본으로 입고, 기모 안감 옷과 두꺼운 롱패딩을 겹쳐 입으세요. 목도리, 장갑, 비니로 머리와 손발 끝을 감싸고, 방한 부츠를 신는 것이 좋습니다.",
          },
        },
        {
          "@type": "Question",
          "name": "폭염이나 혹서기에는 어떻게 해야 하나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "기온이 33℃ 이상인 폭염에는 통풍이 잘 되는 린넨이나 얇은 면 소재 옷을 입으세요. 밝은 색상이 열을 덜 흡수합니다. 오전 11시~오후 4시 야외 활동은 피하고, 양산이나 모자로 직사광선을 차단하세요. 수분 섭취를 충분히 하는 것도 중요합니다.",
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
