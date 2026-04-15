import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent-v1";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, at: Date.now() }));
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, at: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 md:p-4">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-1">🍪 Cookie 使用提示</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            我们使用 Cookie 以改善浏览体验、分析流量、提供个性化推荐。继续使用即表示你同意我们的
            <a href="/privacy" className="text-[#3264ff] underline mx-1">隐私政策</a>。
          </p>
        </div>
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button onClick={reject} className="flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-700">
            仅必要
          </button>
          <button onClick={accept} className="flex-1 sm:flex-none px-4 py-1.5 text-xs rounded-full bg-[#3264ff] text-white font-semibold">
            接受全部
          </button>
        </div>
      </div>
    </div>
  );
}
