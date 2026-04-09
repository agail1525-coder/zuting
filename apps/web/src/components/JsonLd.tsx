import Script from "next/script";

const BASE_URL = "https://zuting.fszyl.top";

/** Organization + TravelAgency structured data */
export function OrganizationJsonLd() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "佳绩之旅 - Global Ancestral Temple Travel",
    alternateName: "全球文化旅行平台",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "探索人类文明，创造人生佳绩。建立全球文化和平使者网络。Explore human civilization, achieve life milestones. Building a global network of cultural peace ambassadors.",
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contact@zuting.com",
      availableLanguage: ["Chinese", "English"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "深圳",
      addressRegion: "广东",
      addressCountry: "CN",
    },
    sameAs: [],
    areaServed: {
      "@type": "Place",
      name: "Global",
    },
    knowsAbout: [
      "Buddhism",
      "Taoism",
      "Christianity",
      "Islam",
      "Hinduism",
      "Judaism",
      "Confucianism",
      "Sikhism",
      "Shinto",
      "Tibetan Buddhism",
      "Indigenous Spirituality",
      "Bahai Faith",
    ],
  };

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  );
}

/** Website search action structured data */
export function WebSiteJsonLd() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "佳绩之旅",
    alternateName: "Global Cultural Travel Platform",
    url: BASE_URL,
    inLanguage: ["zh-CN", "en"],
    description:
      "全球文化之旅旅行平台，涵盖12大文化传统、60圣地、27祖庭、28祖师、39祖训、30印。",
    publisher: {
      "@type": "Organization",
      name: "佳绩之旅",
      url: BASE_URL,
    },
  };

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
    />
  );
}

/** Breadcrumb structured data */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
    />
  );
}

/** Combined JSON-LD for the root layout */
export default function RootJsonLd() {
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: "首页", url: "/" },
          { name: "十二大文化传统", url: "/religions" },
          { name: "圣地", url: "/holy-sites" },
          { name: "祖庭", url: "/temples" },
          { name: "祖师", url: "/patriarchs" },
          { name: "祖训", url: "/teachings" },
          { name: "三十印", url: "/seals" },
          { name: "地图", url: "/map" },
        ]}
      />
    </>
  );
}
