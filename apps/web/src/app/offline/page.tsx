"use client";

import Link from "next/link";
import MobileNav from "@/components/MobileNav";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="max-w-lg w-full">
          {/* Main Card */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 text-center">
            {/* Illustration */}
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414 1 1 0 01-1.414-1.414z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">网络连接已断开</h1>
            <p className="text-gray-500 mb-6">
              请检查您的网络连接后重试。部分已缓存的内容仍可浏览。
            </p>

            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-[#0066FF] text-white rounded-xl font-bold hover:bg-[#0052CC] transition-colors mb-3"
            >
              重试连接
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              返回上一页
            </button>
          </div>

          {/* Quick Links */}
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">离线可用功能</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "已缓存页面", href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                { label: "我的收藏", href: "/collections", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
                { label: "我的行程", href: "/trips", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
                { label: "个人中心", href: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4.5 h-4.5 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              如果问题持续存在，请尝试清除浏览器缓存或联系客服
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Joinus.com · 全球祖庭文化旅行平台
            </p>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
