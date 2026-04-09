import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientProviders from "./providers";
import RootJsonLd from "@/components/JsonLd";
import CookieConsent from "@/components/CookieConsent";
import SiteGate from "@/components/SiteGate";

const BASE_URL = "https://joinus.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Joinus - 加入我们，探索世界 | 全球文化旅行平台",
    template: "%s | Joinus - 全球文化旅行平台",
  },
  description:
    "加入我们，探索世界。Joinus是全球领先的文化旅行平台，精选12大文化传统、60+圣地目的地、专业路线规划、AI旅行顾问。Join us, explore the world — the leading cultural travel platform with curated routes, 60+ destinations, and AI trip planning.",
  keywords: [
    "文化旅行",
    "深度旅游",
    "圣地",
    "文明探索",
    "佛教旅行",
    "丝绸之路",
    "文化遗产",
    "祖庭",
    "文化智慧",
    "佳绩之旅",
    "旅行规划",
    "AI旅行",
    "cultural travel",
    "heritage tourism",
    "holy sites",
    "pilgrimage",
    "spiritual journey",
    "Buddhism travel",
    "Silk Road",
    "cultural heritage",
    "trip planner",
    "AI travel",
    "Joinus",
  ],
  authors: [{ name: "Joinus", url: BASE_URL }],
  creator: "Joinus - Global Cultural Travel Platform",
  publisher: "Joinus",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: "en_US",
    url: BASE_URL,
    siteName: "Joinus - 全球文化旅行平台",
    title: "Joinus - 加入我们，探索世界",
    description:
      "加入我们，探索世界。全球领先的文化旅行平台，精选路线、60+圣地目的地、AI旅行顾问。Join us, explore the world.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Joinus - 加入我们，探索世界",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Joinus - 加入我们，探索世界",
    description:
      "加入我们，探索世界。全球领先的文化旅行平台，精选路线、60+目的地、AI旅行顾问。",
    images: ["/og-image.png"],
    creator: "@joinus_travel",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: BASE_URL,
    languages: {
      "zh-CN": BASE_URL,
      "en": `${BASE_URL}/en`,
    },
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
  category: "travel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0066FF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-sans antialiased">
        <RootJsonLd />
        <ClientProviders>
          <SiteGate>{children}</SiteGate>
        </ClientProviders>
        <CookieConsent />
        <script dangerouslySetInnerHTML={{ __html: `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.getRegistrations().then(function(regs) {
        regs.forEach(function(r) { r.update(); });
      });
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }
  // Chunk加载失败自动刷新(部署更新后旧chunk不存在)
  window.addEventListener('error', function(e) {
    if (e.message && e.message.indexOf('Loading chunk') !== -1) {
      if (!sessionStorage.getItem('chunk_retry')) {
        sessionStorage.setItem('chunk_retry', '1');
        window.location.reload();
      }
    }
  });
`}} />
      </body>
    </html>
  );
}
