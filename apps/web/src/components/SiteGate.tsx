"use client";

import { useState, useEffect } from "react";

const SITE_PASSWORD = "zuting2026";
const STORAGE_KEY = "zuting_site_unlocked";

export default function SiteGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    setUnlocked(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  // Hydration: show nothing until we check localStorage
  if (unlocked === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0066FF] to-[#003D99]" />
    );
  }

  if (unlocked) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === SITE_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066FF] to-[#003D99] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] rounded-full bg-white/5" />
      <div className="absolute bottom-[-60px] left-[-40px] w-[200px] h-[200px] rounded-full bg-white/5" />
      <div className="absolute top-[20%] left-[10%] w-4 h-4 rounded-full bg-white/10" />
      <div className="absolute top-[40%] right-[15%] w-3 h-3 rounded-full bg-white/15" />
      <div className="absolute bottom-[30%] left-[25%] w-2 h-2 rounded-full bg-white/20" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Logo / Brand */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10M12 2a15 15 0 00-4 10 15 15 0 004 10" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            帮助100万人走祖庭
          </h1>
          <p className="text-white/70 text-lg">
            探索全球60+文化圣地，体验千年智慧之旅
          </p>
        </div>

        {/* Construction badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-white/80 text-sm">网站建设中，即将上线</span>
        </div>

        {/* Password form */}
        <form
          onSubmit={handleSubmit}
          className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 ${shaking ? "animate-shake" : ""}`}
        >
          <p className="text-white/80 text-sm mb-4">输入访问密码预览网站</p>
          <div className="flex gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="请输入访问密码"
              className={`flex-1 px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-white/40 outline-none text-sm transition-colors ${
                error ? "border-red-400" : "border-white/20 focus:border-white/50"
              }`}
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-[#0066FF] font-semibold rounded-xl hover:bg-white/90 transition-colors text-sm shrink-0"
            >
              进入
            </button>
          </div>
          {error && (
            <p className="text-red-300 text-xs mt-2 text-left">密码错误，请重试</p>
          )}
        </form>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 mt-10 text-white/50 text-xs">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            12大文化传统
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            60+文化圣地
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            AI旅行规划
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            专业路线策划
          </span>
        </div>

        {/* Copyright */}
        <p className="text-white/30 text-xs mt-12">
          &copy; 2026 Joinus.com &middot; 全球文化旅行平台
        </p>
      </div>

      {/* Shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
