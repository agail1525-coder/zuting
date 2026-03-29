"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "价格日历", href: "/prices/calendar", desc: "查看每日最优价，选择出行时机", icon: "📅" },
  { label: "比价面板", href: "/prices/compare", desc: "多套餐横向比较，一眼找最值", icon: "⚖️" },
  { label: "价格提醒", href: "/prices/alerts", desc: "设置目标价，降价第一时间通知", icon: "🔔" },
  { label: "价格趋势", href: "/prices/trend", desc: "历史走势一览，低点出手不犹豫", icon: "📈" },
];

export default function PricesPage() {
  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">价格工具</h1>
          <p className="text-gray-500 text-lg">
            对标 Skyscanner · Kayak · Expedia — 比价、提醒、日历、趋势一站掌握
          </p>
        </div>
      </section>

      {/* Tab Cards */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="group bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md hover:border-[#0066FF]/40 transition-all"
            >
              <div className="text-4xl mb-4">{tab.icon}</div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-2">
                {tab.label}
              </h2>
              <p className="text-gray-500 text-sm">{tab.desc}</p>
              <div className="mt-4 text-[#0066FF] text-sm font-medium flex items-center gap-1">
                立即查看
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick tips */}
        <div className="mt-12 bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-3">使用技巧</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2"><span className="text-blue-400">·</span>用 <strong>价格日历</strong> 找全月最低价出行日</li>
            <li className="flex gap-2"><span className="text-blue-400">·</span>用 <strong>比价面板</strong> 选 2-4 个套餐一键对比性价比</li>
            <li className="flex gap-2"><span className="text-blue-400">·</span>用 <strong>价格提醒</strong> 设置目标价，等价格降到心理价位再下单</li>
            <li className="flex gap-2"><span className="text-blue-400">·</span>用 <strong>价格趋势</strong> 分析历史走势，判断现在是否处于低位</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
