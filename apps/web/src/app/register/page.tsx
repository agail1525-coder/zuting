'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import SocialLoginButtons from '@/components/SocialLoginButtons';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
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
      setError('请输入手机号');
      return;
    }
    if (!nickname.trim()) {
      setError('请输入昵称');
      return;
    }
    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await register({ phone: phone.trim(), nickname: nickname.trim(), password });
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试');
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
              祖庭旅行平台
            </h1>
            <p className="text-temple-400 text-sm mt-2">
              创建新账号
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
              <label htmlFor="phone" className="block text-sm text-temple-300 mb-1.5">
                手机号
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm text-temple-300 mb-1.5">
                昵称
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入昵称"
                className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-temple-300 mb-1.5">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（至少6位）"
                className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-temple-300 mb-1.5">
                确认密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            {/* Agreement checkbox */}
            <div className="flex items-start gap-2">
              <input
                id="agreement"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-temple-600/30 bg-temple-900/80 text-gold focus:ring-gold/30 accent-[#D4A855]"
              />
              <label htmlFor="agreement" className="text-sm text-temple-400 leading-relaxed">
                我已阅读并同意{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold/80 transition-colors underline">
                  用户协议
                </a>{' '}
                和{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold/80 transition-colors underline">
                  隐私政策
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full py-3 rounded-xl bg-gold/20 border border-gold/40 text-gold font-semibold hover:bg-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          {/* Social Login */}
          <SocialLoginButtons />

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-temple-400 text-sm">
              已有账号？{' '}
              <Link href="/login" className="text-gold hover:text-gold/80 transition-colors">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
