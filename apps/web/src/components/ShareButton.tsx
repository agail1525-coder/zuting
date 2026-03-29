"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

interface ShareButtonProps {
  title: string;
  description?: string;
  url: string;
  image?: string;
  className?: string;
  entityType?: string;
  entityId?: string;
}

const SHARE_CHANNELS = [
  { key: "wechat", icon: "💬", platform: "WECHAT" },
  { key: "weibo", icon: "📡", platform: "WEIBO" },
  { key: "facebook", icon: "📘", platform: "FACEBOOK" },
  { key: "twitter", icon: "🐦", platform: "TWITTER" },
  { key: "whatsapp", icon: "📱", platform: "WHATSAPP" },
  { key: "copy", icon: "🔗", platform: "COPY" },
] as const;

export default function ShareButton({
  title,
  description = "",
  url,
  className = "",
  entityType,
  entityId,
}: ShareButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowQR(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${url}`
    : url;

  const recordShare = async (platform: string) => {
    if (!entityType || !entityId) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch("/api/shares", {
        method: "POST",
        headers,
        body: JSON.stringify({ platform, entityType, entityId }),
      });
    } catch {
      // Silently fail — sharing analytics is non-critical
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: fullUrl });
        await recordShare("NATIVE");
      } catch {
        // User cancelled
      }
    } else {
      setOpen(true);
    }
  };

  const handleChannelShare = async (platform: string) => {
    const text = encodeURIComponent(`${title} - ${description}`);
    const encodedUrl = encodeURIComponent(fullUrl);

    switch (platform) {
      case "WECHAT":
        setShowQR(true);
        break;
      case "WEIBO":
        window.open(`https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${text}`, "_blank", "width=600,height=500");
        break;
      case "FACEBOOK":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "width=600,height=500");
        break;
      case "TWITTER":
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`, "_blank", "width=600,height=500");
        break;
      case "WHATSAPP":
        window.open(`https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`, "_blank");
        break;
      case "COPY":
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }

    await recordShare(platform);
    if (platform !== "WECHAT") setOpen(false);
  };

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-[#0066FF] hover:bg-blue-50 rounded-lg transition-colors"
        title={t("share.button")}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="hidden sm:inline">{t("share.button")}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{t("share.title")}</p>
          </div>
          <div className="p-2 grid grid-cols-3 gap-1">
            {SHARE_CHANNELS.map((ch) => (
              <button
                key={ch.key}
                onClick={() => handleChannelShare(ch.platform)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">{ch.icon}</span>
                <span className="text-xs text-gray-600">
                  {ch.key === "copy" && copied ? t("share.copied") : t(`share.${ch.key}`)}
                </span>
              </button>
            ))}
          </div>
          {showQR && (
            <div className="px-4 py-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500 mb-2">{t("share.wechatQR")}</p>
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                {t("share.scanQR")}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
