'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/lib/auth';
import { useAuth } from '@/lib/auth-context';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      const message = searchParams.get('message') || '认证失败';
      setError(message);
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      refreshUser().then(() => {
        router.push('/profile');
      });
    } else {
      setError('缺少认证令牌');
      setTimeout(() => router.push('/login'), 3000);
    }
  }, [searchParams, router, refreshUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">登录失败</h1>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              正在跳转到登录页...
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            如持续出现问题，请联系客服或尝试其他登录方式
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#0066FF] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">正在登录...</h1>
          <p className="text-gray-500 text-sm">正在验证您的身份，请稍候</p>
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            <div className="w-2 h-2 rounded-full bg-[#0066FF] animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-[#0066FF] animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-[#0066FF] animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Joinus.com · 安全登录
        </p>
      </div>
    </div>
  );
}
