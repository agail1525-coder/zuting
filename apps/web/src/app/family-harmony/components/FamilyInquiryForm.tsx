"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/api/family-harmony";

export default function FamilyInquiryForm({
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
    headcount: 4,
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
        headcount: Number(form.headcount),
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
      <div className="p-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2D8B6F] text-white text-3xl flex items-center justify-center">
          ✓
        </div>
        <h3 className="text-2xl font-bold mb-2 text-gray-900">已收到您的咨询</h3>
        <p className="text-gray-600">我们的家庭顾问将在 24 小时内联系您。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="联系人姓名 *">
          <input
            value={form.contactName}
            onChange={(e) => set("contactName", e.target.value)}
            className={inputCls}
            maxLength={50}
            required
          />
        </Field>
        <Field label="家庭角色">
          <input
            value={form.contactRole}
            onChange={(e) => set("contactRole", e.target.value)}
            className={inputCls}
            maxLength={80}
            placeholder="父亲 / 母亲 / 子女 / ..."
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
        <Field label="家庭参与人数">
          <input
            type="number"
            min={1}
            max={20}
            value={form.headcount}
            onChange={(e) => set("headcount", Number(e.target.value))}
            className={inputCls}
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
      <Field label="家庭情况 / 想要改善的方面">
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${inputCls} resize-none`}
          maxLength={2000}
          placeholder="夫妻沟通、亲子关系、代际冲突、家族传承……任何您想分享的"
        />
      </Field>
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 bg-[#2D8B6F] text-white font-bold rounded-lg hover:bg-[#247259] transition shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "提交中..." : "预约家庭咨询"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#2D8B6F] focus:ring-2 focus:ring-emerald-100 focus:outline-none transition";

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
