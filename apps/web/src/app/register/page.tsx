'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n';
import SocialLoginButtons from '@/components/SocialLoginButtons';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError(t('auth.phoneRequired'));
      return;
    }
    if (!nickname.trim()) {
      setError(t('auth.nicknameRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🏛</div>
            <h1 className="text-2xl font-serif font-bold text-[#0066FF]">
              {t('site.title')}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm text-gray-600 mb-1.5">
                {t('auth.phone')}
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('auth.phonePlaceholder')}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm text-gray-600 mb-1.5">
                {t('auth.nickname')}
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t('auth.nicknamePlaceholder')}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-600 mb-1.5">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-gray-600 mb-1.5">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
              />
            </div>

            {/* Agreement checkbox */}
            <div className="flex items-start gap-2">
              <input
                id="agreement"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-200 bg-gray-50 text-[#0066FF] focus:ring-[#0066FF] accent-[#0066FF]"
              />
              <label htmlFor="agreement" className="text-sm text-gray-500 leading-relaxed">
                {t('auth.agreeTerms')}{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#0066FF] hover:text-[#0066FF]/80 transition-colors underline">
                  {t('auth.termsOfService')}
                </a>{' '}
                {t('auth.and')}{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0066FF] hover:text-[#0066FF]/80 transition-colors underline">
                  {t('auth.privacyPolicy')}
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full py-3 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.registering') : t('auth.register')}
            </button>
          </form>

          {/* Social Login */}
          <SocialLoginButtons />

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {t('auth.hasAccount')}{' '}
              <Link href="/login" className="text-[#0066FF] hover:text-[#0066FF]/80 transition-colors">
                {t('auth.loginNow')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
