import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

type Mode = "login" | "register";

export default function Login() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(phone, password);
      } else {
        await register({ phone, password, nickname });
      }
      nav("/profile", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header area */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-6 pt-16 pb-10 text-center">
        <h1 className="text-white text-2xl font-bold">JOINUS</h1>
        <p className="text-white/70 text-sm mt-1">{t("site.subtitle")}</p>
      </div>

      {/* Form card */}
      <div className="px-5 -mt-5">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6">
          {/* Mode toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                  mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                {t(m === "login" ? "auth.login" : "auth.register")}
              </button>
            ))}
          </div>

          {mode === "register" && (
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1.5">{t("auth.nickname")}</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1.5">{t("auth.phone")}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1.5">{t("auth.password")}</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading
              ? "..."
              : t(mode === "login" ? "auth.loginSubmit" : "auth.registerSubmit")}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
            <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-[var(--color-primary)]">
              {t(mode === "login" ? "auth.register" : "auth.login")}
            </button>
          </p>

          <p className="text-center text-[10px] text-gray-300 mt-4">
            {t("auth.agreeTerms")} <Link to="/terms" className="underline">{t("auth.termsOfService")}</Link> &amp; <Link to="/privacy" className="underline">{t("auth.privacyPolicy")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
