import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientProviders from "./providers";
import RootJsonLd from "@/components/JsonLd";

const BASE_URL = "https://zuting.fszyl.top";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
    { media: "(prefers-color-scheme: light)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "祖庭之旅 - 全球宗教文化朝圣平台 | Global Ancestral Temple Travel",
    template: "%s | 祖庭之旅 - 全球宗教文化朝圣平台",
  },
  description:
    "帮助100万人走祖庭，建立全球宗教文化和平使者网络。探索12大信仰、60圣地、27祖庭、28祖师、39祖训、30印。Helping 1 million people walk the ancestral temples — explore 12 faiths, 60 holy sites, 27 ancestral temples, 28 patriarchs, 39 teachings, and 30 seals.",
  keywords: [
    "祖庭",
    "朝圣",
    "宗教旅行",
    "圣地",
    "佛教",
    "道教",
    "基督教",
    "伊斯兰教",
    "印度教",
    "犹太教",
    "儒教",
    "锡克教",
    "神道教",
    "藏传佛教",
    "巴哈伊教",
    "祖师",
    "祖训",
    "曹溪愿命三十印",
    "pilgrimage",
    "holy sites",
    "ancestral temple",
    "religious travel",
    "Buddhism",
    "Taoism",
    "Christianity",
    "Islam",
    "Hinduism",
    "interfaith",
    "cultural heritage",
    "spiritual journey",
  ],
  authors: [{ name: "祖庭之旅", url: BASE_URL }],
  creator: "祖庭之旅 - Global Ancestral Temple Travel Platform",
  publisher: "祖庭之旅",
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
    siteName: "祖庭之旅 - Global Ancestral Temple Travel",
    title: "祖庭之旅 - 全球宗教文化朝圣平台",
    description:
      "帮助100万人走祖庭，建立全球宗教文化和平使者网络。探索12大信仰、60圣地、27祖庭。Helping 1 million people walk the ancestral temples.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "祖庭之旅 - 全球宗教文化朝圣平台",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "祖庭之旅 - 全球宗教文化朝圣平台",
    description:
      "帮助100万人走祖庭，建立全球宗教文化和平使者网络。探索12大信仰、60圣地、27祖庭。",
    images: ["/og-image.png"],
    creator: "@zuting_travel",
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased">
        <RootJsonLd />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
