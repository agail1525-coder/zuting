"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { registerMerchant } from "@/lib/api";

const MERCHANT_TYPES = ["TEMPLE", "GUIDE", "ACCOMMODATION", "TRANSPORT"] as const;

export default function MerchantRegisterPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    type: "TEMPLE",
    name: "",
    description: "",
    contactPhone: "",
    contactEmail: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError(t("merchant.nameRequired") || "Name is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await registerMerchant({
        type: form.type,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        contactEmail: form.contactEmail.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : (t("common.error") || "Registration failed")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full mx-4 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t("common.loginRequired") || "Login Required"}</h2>
          <p className="text-gray-500 mb-6">{t("merchant.loginHint") || "Please login to register as a merchant"}</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-[#0066FF] text-white font-semibold rounded-lg hover:bg-[#0052CC] transition-colors"
          >
            {t("nav.login")}
          </Link>
        </div>
      </main>
    );
  }

  // Loading auth
  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-lg">Loading...</div>
      </main>
    );
  }

  // Success
  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full mx-4 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t("merchant.registerSuccess") || "Registration Submitted!"}</h2>
          <p className="text-gray-500 mb-6">{t("merchant.registerSuccessHint") || "Your application is under review. We will get back to you soon."}</p>
          <Link
            href="/merchants"
            className="inline-block px-6 py-3 bg-[#0066FF] text-white font-semibold rounded-lg hover:bg-[#0052CC] transition-colors"
          >
            {t("merchant.title")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">{t("merchant.register")}</h1>
          <p className="text-blue-100">{t("merchant.registerHint") || "Join our platform and reach spiritual travelers worldwide"}</p>
        </div>
      </section>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8 -mt-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("merchant.typeLabel") || "Business Type"} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MERCHANT_TYPES.map((mt) => (
                <button
                  key={mt}
                  type="button"
                  onClick={() => handleChange("type", mt)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border transition-colors ${
                    form.type === mt
                      ? "border-[#0066FF] bg-blue-50 text-[#0066FF]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {t(`merchant.type.${mt}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("merchant.nameLabel") || "Business Name"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0066FF] focus:border-transparent outline-none transition-shadow"
              placeholder={t("merchant.namePlaceholder") || "Enter your business name"}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("common.description") || "Description"}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0066FF] focus:border-transparent outline-none transition-shadow resize-none"
              placeholder={t("merchant.descPlaceholder") || "Describe your business..."}
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("merchant.phone") || "Phone"}
              </label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0066FF] focus:border-transparent outline-none transition-shadow"
                placeholder="+86 ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("merchant.email") || "Email"}
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0066FF] focus:border-transparent outline-none transition-shadow"
                placeholder="contact@example.com"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("merchant.address") || "Address"}
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0066FF] focus:border-transparent outline-none transition-shadow"
              placeholder={t("merchant.addressPlaceholder") || "Enter your business address"}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#0066FF] text-white font-semibold rounded-lg hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (t("common.submitting") || "Submitting...") : (t("merchant.submitBtn") || "Submit Application")}
          </button>

          <p className="text-center text-gray-400 text-xs">
            {t("merchant.registerDisclaimer") || "By submitting, you agree to our terms and conditions."}
          </p>
        </form>
      </div>
    </main>
  );
}
