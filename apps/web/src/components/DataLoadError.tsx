"use client";

import { useRouter } from "next/navigation";

interface DataLoadErrorProps {
  message?: string;
}

export default function DataLoadError({
  message = "数据加载失败，请稍后刷新重试",
}: DataLoadErrorProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="text-5xl mb-4">⚠</div>
      <p className="text-gray-600 text-lg mb-6 text-center">{message}</p>
      <button
        onClick={() => router.refresh()}
        className="px-6 py-2.5 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg transition-colors font-medium"
      >
        重新加载 / Reload
      </button>
    </div>
  );
}
