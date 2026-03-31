"use client";

import { useState, useEffect, useCallback } from "react";
import { onToast, type ToastEvent, type ToastType } from "@/lib/toast";

const TYPE_STYLES: Record<ToastType, string> = {
  success: "bg-emerald-600/95 text-white",
  error: "bg-red-600/95 text-white",
  info: "bg-blue-600/95 text-white",
  warning: "bg-amber-500/95 text-white",
};

const TYPE_ICONS: Record<ToastType, string> = {
  success: "\u2713",
  error: "\u2717",
  info: "\u2139",
  warning: "\u26A0",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    return onToast((event) => {
      setToasts((prev) => [...prev.slice(-4), event]); // keep max 5
      setTimeout(() => remove(event.id), event.duration);
    });
  }, [remove]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          className={`pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium backdrop-blur-sm animate-toast-in ${TYPE_STYLES[t.type]}`}
        >
          <span className="text-base leading-none opacity-90">{TYPE_ICONS[t.type]}</span>
          <span>{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="ml-2 opacity-60 hover:opacity-100 transition-opacity text-xs leading-none"
            aria-label="dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
