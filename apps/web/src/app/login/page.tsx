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
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🏛</div>
            <h1 className="text-2xl font-serif font-bold text-gradient-gold">
              {t('site.title')}
            </h1>
            <p className="text-temple-400 text-sm mt-2">
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
              <label htmlFor="phone" className="block text-sm text-temple-300 mb-1.5">
                {t('auth.phone')}
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('auth.phonePlaceholder')}
                className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-temple-300 mb-1.5">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gold/20 border border-gold/40 text-gold font-semibold hover:bg-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>

          {/* Social Login */}
          <SocialLoginButtons />

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-temple-400 text-sm">
              {t('auth.noAccount')}{' '}
              <Link href="/register" className="text-gold hover:text-gold/80 transition-colors">
                {t('auth.registerNow')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
