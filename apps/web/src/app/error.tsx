"use client";

import { useEffect } from "react";
import Link from "next/link";
import { captureException } from "@/lib/sentry";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          <div className="text-5xl mb-4">&#x26A0;&#xFE0F;</div>
          <h1 className="text-2xl font-serif font-bold text-gradient-gold mb-3">
            出了点问题
          </h1>
          <p className="text-temple-400 text-sm mb-6 leading-relaxed">
            {error.message || "页面加载时发生错误，请稍后再试。"}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl bg-gold/20 border border-gold/40 text-gold font-semibold hover:bg-gold/30 transition-colors"
            >
              重试
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-temple-700/50 border border-temple-600 text-temple-300 font-semibold hover:bg-temple-700/70 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
