'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n';
import SocialLoginButtons from '@/components/SocialLoginButtons';
import MobileNav from '@/components/MobileNav';

const STEP_ICONS = ['📱', '🔐', '🎉'] as const;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-400'];
  const strengthLabels = ['', t('register.strengthWeak'), t('register.strengthMedium'), t('register.strengthStrong')];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) { setError(t('auth.phoneRequired')); return; }
    if (!nickname.trim()) { setError(t('auth.nicknameRequired')); return; }
    if (password.length < 6) { setError(t('auth.passwordMinLength')); return; }
    if (password !== confirmPassword) { setError(t('auth.passwordMismatch')); return; }

    setLoading(true);
    try {
      await register({ phone: phone.trim(), nickname: nickname.trim(), password });
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { icon: STEP_ICONS[0], title: t('register.step1'), desc: t('register.step1Desc') },
    { icon: STEP_ICONS[1], title: t('register.step2'), desc: t('register.step2Desc') },
    { icon: STEP_ICONS[2], title: t('register.step3'), desc: t('register.step3Desc') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl flex rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden">
          {/* Left: Benefits Panel (desktop only) */}
          <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-[#0066FF] to-[#0044CC] p-10 flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-10 w-32 h-32 rounded-full border-2 border-white/30" />
              <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border border-white/20" />
            </div>

            <div className="relative">
              <div className="text-3xl mb-3">🌍</div>
              <h2 className="text-2xl font-serif font-bold mb-2">{t('register.welcomeTitle')}</h2>
              <p className="text-white/70 text-sm leading-relaxed">{t('register.welcomeDesc')}</p>
            </div>

            <div className="relative space-y-5 my-8">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm shrink-0">{s.icon}</div>
                  <div>
                    <p className="font-medium text-sm">{s.title}</p>
                    <p className="text-white/60 text-xs">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative flex items-center gap-4 text-xs text-white/50">
              <span>{t('login.trustSecure')}</span>
              <span>·</span>
              <span>{t('login.trustFree')}</span>
              <span>·</span>
              <span>{t('register.instantAccess')}</span>
            </div>
          </div>

          {/* Right: Register Form */}
          <div className="flex-1 p-8 sm:p-10">
            <div className="max-w-sm mx-auto">
              <div className="text-center mb-6">
                <div className="lg:hidden text-3xl mb-2">🌍</div>
                <h1 className="text-2xl font-serif font-bold text-[#0066FF]">
                  {t('auth.register')}
                </h1>
                <p className="text-gray-500 text-sm mt-1">{t('auth.registerSubtitle')}</p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.phone')}
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('auth.phonePlaceholder')} autoComplete="tel"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 transition-all text-sm" />
                  </div>
                </div>

                {/* Nickname */}
                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.nickname')}
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <input id="nickname" type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={t('auth.nicknamePlaceholder')} autoComplete="nickname"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 transition-all text-sm" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.passwordPlaceholder')} autoComplete="new-password"
                      className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 transition-all text-sm" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {showPassword ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l18 18" /> : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}
                      </svg>
                    </button>
                  </div>
                  {/* Password strength */}
                  {password.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <span className={`text-[10px] ${passwordStrength === 1 ? 'text-red-500' : passwordStrength === 2 ? 'text-yellow-600' : 'text-green-600'}`}>{strengthLabels[passwordStrength]}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.confirmPassword')}
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('auth.confirmPasswordPlaceholder')} autoComplete="new-password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 transition-all text-sm" />
                    {confirmPassword && password === confirmPassword && (
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                </div>

                {/* Agreement */}
                <div className="flex items-start gap-2">
                  <input id="agreement" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]/30" />
                  <label htmlFor="agreement" className="text-xs text-gray-500 leading-relaxed">
                    {t('auth.agreeTerms')}{' '}
                    <a href="/terms" target="_blank" className="text-[#0066FF] hover:underline">{t('auth.termsOfService')}</a>{' '}
                    {t('auth.and')}{' '}
                    <a href="/privacy" target="_blank" className="text-[#0066FF] hover:underline">{t('auth.privacyPolicy')}</a>
                  </label>
                </div>

                <button type="submit" disabled={loading || !agreed}
                  className="w-full py-2.5 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC] active:bg-[#0044AA] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 text-sm">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      {t('auth.registering')}
                    </span>
                  ) : t('auth.register')}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">{t('login.orContinueWith')}</span></div>
              </div>

              <SocialLoginButtons />

              <div className="mt-5 text-center">
                <p className="text-gray-500 text-sm">
                  {t('auth.hasAccount')}{' '}
                  <Link href="/login" className="text-[#0066FF] font-medium hover:text-[#0066FF]/80 transition-colors">{t('auth.loginNow')}</Link>
                </p>
              </div>

              {/* Mobile trust badges */}
              <div className="lg:hidden mt-5 flex items-center justify-center gap-4 text-[10px] text-gray-400">
                <span>{t('login.trustSecure')}</span>
                <span>·</span>
                <span>{t('login.trustFree')}</span>
                <span>·</span>
                <span>{t('register.instantAccess')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
