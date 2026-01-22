import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-SVJ6ZNVQYV";

export const metadata: Metadata = {
  title: "기온별 옷차림 | 오늘 뭐 입지?",
  description: "날씨 기반 외출 점수 & 옷차림 추천",
  openGraph: {
    title: "기온별 옷차림 | 오늘 뭐 입지?",
    description: "날씨 기반 외출 점수 & 옷차림 추천",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "기온별 옷차림 | 오늘 뭐 입지?",
    description: "날씨 기반 외출 점수 & 옷차림 추천",
  },
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
