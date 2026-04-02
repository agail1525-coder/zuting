'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import SocialLoginButtons from '@/components/SocialLoginButtons';
import MobileNav from '@/components/MobileNav';

const BENEFIT_ICONS = ['🗺️', '🏛️', '🤖', '📖'] as const;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const oauthError = searchParams?.get('error');
  const oauthMessage = searchParams?.get('message');
  const redirect = searchParams?.get('redirect');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError(t('auth.phoneRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      await login(phone.trim(), password);
      toast.success(t('auth.loginSuccess') || '登录成功');
      router.push(redirect || '/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: BENEFIT_ICONS[0], title: t('login.benefit1Title'), desc: t('login.benefit1Desc') },
    { icon: BENEFIT_ICONS[1], title: t('login.benefit2Title'), desc: t('login.benefit2Desc') },
    { icon: BENEFIT_ICONS[2], title: t('login.benefit3Title'), desc: t('login.benefit3Desc') },
    { icon: BENEFIT_ICONS[3], title: t('login.benefit4Title'), desc: t('login.benefit4Desc') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl flex rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden">
          {/* Left: Benefits Panel (desktop only) */}
          <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#0066FF] to-[#0044CC] p-10 flex-col justify-between text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-40 h-40 rounded-full border-2 border-white/30" />
              <div className="absolute bottom-20 left-5 w-24 h-24 rounded-full border-2 border-white/20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full border border-white/10" />
            </div>

            <div className="relative">
              <div className="text-3xl mb-3">🏛</div>
              <h2 className="text-2xl font-serif font-bold mb-2">{t('login.welcomeTitle')}</h2>
              <p className="text-white/70 text-sm leading-relaxed">{t('login.welcomeDesc')}</p>
            </div>

            <div className="relative space-y-4 my-8">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{b.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{b.title}</p>
                    <p className="text-white/60 text-xs">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="flex items-center gap-4 text-xs text-white/50">
                <span>{t('login.trustUsers')}</span>
                <span>·</span>
                <span>{t('login.trustSecure')}</span>
                <span>·</span>
                <span>{t('login.trustFree')}</span>
              </div>
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="flex-1 p-8 sm:p-10">
            <div className="max-w-sm mx-auto">
              {/* Mobile title */}
              <div className="text-center mb-8">
                <div className="lg:hidden text-3xl mb-2">🏛</div>
                <h1 className="text-2xl font-serif font-bold text-[#0066FF]">
                  {t('auth.login')}
                </h1>
                <p className="text-gray-500 text-sm mt-1.5">
                  {t('auth.loginSubtitle')}
                </p>
              </div>

              {/* Error */}
              {(error || oauthError) && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  <span>{error || oauthMessage || t('auth.oauthFailed')}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('auth.phone')}
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('auth.phonePlaceholder')}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      {t('auth.password')}
                    </label>
                  </div>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.11 6.11m7.768 7.768l3.768 3.768M3 3l3.111 3.111m0 0A9.935 9.935 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]/30"
                    />
                    <span className="text-sm text-gray-600">{t('login.rememberMe')}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC] active:bg-[#0044AA] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      {t('auth.loggingIn')}
                    </span>
                  ) : t('auth.login')}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">{t('login.orContinueWith')}</span></div>
              </div>

              {/* Social Login */}
              <SocialLoginButtons />

              {/* Register link */}
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  {t('auth.noAccount')}{' '}
                  <Link href="/register" className="text-[#0066FF] font-medium hover:text-[#0066FF]/80 transition-colors">
                    {t('auth.registerNow')}
                  </Link>
                </p>
              </div>

              {/* Mobile trust badges */}
              <div className="lg:hidden mt-6 flex items-center justify-center gap-4 text-[10px] text-gray-400">
                <span>{t('login.trustUsers')}</span>
                <span>·</span>
                <span>{t('login.trustSecure')}</span>
                <span>·</span>
                <span>{t('login.trustFree')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
