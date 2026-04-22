"use client";

import { useState } from "react";

interface QA {
  q: string;
  a: string;
}

const ITEMS: QA[] = [
  {
    q: "价格多久更新一次?",
    a: "三条 CRON 协同: 每小时整点扫描活跃告警,每日 04:10 对齐路线 & 套餐起价,每日 04:20 延展快照并清理 180 天以前老数据。生产数据库当前稳定持有 3003 条 baseline 快照 (33 路线 × 91 天)。",
  },
  {
    q: "baseline / crawler / official 三种数据源有什么区别?",
    a: "baseline (琥珀色) 是基于路线起价 + 季节权重 + 周末溢价 + 确定性噪声生成的参考价,用于在真实采集缺失时兜底。crawler (蓝色) 来自爬虫++ PRICE 域从官网/OTA 采集。official (翠绿色) 来自官方合作伙伴 API 实时推送。每个价格数字上方都挂有 PriceSourceBadge 标识当前来源。",
  },
  {
    q: "我设置的告警多久检测一次?",
    a: "每整点 (cron: 0 0 * * * *)。PriceAlertCronService 会扫描所有 isActive=true 且未触发的告警,对比对应实体的最新 baseline 快照。一旦当前价 ≤ 目标价,告警被标记 isTriggered=true,同时发送站内通知 (NotificationService)。触发幂等,不会重复推送。",
  },
  {
    q: "套餐价格和路线起价为什么有时不一致?",
    a: "路线 (Route) 的 priceFrom 是最低 tier 起步价,套餐 (DestinationPackage) 按四档 (尊贵 / 商务 / 标准 / 自助) 分层定价。每日 04:10 的 PriceReconcileService 会对比两者,当套餐 (非 LUXURY tier) 最低起价与路线 priceFrom 偏差超过 15% 时,自动写 PackagePriceAlert 供后台关注。",
  },
];

export default function PriceMethodology() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-6">
        <p className="text-[#F5D898] text-xs font-semibold tracking-[0.3em] uppercase mb-2">METHODOLOGY</p>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">数据方法论</h2>
        <p className="text-sm text-gray-500 mt-1.5">了解我们如何采集、对齐、透明地展示每一个价格数字</p>
      </div>
      <div className="space-y-2">
        {ITEMS.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : idx)}
                className="w-full px-5 py-4 flex items-start justify-between gap-3 text-left hover:bg-gray-50/50 transition-colors"
              >
                <span className="font-semibold text-gray-900 text-sm leading-relaxed">{item.q}</span>
                <svg className={`w-4 h-4 shrink-0 mt-1 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">{item.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
