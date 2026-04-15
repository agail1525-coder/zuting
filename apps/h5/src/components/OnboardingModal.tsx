import { useEffect, useState } from "react";

const STORAGE_KEY = "onboarding-v1";

const SLIDES = [
  {
    icon: "🌍",
    title: "探索人类文明",
    body: "12 大文化传统 · 300 文化圣地 · 真实 GPS 坐标与经文典故",
  },
  {
    icon: "🧭",
    title: "规划你的佳绩之旅",
    body: "精品文化路线 · AI 定制行程 · 多档配套灵活选择",
  },
  {
    icon: "🔮",
    title: "小鸿 AI 常伴左右",
    body: "问答 · 智慧融通 · 信仰力评估 · 文化与生命主题对话",
  },
];

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "done");
    setVisible(false);
  };

  if (!visible) return null;

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-[#3264ff] to-[#2850cc] p-6 text-white text-center">
          <div className="text-5xl mb-3">{slide.icon}</div>
          <h3 className="text-xl font-bold">{slide.title}</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-700 leading-relaxed text-center">{slide.body}</p>
          <div className="flex justify-center gap-1.5 mt-5">
            {SLIDES.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-[#3264ff]" : "w-1.5 bg-gray-300"}`} />
            ))}
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={finish} className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-gray-700 text-sm">
              跳过
            </button>
            <button
              onClick={() => (isLast ? finish() : setStep(step + 1))}
              className="flex-1 px-4 py-2 rounded-full bg-[#3264ff] text-white font-semibold text-sm"
            >
              {isLast ? "开始探索" : "下一步"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
