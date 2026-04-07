"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/api/team-culture";

export default function TeamInquiryForm({
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
    orgName: "",
    headcount: 30,
    budget: undefined as number | undefined,
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
    if (!form.contactName.trim() || !form.phone.trim() || !form.orgName.trim()) {
      setError("请填写姓名、电话、组织名称");
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
        orgName: form.orgName.trim(),
        headcount: Number(form.headcount),
        budget: form.budget ? Number(form.budget) * 100 : undefined,
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
      <div className="p-10 rounded-2xl bg-[#D4A855]/10 border border-[#D4A855]/40 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h3 className="text-2xl font-bold mb-2 text-white">已收到您的需求</h3>
        <p className="text-white/70">
          我们的文化顾问将在 48 小时内联系您。
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 rounded-2xl bg-white/5 border border-white/10 space-y-5"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="联系人 *">
          <input
            value={form.contactName}
            onChange={(e) => set("contactName", e.target.value)}
            className={inputCls}
            maxLength={50}
            required
          />
        </Field>
        <Field label="职务">
          <input
            value={form.contactRole}
            onChange={(e) => set("contactRole", e.target.value)}
            className={inputCls}
            maxLength={50}
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
        <Field label="组织名称 *">
          <input
            value={form.orgName}
            onChange={(e) => set("orgName", e.target.value)}
            className={inputCls}
            maxLength={120}
            required
          />
        </Field>
        <Field label="团队人数 *">
          <input
            type="number"
            min={1}
            max={10000}
            value={form.headcount}
            onChange={(e) => set("headcount", Number(e.target.value))}
            className={inputCls}
            required
          />
        </Field>
        <Field label="预算 (元/总额)">
          <input
            type="number"
            min={0}
            value={form.budget ?? ""}
            onChange={(e) =>
              set("budget", e.target.value ? Number(e.target.value) : undefined)
            }
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
      <Field label="留言">
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${inputCls} resize-none`}
          maxLength={2000}
          placeholder="您的诉求、文化主题偏好、其他备注..."
        />
      </Field>
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 bg-[#D4A855] text-[#0f172a] font-bold rounded-lg hover:bg-[#E5B968] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "提交中..." : "提交需求"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-white/10 text-white focus:border-[#D4A855] focus:outline-none transition";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-white/70 mb-2">{label}</span>
      {children}
    </label>
  );
}
