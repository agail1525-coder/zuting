"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import PhotoMosaic from "@/components/PhotoMosaic";
import SocialProof from "@/components/SocialProof";
import PriceForecast from "@/components/PriceForecast";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import RouteMap from "@/components/RouteMap";
import ReviewSection from "@/components/ReviewSection";
import QASection from "@/components/QASection";
import MediaTour from "@/components/MediaTour";
import type { Route, ItineraryDay, Patriarch, Teaching } from "@/lib/api";
import { fetchRoutes, fetchPatriarchs, fetchTeachings } from "@/lib/api";

/* ─── static maps ─── */

const CATEGORY_LABELS: Record<string, string> = {
  ZEN: "禅宗路线",
  BUDDHIST: "佛教圣地",
  TAOIST: "道教寻根",
  CHRISTIAN: "基督文化",
  ISLAMIC: "伊斯兰文化",
  CROSS_CULTURAL: "跨文化融合",
  HINDU: "印度教",
  JEWISH: "犹太教",
  CULTURAL_HERITAGE: "文化遗产",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "bg-green-50 text-green-600 border-green-200",
  MODERATE: "bg-amber-50 text-amber-600 border-amber-200",
  CHALLENGING: "bg-red-50 text-red-600 border-red-200",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "轻松",
  MODERATE: "适中",
  CHALLENGING: "挑战",
};

const CANCELLATION_POLICIES = [
  { text: "出发前14天：全额退款" },
  { text: "出发前7-13天：退款80%" },
  { text: "出发前3-6天：退款50%" },
  { text: "出发前3天内：不可退款" },
];

const RELIGION_ICONS: Record<string, string> = {
  佛教: "☸️", 道教: "☯️", 基督教: "✝️", 伊斯兰教: "☪️",
  印度教: "🕉️", 犹太教: "✡️", 儒教: "📜", 锡克教: "🪯",
  神道教: "⛩️", 藏传佛教: "🏔️", 巴哈伊教: "✨",
};

/* ─── Expandable Description ─── */
function ExpandableText({ text, maxLength = 200 }: { text: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > maxLength;
  return (
    <div>
      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
        {expanded || !needsTruncation ? text : text.slice(0, maxLength) + "..."}
      </p>
      {needsTruncation && (
        <button onClick={() => setExpanded(!expanded)} className="mt-3 text-[#0066FF] hover:text-[#0052CC] text-sm font-medium transition-colors">
          {expanded ? "收起 ▲" : "展开全部 ▼"}
        </button>
      )}
    </div>
  );
}

const FAQ_ITEMS = [
  { q: "如何预订这条路线？", a: "选择出发日期和人数后点击「立即预订」，完成支付后即可收到确认邮件和电子票。" },
  { q: "可以定制行程吗？", a: "可以！点击「AI规划师咨询」，小鸿AI会根据您的需求定制专属行程，或联系客服进行人工定制。" },
  { q: "需要准备什么？", a: "请查看上方「出行贴士」板块了解天气、穿着和礼仪建议。我们会在出发前3天发送详细行前须知。" },
  { q: "团队规模是多少？", a: "每团通常6-15人，确保深度体验。也支持私人包团，价格另议。" },
  { q: "包含餐饮和住宿吗？", a: "请查看上方「费用包含」板块了解具体包含项目。一般包含全程住宿和部分餐饮。" },
  { q: "取消预订如何退款？", a: "出发前14天全额退款，7-13天退80%，3-6天退50%。详见「取消与退款政策」板块。" },
];

/* ─── FAQAccordion sub-component ─── */

function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-5">常见问题</h2>
      <div className="divide-y divide-gray-100">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between py-4 text-left group"
            >
              <span className="font-medium text-gray-800 group-hover:text-[#0066FF] transition-colors pr-4">
                {item.q}
              </span>
              <span
                className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                  openIdx === i ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            {openIdx === i && (
              <p className="pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── RelatedCulture sub-component ─── */

function RelatedCulture({ religionId }: { religionId: string | null }) {
  const [patriarchs, setPatriarchs] = useState<Patriarch[]>([]);
  const [teachings, setTeachings] = useState<Teaching[]>([]);

  useEffect(() => {
    if (!religionId) return;
    fetchPatriarchs(religionId)
      .then((items) => setPatriarchs(items.slice(0, 3)))
      .catch(() => {});
    fetchTeachings(religionId)
      .then((items) => setTeachings(items.slice(0, 3)))
      .catch(() => {});
  }, [religionId]);

  if (!religionId || (patriarchs.length === 0 && teachings.length === 0)) return null;

  return (
    <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-5">相关文化</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {patriarchs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">相关祖师</h3>
            <div className="space-y-3">
              {patriarchs.map((p) => (
                <Link
                  key={p.id}
                  href={`/patriarchs/${p.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 text-lg border border-amber-200">
                    🧘
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.nameEn}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {teachings.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">相关祖训</h3>
            <div className="space-y-3">
              {teachings.map((t) => (
                <Link
                  key={t.id}
                  href={`/teachings/${t.id}`}
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <p className="text-sm text-gray-800 font-medium line-clamp-2">{t.originalText}</p>
                  {t.sourceText && (
                    <p className="text-xs text-gray-400 mt-1">— {t.sourceText}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── XiaohongFloat sub-component ─── */

function XiaohongFloat({ routeTitle }: { routeTitle: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-[#0066FF] text-white rounded-full shadow-xl shadow-blue-500/30 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        title="问问小鸿"
      >
        🤖
      </button>

      {/* Quick panel */}
      {open && (
        <div className="fixed bottom-40 right-6 z-50 w-80 bg-white rounded-lg shadow-xl border border-[#dadfe6] overflow-hidden">
          <div className="bg-[#0066FF] text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm">小鸿AI · 路线顾问</span>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">✕</button>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-sm text-gray-600">关于「{routeTitle}」，你想了解什么？</p>
            <div className="space-y-1.5">
              {[
                "这条路线适合老人吗？",
                "有什么必带物品？",
                "住宿条件怎么样？",
                "能否定制延长行程？",
              ].map((q) => (
                <Link
                  key={q}
                  href={`/chat?q=${encodeURIComponent(`关于路线"${routeTitle}"：${q}`)}`}
                  className="block px-3 py-2 text-sm text-[#0066FF] bg-[#0066FF]/5 rounded-lg hover:bg-[#0066FF]/10 transition-colors border border-[#0066FF]/10"
                >
                  {q}
                </Link>
              ))}
            </div>
            <Link
              href={`/chat?q=${encodeURIComponent(`我想了解路线"${routeTitle}"的详细信息`)}`}
              className="block text-center text-sm text-[#0066FF] font-medium mt-2 hover:underline"
            >
              打开完整聊天 →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── SimilarRoutes sub-component ─── */

function SimilarRoutes({ currentRouteId, category }: { currentRouteId: string; category: string }) {
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    fetchRoutes({ category, pageSize: 5, sort: "rating" })
      .then((res) => {
        setRoutes(res.items.filter((r) => r.id !== currentRouteId).slice(0, 4));
      })
      .catch(() => {});
  }, [currentRouteId, category]);

  if (routes.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">你可能也喜欢</h2>
        <Link href="/routes" className="text-sm text-[#0066FF] hover:underline">
          查看全部 →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {routes.map((r) => {
          const p = (r.priceFrom / 100).toLocaleString();
          return (
            <Link key={r.id} href={`/routes/${r.slug}`} className="group block">
              <div className="border border-[#dadfe6] rounded-lg overflow-hidden bg-white hover:shadow-md transition-all duration-300">
                <div className="relative h-40 overflow-hidden">
                  {r.coverImage ? (
                    <OptimizedImage
                      src={r.coverImage}
                      alt={r.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-5xl opacity-30">🌏</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black/30 text-white backdrop-blur-sm">
                      {r.duration}天{r.nights}晚
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#0066FF] transition-colors line-clamp-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{r.subtitle}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-sm font-bold text-[#0066FF]">¥{p}<span className="text-xs font-normal text-gray-400">/人</span></span>
                    {r.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-500">
                        <span className="text-amber-400">★</span> {r.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── BookingWidget sub-component ─── */

function BookingWidget({ route }: { route: Route }) {
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const unitPrice = route.priceFrom / 100;
  const total = unitPrice * guests;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const minDateStr = minDate.toISOString().split("T")[0];

  const formatQuickDate = (d: Date) => d.toISOString().split("T")[0];
  const formatLabel = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;

  const quickDates = [
    { label: "今天", value: formatQuickDate(today), sub: formatLabel(today) },
    { label: "明天", value: formatQuickDate(tomorrow), sub: formatLabel(tomorrow) },
    { label: "后天", value: formatQuickDate(dayAfter), sub: formatLabel(dayAfter) },
  ];

  return (
    <div className="bg-white border border-[#dadfe6] rounded-lg p-4 md:min-w-[300px]">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">起价</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          ¥{unitPrice.toLocaleString()}
          <span className="text-base font-normal text-gray-500">/人</span>
        </p>
      </div>

      {/* Quick Date Tabs (Trip.com style) */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">出发日期</label>
          <div className="flex gap-2 mb-2">
            {quickDates.map((qd) => (
              <button
                key={qd.value}
                onClick={() => { setDate(qd.value); setShowDatePicker(false); }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  date === qd.value
                    ? "bg-[#0066FF] text-white border-[#0066FF]"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#0066FF]/30"
                }`}
              >
                <span className="block">{qd.label}</span>
                <span className={`block text-[10px] mt-0.5 ${date === qd.value ? "text-white/80" : "text-gray-400"}`}>{qd.sub}</span>
              </button>
            ))}
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border ${
                showDatePicker || (date && !quickDates.some(q => q.value === date))
                  ? "bg-[#0066FF] text-white border-[#0066FF]"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#0066FF]/30"
              }`}
            >
              <span className="block">选日期</span>
              <span className={`block text-[10px] mt-0.5 ${showDatePicker ? "text-white/80" : "text-gray-400"}`}>▾</span>
            </button>
          </div>
          {showDatePicker && (
            <input
              type="date"
              value={date}
              min={minDateStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
            />
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">出行人数</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="px-4 py-2.5 text-gray-500 hover:bg-gray-50 transition-colors font-semibold"
            >
              −
            </button>
            <span className="flex-1 text-center font-semibold text-gray-900">{guests}</span>
            <button
              onClick={() => setGuests((g) => Math.min(20, g + 1))}
              className="px-4 py-2.5 text-gray-500 hover:bg-gray-50 transition-colors font-semibold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      {guests > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>¥{unitPrice.toLocaleString()} × {guests}人</span>
            <span>¥{total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <Link
          href={`/routes/checkout?route=${route.slug}&date=${date}&guests=${guests}`}
          className="block w-full py-3 rounded-lg bg-[#3264ff] hover:bg-[#264cc2] text-white font-semibold text-center transition-colors shadow-[0_4px_20px_rgba(15,41,77,0.12)]"
        >
          {date ? "立即预订" : "选择日期预订"}
        </Link>
        <Link
          href="/chat"
          className="block w-full py-2.5 rounded-xl border border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/5 font-medium text-center text-sm transition-colors"
        >
          AI规划师咨询
        </Link>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3">
        <SaveButton entityType="ROUTE" entityId={route.slug ?? route.id} size="md" />
        <ShareButton
          title={route.title}
          description={route.subtitle}
          url={typeof window !== "undefined" ? window.location.href : ""}
          image={route.coverImage ?? undefined}
          entityType="ROUTE"
          entityId={route.slug ?? route.id}
          className="text-sm"
        />
      </div>

      {/* Scarcity indicator */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs">
        <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-red-600 font-medium">仅剩少量名额</span>
        <span className="text-gray-400">· 本周{route.bookCount}人预订</span>
      </div>

      {/* Points display */}
      <div className="mt-2 text-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs border border-amber-200">
          🪙 预订可赚 {Math.floor(unitPrice * guests * 0.05)} 积分
        </span>
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        预订后14天内免费取消
      </p>
    </div>
  );
}

/* ─── main page ─── */

export default function RouteDetailClient({ route }: { route: Route }) {
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-16 pb-24">
        {/* ═══ S1. 面包屑 (白色背景) ═══ */}
        <div className="max-w-[1120px] mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#8592a6]">
              <Link href="/" className="hover:text-[#3264ff]">首页</Link>
              <span>&gt;</span>
              <Link href="/routes" className="hover:text-[#3264ff]">路线</Link>
              <span>&gt;</span>
              <span className="text-[#0f294d]">{route.title}</span>
            </div>
            <ShareButton title={route.title} description={route.subtitle} url={typeof window !== "undefined" ? window.location.href : ""} image={route.coverImage ?? undefined} entityType="ROUTE" entityId={route.slug ?? route.id} className="text-sm" />
          </div>
        </div>

        {/* ═══ S2. 图片画廊 (白色背景，非暗色Hero) ═══ */}
        <div className="max-w-[1120px] mx-auto px-4 mb-4">
          {route.images && route.images.length > 0 ? (
            <PhotoMosaic images={[...(route.coverImage ? [route.coverImage] : []), ...route.images]} alt={route.title} />
          ) : route.coverImage ? (
            <div className="rounded-xl overflow-hidden h-[370px] relative">
              <OptimizedImage src={route.coverImage} alt={route.title} fill className="object-cover" priority />
            </div>
          ) : null}
        </div>

        {/* ═══ S4. 标题信息区 + 两栏布局 ═══ */}
        <div className="max-w-[1120px] mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── 左侧主内容 ── */}
            <div className="flex-1 min-w-0">
              {/* 标题区 */}
              <div className="pb-5 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <h1 className="text-2xl font-bold text-[#0f294d] flex-1">{route.title}</h1>
                  <SaveButton entityType="ROUTE" entityId={route.slug ?? route.id} size="md" />
                </div>
                <p className="text-base text-[#8592a6] mt-1">{route.subtitle}</p>
                {route.titleEn && <p className="text-sm text-[#8592a6] mt-0.5">{route.titleEn}</p>}

                {/* 评分+标签行 */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs">{CATEGORY_LABELS[route.category] ?? route.category}</span>
                  <span className={`px-2.5 py-1 rounded text-xs border ${DIFFICULTY_COLORS[route.difficulty] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty}
                  </span>
                  {route.rating && (
                    <>
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-[#3264ff] text-white">{route.rating.toFixed(1)}/5</span>
                      <a href="#reviews" className="text-sm text-[#3264ff] hover:underline">{route.reviewCount} 条评价 ▶</a>
                    </>
                  )}
                </div>
              </div>

              {/* S5. 实用信息 (Trip.com紧凑列表) */}
              <div className="py-4 border-b border-[#dadfe6] space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                  <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  <span className="font-medium">行程:</span> {route.duration}天{route.nights}晚
                </div>
                <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                  <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07-1.41 1.41M8.34 15.66l-1.41 1.41m12.14 0-1.41-1.41M8.34 8.34 6.93 6.93" /></svg>
                  <span className="font-medium">最佳季节:</span> {route.season}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                  <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  <span className="font-medium">团队规模:</span> {route.groupSize}
                </div>
              </div>

          {/* ========== Religion Affiliation ========== */}
          {route.religion && (
            <div className="mt-4 bg-white border border-[#dadfe6] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${route.religion.color ?? "#3264ff"}15` }}
                >
                  {RELIGION_ICONS[route.religion.name] ?? "🙏"}
                </div>
                <div>
                  <p className="text-sm text-gray-500">所属信仰体系</p>
                  <Link
                    href={`/religions/${route.religion.slug}`}
                    className="font-semibold text-gray-900 hover:text-[#0066FF] transition-colors"
                  >
                    {route.religion.name}
                    <span className="text-sm text-gray-400 ml-2">{route.religion.nameEn}</span>
                  </Link>
                </div>
                <Link
                  href={`/religions/${route.religion.slug}`}
                  className="ml-auto text-sm text-[#0066FF] hover:underline"
                >
                  了解更多 →
                </Link>
              </div>
            </div>
          )}

          {/* ========== Highlights ========== */}
          <div className="flex flex-wrap gap-2 mt-6">
            {route.highlights.map((h) => (
              <span
                key={h}
                className="px-3 py-1.5 bg-[#0066FF]/5 text-[#0066FF] rounded-full text-sm font-medium border border-[#0066FF]/20"
              >
                {h}
              </span>
            ))}
          </div>

          {/* ========== Price Forecast (mobile visible too) ========== */}
          <div className="mt-6">
            <PriceForecast routeId={route.slug ?? route.id} currentPrice={route.priceFrom / 100} />
          </div>

          {/* ========== Description ========== */}
          <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">路线介绍</h2>
            <ExpandableText text={route.description} maxLength={300} />
          </div>

          {/* ========== Social Proof ========== */}
          <div className="mt-6">
            <SocialProof entityType="ROUTE" entityId={route.slug ?? route.id} variant="banner" />
          </div>

          {/* ========== Interactive Route Map ========== */}
          {route.sites && route.sites.length > 0 && (
            <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">路线地图</h2>
              <p className="text-sm text-gray-500 mb-4">
                途经 {route.sites.length} 个圣地，全程 {route.duration} 天 {route.nights} 晚
              </p>
              <RouteMap sites={route.sites} height="400px" />
            </div>
          )}

          {/* ========== Image Gallery (Mosaic) ========== */}
          {route.images && route.images.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-[#0f294d] mb-3">路线图集</h2>
              <PhotoMosaic images={route.images} alt={route.title} />
            </div>
          )}

          {/* ========== Multimedia Tour ========== */}
          <div className="mt-6">
            <MediaTour entityType="ROUTE" entityId={route.id} />
          </div>

          {/* ========== Itinerary ========== */}
          <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">逐日行程</h2>
            <div className="space-y-6">
              {(route.itinerary as ItineraryDay[]).map((day) => (
                <div
                  key={day.day}
                  className="relative pl-8 pb-6 border-l-2 border-[#0066FF]/30 last:border-transparent"
                >
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-[#0066FF] rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-bold">{day.day}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Day {day.day}: {day.title}
                  </h3>
                  {day.activities && day.activities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {day.activities.map((act, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-sm border border-blue-200"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  )}
                  {day.meals && day.meals.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">🍽 {day.meals.join(" | ")}</p>
                  )}
                  {day.accommodation && (
                    <p className="text-sm text-gray-500 mt-1">🏨 {day.accommodation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ========== Included / Excluded ========== */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#dadfe6] rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">费用包含</h2>
              <ul className="space-y-2">
                {route.included.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-emerald-400">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-[#dadfe6] rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">费用不含</h2>
              <ul className="space-y-2">
                {route.excluded.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-red-400">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ========== Cancellation Policy ========== */}
          <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
            <h2 className="text-base font-bold text-[#0f294d] mb-3">取消与退款政策</h2>
            <div className="space-y-2">
              {CANCELLATION_POLICIES.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#455873]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8592a6] shrink-0" />
                  {p.text}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
              * 如遇不可抗力（自然灾害、疫情等），可申请全额退款。退款将在7个工作日内原路返还。
            </p>
          </div>

          {/* ========== Tips ========== */}
          {route.tips.length > 0 && (
            <div className="mt-6 bg-amber-50 rounded-lg p-4 border border-amber-200">
              <h2 className="text-lg font-bold text-amber-600 mb-3">出行贴士</h2>
              <ul className="space-y-2">
                {route.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="mt-0.5">💡</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ========== Related Sites ========== */}
          {route.sites && route.sites.length > 0 && (
            <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">途经圣地</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {route.sites.map((rs) => (
                  <Link
                    key={rs.id}
                    href="/holy-sites"
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 hover:border-[#0066FF]/30"
                  >
                    <div className="w-10 h-10 bg-[#0066FF]/10 rounded-lg flex items-center justify-center text-[#0066FF] font-bold text-sm border border-[#0066FF]/20">
                      D{rs.day}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{rs.site.name}</p>
                      <p className="text-xs text-gray-500">
                        {rs.site.country} · {rs.duration ?? ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ========== Related Culture (Patriarchs & Teachings) ========== */}
          <RelatedCulture religionId={route.religionId} />

          {/* ========== Pilgrim Journals ========== */}
          <div className="mt-6 bg-gradient-to-r from-[#3264ff]/5 to-blue-50 rounded-lg p-4 border border-[#3264ff]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📖</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">朝圣者日志</h2>
                  <p className="text-sm text-gray-500">查看走过此路线的朝圣者们的记录与感悟</p>
                </div>
              </div>
              <Link
                href="/journals"
                className="px-4 py-2 rounded-xl bg-[#0066FF] text-white text-sm font-medium hover:bg-[#0052CC] transition-colors shadow-sm"
              >
                查看日志
              </Link>
            </div>
          </div>

          {/* ========== Reviews (UGC) ========== */}
          <div id="reviews" className="mt-10">
            <ReviewSection targetType="ROUTE" targetId={route.id} />
          </div>

          {/* ========== FAQ Accordion ========== */}
          <FAQAccordion />

          {/* ========== Q&A Section ========== */}
          <div className="mt-10">
            <QASection entityType="ROUTE" entityId={route.id} />
          </div>

          {/* ========== Similar Routes ========== */}
          <SimilarRoutes currentRouteId={route.id} category={route.category} />

            </div>{/* end left column */}

            {/* ── 右侧Sticky BookingWidget (桌面端) ── */}
            <div className="hidden lg:block w-[340px] flex-shrink-0">
              <div className="sticky top-20">
                <BookingWidget route={route} />
              </div>
            </div>
          </div>{/* end flex row */}
        </div>{/* end max-w container */}

        {/* 移动端粘性底栏 */}
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2.5 flex items-center gap-3" style={{ boxShadow: "0 -2px 10px rgba(0,0,0,0.08)" }}>
          <div className="flex-1">
            <p className="text-lg font-bold text-[#0f294d]">¥{(route.priceFrom / 100).toLocaleString()}<span className="text-sm font-normal text-[#8592a6]">/人</span></p>
          </div>
          <Link
            href={`/routes/checkout?route=${route.slug}`}
            className="px-6 py-2.5 bg-[#3264ff] hover:bg-[#2854e0] text-white font-semibold rounded-lg text-sm transition-colors"
          >
            立即预订
          </Link>
        </div>
      </main>
      {/* Xiaohong AI Floating Widget */}
      <XiaohongFloat routeTitle={route.title} />
      <MobileNav />
    </div>
  );
}
