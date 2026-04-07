import { useState, useEffect } from "react";
import { onToast, type ToastEvent } from "@/lib/toast";

const TYPE_STYLES: Record<string, string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-blue-600",
  warning: "bg-amber-500",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    return onToast((event) => {
      setToasts((prev) => [...prev, event]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== event.id));
      }, event.duration);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-12 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${TYPE_STYLES[t.type] || "bg-gray-700"} text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-fade-in pointer-events-auto`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
