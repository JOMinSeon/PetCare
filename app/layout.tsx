import type { Metadata } from "next";
import { Noto_Sans_KR, DM_Sans, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://petcare.pe.kr'),
  title: {
    default: "펫헬스 — 반려동물 건강 관리",
    template: "%s | 펫헬스",
  },
  description: "AI 기반 반려동물 건강 관리 서비스. 체중 관리, 건강 기록, AI 수의사 상담, 사료 성분 분석까지 한 곳에서.",
  keywords: ["반려동물 건강관리", "AI 수의사", "강아지 건강", "고양이 건강", "사료 분석", "반려동물 관리", "펫헬스"],
  authors: [{ name: "코어넥스트" }],
  creator: "코어넥스트",
  publisher: "코어넥스트",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://petcare.pe.kr",
    siteName: "펫헬스",
    title: "펫헬스 — 반려동물 건강 관리",
    description: "AI 기반 반려동물 건강 관리 서비스",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "펫헬스 - 반려동물 건강 관리",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "펫헬스 — 반려동물 건강 관리",
    description: "AI 기반 반려동물 건강 관리 서비스",
    images: ["/og-image.png"],
    creator: "@pethealth",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>


      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9434023098844146"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${notoSansKR.variable} ${dmSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
