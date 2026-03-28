'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n';
import SocialLoginButtons from '@/components/SocialLoginButtons';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for OAuth error in URL params
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const oauthError = searchParams?.get('error');
  const oauthMessage = searchParams?.get('message');

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
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'));
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
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Error */}
          {(error || oauthError) && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error || oauthMessage || t('auth.oauthFailed')}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>

          {/* Social Login */}
          <SocialLoginButtons />

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {t('auth.noAccount')}{' '}
              <Link href="/register" className="text-[#0066FF] hover:text-[#0066FF]/80 transition-colors">
                {t('auth.registerNow')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
