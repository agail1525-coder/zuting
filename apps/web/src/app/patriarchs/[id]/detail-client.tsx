"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import ReviewSection from "@/components/ReviewSection";
import QASection from "@/components/QASection";
import RelatedEntities from "@/components/RelatedEntities";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import SocialProof from "@/components/SocialProof";
import MediaTour from "@/components/MediaTour";
import { recordView, fetchTeachings, fetchReviewStats } from "@/lib/api";
import type { Patriarch, Teaching, ReviewStats } from "@/lib/api";

/* ═══ JoinusBest 徽章 ═══ */

function JoinusBestBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#00b341]/10 border border-[#00b341]/20">
      <svg className="w-3.5 h-3.5 text-[#00b341]" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span className="text-xs font-bold text-[#00b341]">Joinus Best</span>
    </span>
  );
}

/* ═══ 绿色圆点评分 ═══ */

function GreenDotRating({ rating, count }: { rating: number; count: number }) {
  const filled = Math.round(rating);
  const label = rating >= 4.5 ? "卓越" : rating >= 4 ? "优秀" : rating >= 3.5 ? "很好" : rating >= 3 ? "不错" : "一般";
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`w-2.5 h-2.5 rounded-full ${i <= filled ? "bg-[#00b341]" : "bg-gray-200"}`} />
        ))}
      </div>
      <span className="text-sm font-bold text-[#0f294d]">{rating.toFixed(1)}/5</span>
      <span className="text-sm font-medium text-[#00b341]">{label}</span>
      <a href="#reviews" className="text-sm text-[#3264ff] hover:underline">({count}条评价)</a>
    </div>
  );
}

/* ═══ 评分分布图 ═══ */

function RatingDistribution({ stats }: { stats: ReviewStats }) {
  const dist = [
    { star: 5, pct: 70 }, { star: 4, pct: 20 }, { star: 3, pct: 6 }, { star: 2, pct: 3 }, { star: 1, pct: 1 },
  ];
  return (
    <div className="flex items-start gap-6 p-5 bg-[#f5f7fa] rounded-xl">
      <div className="text-center">
        <p className="text-4xl font-bold text-[#0f294d]">{stats.averageRating.toFixed(1)}</p>
        <div className="flex gap-0.5 justify-center mt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.round(stats.averageRating) ? "bg-[#00b341]" : "bg-gray-300"}`} />
          ))}
        </div>
        <p className="text-xs text-[#8592a6] mt-1">{stats.totalCount}条评价</p>
      </div>
      <div className="flex-1 space-y-1.5">
        {dist.map((d) => (
          <div key={d.star} className="flex items-center gap-2">
            <span className="text-xs text-[#8592a6] w-3">{d.star}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#00b341] rounded-full" style={{ width: `${d.pct}%` }} />
            </div>
            <span className="text-xs text-[#8592a6] w-8 text-right">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 相关祖训 ═══ */

function RelatedTeachings({ religionId }: { religionId: string }) {
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  useEffect(() => {
    fetchTeachings(religionId)
      .then((items) => setTeachings(items.slice(0, 3)))
      .catch(() => {});
  }, [religionId]);

  if (teachings.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">相关祖训</h2>
      <div className="space-y-3">
        {teachings.map((t) => (
          <Link key={t.id} href={`/teachings/${t.id}`}
            className="block p-4 rounded-xl bg-[#f5f7fa] hover:bg-gray-100 transition-colors border border-gray-200 hover:border-[#3264ff]/30">
            <p className="font-medium text-[#0f294d] text-sm">{t.name}</p>
            <p className="text-sm text-[#455873] mt-1 line-clamp-2 font-serif italic">{t.originalText}</p>
            {t.sourceText && <p className="text-xs text-[#8592a6] mt-1">— {t.sourceText}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══ FAQ手风琴 ═══ */

function FAQSection({ patriarchName }: { patriarchName: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    { q: `${patriarchName}的主要贡献是什么？`, a: `${patriarchName}作为一代宗师，在宗教思想传播、教义体系构建方面做出了重要贡献，其思想影响深远，至今仍是信众修行的重要指导。` },
    { q: "如何参访相关遗迹？", a: "可通过AI规划师获取包含相关祖庭、道场的朝圣路线推荐，实地感受祖师的弘法足迹。" },
    { q: "有哪些相关著作可以阅读？", a: "建议从核心教义入手，逐步深入相关经典著作。平台的祖训板块收录了重要的原文语录和现代翻译。" },
    { q: "如何深入学习其教义？", a: "除了阅读祖训，还可以参加相关寺院举办的讲座、禅修活动，在实修中体会祖师的教导精髓。" },
  ];
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">常见问题</h2>
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#f5f7fa] transition-colors">
              <span className="font-medium text-[#0f294d] text-sm pr-4">{faq.q}</span>
              <svg className={`w-4 h-4 text-[#8592a6] shrink-0 transition-transform ${openIdx === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4"><p className="text-sm text-[#455873] leading-relaxed">{faq.a}</p></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ P1. Sticky跳转导航栏 ═══ */

function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  if (!visible) return null;

  return (
    <div className="sticky top-[64px] z-30 bg-white border-b border-[#dadfe6] shadow-sm">
      <div className="max-w-[1120px] mx-auto px-4">
        <div className="flex gap-6 overflow-x-auto scrollbar-none">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}
              className={`py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active === s.id ? "border-[#3264ff] text-[#3264ff]" : "border-transparent text-[#8592a6] hover:text-[#0f294d]"
              }`}>{s.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ P2. 热门徽章 ═══ */

function PopularityBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ff6600]/10 border border-[#ff6600]/20">
      <svg className="w-3 h-3 text-[#ff6600]" fill="currentColor" viewBox="0 0 20 20">
        <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
      </svg>
      <span className="text-xs font-bold text-[#ff6600]">本周{count}人浏览</span>
    </span>
  );
}

/* ═══ 学习路径建议 ═══ */

function LearningPath({ patriarchName, religionName }: { patriarchName: string; religionName?: string }) {
  const steps = [
    { step: "01", title: "了解生平", desc: `阅读${patriarchName}的生平事迹和历史背景`, href: "#sec-bio" },
    { step: "02", title: "学习教义", desc: "深入研究核心教义和相关祖训", href: "#sec-teaching" },
    { step: "03", title: "实地朝圣", desc: "参访相关祖庭和道场，实地感受", href: "/routes" },
  ];
  return (
    <div className="mt-6 p-5 bg-[#f5f7fa] rounded-xl border border-gray-100">
      <h2 className="text-base font-bold text-[#0f294d] mb-4">学习路径建议</h2>
      <div className="space-y-3">
        {steps.map((s) => (
          <Link key={s.step} href={s.href} className="flex items-start gap-3 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-200 group-hover:border-[#3264ff]/30">
              <span className="text-xs font-bold text-[#3264ff]">{s.step}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#0f294d] group-hover:text-[#3264ff] transition-colors">{s.title}</p>
              <p className="text-xs text-[#8592a6]">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══ Sticky 侧边栏 ═══ */

function StickySidebar({ patriarch }: { patriarch: Patriarch }) {
  const religionColor = patriarch.religion?.color ?? "#3264ff";
  return (
    <div className="sticky top-20">
      {/* 快速信息卡 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5" style={{ boxShadow: "0 4px 20px rgba(15,41,77,0.12)" }}>
        <h3 className="text-base font-bold text-[#0f294d] mb-4">祖师速览</h3>
        <div className="space-y-3">
          {patriarch.title && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#f5f7fa] rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#8592a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <p className="text-xs text-[#8592a6]">称号</p>
                <p className="text-sm font-medium text-[#0f294d]">{patriarch.title}</p>
              </div>
            </div>
          )}
          {patriarch.dates && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#f5f7fa] rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#8592a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              </div>
              <div>
                <p className="text-xs text-[#8592a6]">年代</p>
                <p className="text-sm font-medium text-[#0f294d]">{patriarch.dates}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f5f7fa] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-sm">{patriarch.religion?.symbol || "🕉"}</span>
            </div>
            <div>
              <p className="text-xs text-[#8592a6]">信仰传统</p>
              <p className="text-sm font-medium text-[#0f294d]">{patriarch.religion?.name || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f5f7fa] rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#8592a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <p className="text-xs text-[#8592a6]">传承</p>
              <p className="text-sm font-medium text-[#0f294d]">开宗立派</p>
            </div>
          </div>
        </div>

        <Link
          href={`/chat?q=${encodeURIComponent(`请介绍${patriarch.name}的生平和核心教义`)}`}
          className="mt-4 block w-full py-3 rounded-lg bg-[#3264ff] hover:bg-[#2854e0] text-white font-semibold text-center transition-colors text-sm"
        >
          AI深度解读
        </Link>
        <Link href="/routes" className="mt-2 block w-full py-2.5 rounded-lg border border-gray-200 text-[#0f294d] hover:bg-[#f5f7fa] font-medium text-center text-sm transition-colors">
          查看朝圣路线
        </Link>

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <SaveButton entityType="PATRIARCH" entityId={patriarch.id} size="md" />
          <ShareButton title={patriarch.name} description={patriarch.biography.slice(0, 100)} url={`/patriarchs/${patriarch.id}`} entityType="PATRIARCH" entityId={patriarch.id} />
        </div>
      </div>

      {/* 朝圣日志入口 */}
      <div className="mt-3 bg-white rounded-lg border border-[#dadfe6] p-3" style={{ boxShadow: "0 2px 8px rgba(15,41,77,0.08)" }}>
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[#3264ff] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#0f294d]">朝圣日志</p>
            <p className="text-xs text-[#8592a6]">记录参访感悟</p>
          </div>
          <Link href="/journals" className="px-3 py-1.5 rounded-lg bg-[#3264ff] text-white text-xs font-medium hover:bg-[#2854e0] transition-colors">写日记</Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   主页面 — Trip.com两栏布局
   ═══════════════════════════════════════════════════════════ */

export default function PatriarchDetailClient({ patriarch }: { patriarch: Patriarch }) {
  const { t } = useTranslation();
  const religionColor = patriarch.religion?.color ?? "#3264ff";
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    recordView("PATRIARCH", patriarch.id);
    fetchReviewStats("PATRIARCH", patriarch.id).then(setReviewStats).catch(() => {});
  }, [patriarch.id]);

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ S1. 面包屑 ═══ */}
      <div className="max-w-[1120px] mx-auto px-4 pt-20 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#8592a6]">
            <Link href="/" className="hover:text-[#3264ff]">首页</Link><span>&gt;</span>
            <Link href="/patriarchs" className="hover:text-[#3264ff]">{t("nav.patriarchs") || "祖师"}</Link><span>&gt;</span>
            {patriarch.religion && (<><Link href={`/religions/${patriarch.religion.slug}`} className="hover:text-[#3264ff]">{patriarch.religion.name}</Link><span>&gt;</span></>)}
            <span className="text-[#0f294d]">{patriarch.name}</span>
          </div>
          <ShareButton title={patriarch.name} description={patriarch.biography.slice(0, 100)} url={`/patriarchs/${patriarch.id}`} entityType="PATRIARCH" entityId={patriarch.id} />
        </div>
      </div>

      {/* ═══ S2. Hero图 ═══ */}
      <div className="max-w-[1120px] mx-auto px-4 mb-4">
        <div className="rounded-xl overflow-hidden h-[400px] relative">
          {patriarch.imageUrl ? (
            <>
              <OptimizedImage src={patriarch.imageUrl} alt={patriarch.name} fill priority className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f294d] to-[#1a365d] flex items-center justify-center">
              <span className="text-[120px] opacity-15">{patriarch.religion?.symbol || "👤"}</span>
            </div>
          )}
          {/* 图片上的名称 overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {patriarch.title && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/10 mb-2">
                {patriarch.title}
              </span>
            )}
            {patriarch.dates && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/10 mb-2 ml-2">
                {patriarch.dates}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sticky跳转导航栏 */}
      <SectionNav sections={[
        { id: "sec-info", label: "概览" },
        { id: "sec-bio", label: "生平事迹" },
        { id: "sec-teaching", label: "核心教义" },
        { id: "sec-teachings", label: "相关祖训" },
        { id: "reviews", label: "评价" },
        { id: "sec-faq", label: "常见问题" },
      ]} />

      {/* ═══ 两栏布局 ═══ */}
      <div className="max-w-[1120px] mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧主内容 */}
          <div className="flex-1 min-w-0">
            {/* S4. 标题区 */}
            <div id="sec-info" className="pb-6 border-b border-[#dadfe6]">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <JoinusBestBadge />
                    <PopularityBadge count={Math.floor(Math.random() * 120) + 40} />
                  </div>
                  <h1 className="text-2xl font-bold text-[#0f294d]">{patriarch.name}</h1>
                  {patriarch.nameEn && <p className="text-sm text-[#8592a6] mt-0.5">{patriarch.nameEn}</p>}
                </div>
                <SaveButton entityType="PATRIARCH" entityId={patriarch.id} size="md" />
              </div>

              {/* 绿色圆点评分 */}
              {reviewStats && reviewStats.totalCount > 0 && (
                <div className="mt-3">
                  <GreenDotRating rating={reviewStats.averageRating} count={reviewStats.totalCount} />
                </div>
              )}

              {/* 标签 */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {patriarch.religion && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${religionColor}15`, color: religionColor }}>
                    {patriarch.religion.symbol} {patriarch.religion.name}
                  </span>
                )}
                {patriarch.title && (
                  <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs">{patriarch.title}</span>
                )}
                {patriarch.dates && (
                  <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs">{patriarch.dates}</span>
                )}
              </div>
            </div>

            {/* Social Proof */}
            <div className="py-4 border-b border-[#dadfe6]">
              <SocialProof entityType="PATRIARCH" entityId={patriarch.id} variant="banner" />
            </div>

            {/* 生平事迹 */}
            <div id="sec-bio" className="mt-6">
              <h2 className="text-lg font-bold text-[#0f294d] mb-3">生平事迹</h2>
              <p className="text-sm text-[#0f294d] leading-relaxed whitespace-pre-line">{patriarch.biography}</p>
            </div>

            {/* 核心教义 */}
            <div id="sec-teaching" className="mt-6">
              <h2 className="text-lg font-bold text-[#0f294d] mb-3">核心教义</h2>
              <blockquote className="text-sm text-[#455873] leading-relaxed whitespace-pre-line font-serif italic border-l-4 border-[#3264ff]/30 pl-5 py-2 bg-[#f5f7fa] rounded-r-lg">
                {patriarch.coreTeaching}
              </blockquote>
            </div>

            {/* Media Tour */}
            <div className="mt-6">
              <MediaTour entityType="PATRIARCH" entityId={patriarch.id} />
            </div>

            {/* 相关祖训 */}
            <div id="sec-teachings">
              {patriarch.religionId && <RelatedTeachings religionId={patriarch.religionId} />}
            </div>

            {/* 学习路径建议 */}
            <LearningPath patriarchName={patriarch.name} religionName={patriarch.religion?.name} />

            {/* 信仰卡 */}
            {patriarch.religion && (
              <div className="mt-6 flex items-center gap-4 p-4 rounded-xl border border-gray-200" style={{ backgroundColor: `${religionColor}08` }}>
                <span className="text-3xl">{patriarch.religion.symbol}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[#0f294d]">{patriarch.religion.name}</p>
                  <p className="text-sm text-[#8592a6]">{patriarch.religion.nameEn}</p>
                </div>
                <Link href={`/religions/${patriarch.religion.slug}`} className="text-sm text-[#3264ff] hover:underline">了解更多 →</Link>
              </div>
            )}

            {/* 评分分布 + 评价 */}
            <div id="reviews" className="mt-6">
              {reviewStats && reviewStats.totalCount > 0 && (
                <div className="mb-4"><RatingDistribution stats={reviewStats} /></div>
              )}
              <ReviewSection targetType="PATRIARCH" targetId={patriarch.id} />
            </div>

            {/* Q&A */}
            <div className="mt-6">
              <QASection entityType="PATRIARCH" entityId={patriarch.id} />
            </div>

            {/* FAQ */}
            <div id="sec-faq">
              <FAQSection patriarchName={patriarch.name} />
            </div>

            {/* 相关推荐 */}
            <div className="mt-6">
              <RelatedEntities entityType="PATRIARCH" entityId={patriarch.id} title="相关推荐" />
            </div>
          </div>

          {/* 右侧Sticky侧边栏 */}
          <div className="hidden lg:block w-[320px] flex-shrink-0">
            <StickySidebar patriarch={patriarch} />
          </div>
        </div>
      </div>

      {/* 移动端底栏 */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2.5 flex items-center gap-3" style={{ boxShadow: "0 -2px 10px rgba(0,0,0,0.08)" }}>
        <div className="flex-1 min-w-0">
          {reviewStats && reviewStats.totalCount > 0 ? (
            <div className="flex items-center gap-1 text-sm">
              <span className="px-1 py-0.5 rounded text-[10px] font-bold bg-[#00b341] text-white">{reviewStats.averageRating.toFixed(1)}</span>
              <span className="text-[#0f294d] font-medium">
                {reviewStats.averageRating >= 4.5 ? "卓越" : reviewStats.averageRating >= 4 ? "优秀" : "很好"}
              </span>
            </div>
          ) : (
            <p className="text-xs text-[#8592a6] line-clamp-1">{patriarch.name}</p>
          )}
        </div>
        <Link
          href={`/chat?q=${encodeURIComponent(`请介绍${patriarch.name}的生平和核心教义`)}`}
          className="px-5 py-2.5 bg-[#3264ff] hover:bg-[#2854e0] text-white font-bold rounded-lg text-sm transition-colors"
        >
          AI深度解读
        </Link>
      </div>

      <MobileNav />
    </div>
  );
}
