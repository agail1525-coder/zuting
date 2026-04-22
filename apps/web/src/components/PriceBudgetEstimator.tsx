"use client";

import Link from "next/link";
import { useState } from "react";
import { STYLE_MULTIPLIERS, DAILY_BASE_YUAN, type BudgetStyle } from "@zuting/config";

type Style = BudgetStyle;

interface Props {
  baseRoutePriceYuan?: number;
}

export default function PriceBudgetEstimator({ baseRoutePriceYuan = 2800 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(7);
  const [style, setStyle] = useState<Style>("comfort");

  const mul = STYLE_MULTIPLIERS[style];
  const routeFee = baseRoutePriceYuan * people;
  const hotel = Math.round(days * DAILY_BASE_YUAN.hotel * mul) * people;
  const meals = Math.round(days * DAILY_BASE_YUAN.meals * mul) * people;
  const transport = Math.round(days * DAILY_BASE_YUAN.transport * mul) * people;
  const misc = Math.round(days * DAILY_BASE_YUAN.misc * mul) * people;
  const total = routeFee + hotel + meals + transport + misc;
  const perPerson = Math.round(total / people);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 items-center justify-center">💰</span>
          <div className="text-left">
            <h3 className="font-bold text-gray-900 text-base">预算测算</h3>
            <p className="text-[11px] text-gray-400">人均参考价 (不含机票)</p>
          </div>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">人数</label>
              <div className="flex items-center gap-1">
                <button onClick={() => setPeople(Math.max(1, people - 1))} className="w-7 h-7 rounded border border-gray-200 hover:bg-gray-50 text-gray-500">−</button>
                <span className="flex-1 text-center text-sm font-bold text-gray-900">{people}</span>
                <button onClick={() => setPeople(Math.min(20, people + 1))} className="w-7 h-7 rounded border border-gray-200 hover:bg-gray-50 text-gray-500">+</button>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">天数</label>
              <div className="flex items-center gap-1">
                <button onClick={() => setDays(Math.max(1, days - 1))} className="w-7 h-7 rounded border border-gray-200 hover:bg-gray-50 text-gray-500">−</button>
                <span className="flex-1 text-center text-sm font-bold text-gray-900">{days}</span>
                <button onClick={() => setDays(Math.min(60, days + 1))} className="w-7 h-7 rounded border border-gray-200 hover:bg-gray-50 text-gray-500">+</button>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">风格</label>
              <select value={style} onChange={(e) => setStyle(e.target.value as Style)} className="w-full h-7 rounded border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-indigo-400">
                <option value="eco">经济</option>
                <option value="comfort">舒适</option>
                <option value="lux">豪华</option>
              </select>
            </div>
          </div>

          <div className="bg-indigo-50/50 rounded-xl p-3">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[11px] text-indigo-700 font-semibold">人均</span>
              <span className="text-2xl font-black text-indigo-700">¥{perPerson.toLocaleString()}</span>
            </div>
            <div className="text-[11px] text-gray-500 space-y-0.5 mt-2 pt-2 border-t border-indigo-100">
              <div className="flex justify-between"><span>路线费</span><span>¥{routeFee.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>住宿</span><span>¥{hotel.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>餐饮</span><span>¥{meals.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>交通</span><span>¥{transport.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>杂费</span><span>¥{misc.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-indigo-700 pt-1 border-t border-indigo-100 mt-1"><span>总计</span><span>¥{total.toLocaleString()}</span></div>
            </div>
          </div>

          <Link href="/trips/create" className="block w-full text-center px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors">
            创建行程
          </Link>

          <p className="text-[10px] text-gray-400 leading-relaxed">
            参考值 · 基于常见酒店/餐饮/交通均价估算,不含机票。实际价格以下单时配套为准。
          </p>
        </div>
      )}
    </section>
  );
}
