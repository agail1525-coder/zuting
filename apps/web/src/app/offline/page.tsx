"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">您当前处于离线状态</h1>
        <p className="text-gray-500 mb-6">请检查网络连接后重试。部分已缓存的内容仍可浏览。</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[#0066FF] text-white rounded-lg font-medium hover:bg-[#0052CC] transition-colors"
        >
          重试连接
        </button>
      </div>
    </div>
  );
}
