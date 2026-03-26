"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";

const ONBOARDING_KEY = "zuting-onboarding-done";
const PREFS_KEY = "zuting-religion-preferences";

const RELIGION_OPTIONS = [
  { slug: "buddhism", name: "佛教", nameEn: "Buddhism", symbol: "☸" },
  { slug: "taoism", name: "道教", nameEn: "Taoism", symbol: "☯" },
  { slug: "christianity", name: "基督教", nameEn: "Christianity", symbol: "✝" },
  { slug: "islam", name: "伊斯兰教", nameEn: "Islam", symbol: "☪" },
  { slug: "hinduism", name: "印度教", nameEn: "Hinduism", symbol: "🕉" },
  { slug: "judaism", name: "犹太教", nameEn: "Judaism", symbol: "✡" },
  { slug: "confucianism", name: "儒教", nameEn: "Confucianism", symbol: "仁" },
  { slug: "sikhism", name: "锡克教", nameEn: "Sikhism", symbol: "🪯" },
  { slug: "shintoism", name: "神道教", nameEn: "Shintoism", symbol: "⛩" },
  { slug: "tibetan-buddhism", name: "藏传佛教", nameEn: "Tibetan Buddhism", symbol: "🙏" },
  { slug: "indigenous-spirituality", name: "原住民灵性", nameEn: "Indigenous", symbol: "🌿" },
  { slug: "bahai", name: "巴哈伊教", nameEn: "Baha'i", symbol: "✴" },
];

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const { locale } = useTranslation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "true");
      if (selected.length > 0) {
        localStorage.setItem(PREFS_KEY, JSON.stringify(selected));
      }
    }
    setVisible(false);
  }, [selected]);

  const skip = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "true");
    }
    setVisible(false);
  }, []);

  const toggleReligion = useCallback((slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  if (!visible) return null;

  const isZh = locale === "zh-CN";

  const slides = [
    // Slide 0: Welcome
    <div key="welcome" className="text-center px-4">
      <div className="text-7xl mb-6">🏛</div>
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-4">
        {isZh ? "欢迎来到全球祖庭" : "Welcome to Zuting"}
      </h2>
      <p className="text-temple-300 text-lg leading-relaxed max-w-md mx-auto mb-2">
        {isZh
          ? "探索12大信仰、60处圣地、27座祖庭，踏上一段心灵朝圣之旅。"
          : "Explore 12 faiths, 60 holy sites, 27 ancestral temples. Begin your spiritual pilgrimage."}
      </p>
      <p className="text-temple-500 text-sm">
        {isZh
          ? "帮助100万人走祖庭，建立全球宗教文化和平使者网络"
          : "Helping 1 million people walk the ancestral temples"}
      </p>
    </div>,

    // Slide 1: Choose interests
    <div key="interests" className="px-4">
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-gradient-gold mb-2 text-center">
        {isZh ? "选择您感兴趣的信仰" : "Choose Your Interests"}
      </h2>
      <p className="text-temple-400 text-center mb-6 text-sm">
        {isZh ? "我们将为您推荐相关圣地和内容" : "We'll recommend relevant sites and content"}
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
        {RELIGION_OPTIONS.map((r) => {
          const isSelected = selected.includes(r.slug);
          return (
            <button
              key={r.slug}
              onClick={() => toggleReligion(r.slug)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                isSelected
                  ? "border-gold bg-gold/10 shadow-[0_0_12px_rgba(212,168,85,0.15)]"
                  : "border-gold/10 bg-temple-800/50 hover:border-gold/30"
              }`}
            >
              <span className="text-2xl">{r.symbol}</span>
              <span
                className={`text-xs font-medium ${
                  isSelected ? "text-gold" : "text-temple-300"
                }`}
              >
                {isZh ? r.name : r.nameEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>,

    // Slide 2: Start exploring
    <div key="start" className="text-center px-4">
      <div className="text-7xl mb-6">🗺</div>
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-4">
        {isZh ? "开始探索" : "Start Exploring"}
      </h2>
      <p className="text-temple-300 text-lg leading-relaxed max-w-md mx-auto mb-6">
        {isZh
          ? "浏览全球圣地地图、规划朝圣行程、与小鸿AI聊天，或阅读古老的祖训智慧。"
          : "Browse the global map, plan pilgrimages, chat with XiaoHong AI, or read ancient wisdom."}
      </p>
      <div className="flex flex-wrap justify-center gap-4 text-sm text-temple-400">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">🗺</span>
          <span>{isZh ? "地图探索" : "Map"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">💬</span>
          <span>{isZh ? "AI助手" : "AI Chat"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">✈</span>
          <span>{isZh ? "行程规划" : "Trips"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">📖</span>
          <span>{isZh ? "朝圣日志" : "Journal"}</span>
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-temple-900/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl mx-4 bg-gradient-to-b from-temple-800 to-temple-900 border border-gold/20 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Skip button */}
        <button
          onClick={skip}
          className="absolute top-4 right-4 text-temple-500 hover:text-gold text-sm transition-colors z-10"
        >
          {isZh ? "跳过" : "Skip"}
        </button>

        {/* Content area */}
        <div className="py-12 px-6 min-h-[380px] flex items-center justify-center">
          {slides[step]}
        </div>

        {/* Footer with dots + buttons */}
        <div className="px-6 pb-6 flex items-center justify-between">
          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? "bg-gold w-6" : "bg-temple-600"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2 text-sm border border-gold/20 text-gold rounded-full hover:bg-gold/10 transition-all"
              >
                {isZh ? "上一步" : "Back"}
              </button>
            )}
            {step < slides.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 text-sm bg-gold text-temple-900 font-semibold rounded-full hover:bg-gold-light transition-all"
              >
                {isZh ? "下一步" : "Next"}
              </button>
            ) : (
              <button
                onClick={finish}
                className="px-6 py-2 text-sm bg-gold text-temple-900 font-semibold rounded-full hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
              >
                {isZh ? "开始旅程" : "Let's Go!"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
