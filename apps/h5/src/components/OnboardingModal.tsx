import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

const STORAGE_KEY = "onboarding-v1";

export default function OnboardingModal() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const SLIDES = [
    { icon: "🌍", title: t("onboarding.slide1.title"), body: t("onboarding.slide1.body") },
    { icon: "🧭", title: t("onboarding.slide2.title"), body: t("onboarding.slide2.body") },
    { icon: "🔮", title: t("onboarding.slide3.title"), body: t("onboarding.slide3.body") },
  ];

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
              {t("onboarding.skip")}
            </button>
            <button
              onClick={() => (isLast ? finish() : setStep(step + 1))}
              className="flex-1 px-4 py-2 rounded-full bg-[#3264ff] text-white font-semibold text-sm"
            >
              {isLast ? t("onboarding.start") : t("onboarding.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
