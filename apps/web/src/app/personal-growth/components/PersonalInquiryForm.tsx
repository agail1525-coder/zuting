"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/api/personal-growth";

export default function PersonalInquiryForm({
  defaultThemeId,
}: {
  defaultThemeId?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    contactName: "",
    contactRole: "",
    phone: "",
    email: "",
    preferredAt: "",
    message: "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!form.contactName.trim() || !form.phone.trim()) {
      setError("请填写姓名和电话");
      return;
    }
    if (!/^\+?\d{6,20}$/.test(form.phone.trim())) {
      setError("电话号码格式不正确");
      return;
    }
    setSubmitting(true);
    try {
      await submitInquiry({
        themeId: defaultThemeId,
        contactName: form.contactName.trim(),
        contactRole: form.contactRole.trim() || undefined,
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        preferredAt: form.preferredAt || undefined,
        message: form.message.trim() || undefined,
        source: typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="p-10 rounded-2xl bg-amber-50 border border-amber-200 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8B6914] text-white text-3xl flex items-center justify-center">
          ✓
        </div>
        <h3 className="text-2xl font-bold mb-2 text-gray-900">已收到您的咨询</h3>
        <p className="text-gray-600">我们的成长顾问将在 24 小时内联系您。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="姓名 *">
          <input
            value={form.contactName}
            onChange={(e) => set("contactName", e.target.value)}
            className={inputCls}
            maxLength={50}
            required
          />
        </Field>
        <Field label="当前角色">
          <input
            value={form.contactRole}
            onChange={(e) => set("contactRole", e.target.value)}
            className={inputCls}
            maxLength={80}
            placeholder="CEO / 创始人 / 高管 / ..."
          />
        </Field>
        <Field label="电话 *">
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputCls}
            maxLength={20}
            required
          />
        </Field>
        <Field label="邮箱">
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputCls}
            maxLength={120}
          />
        </Field>
        <Field label="期望出行日期">
          <input
            type="date"
            value={form.preferredAt}
            onChange={(e) => set("preferredAt", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="您当前最大的挑战">
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${inputCls} resize-none`}
          maxLength={2000}
          placeholder="事业瓶颈、决策困惑、身心失衡、意义迷失……任何您想分享的"
        />
      </Field>
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 bg-[#8B6914] text-white font-bold rounded-lg hover:bg-[#A67C1E] transition shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "提交中..." : "预约个人咨询"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#8B6914] focus:ring-2 focus:ring-amber-200/50 focus:outline-none transition";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-700 font-medium mb-2">{label}</span>
      {children}
    </label>
  );
}
