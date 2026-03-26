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
      const message = searchParams.get('message') || 'Authentication failed';
      setError(message);
      // Redirect to login after showing error
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      refreshUser().then(() => {
        router.push('/profile');
      });
    } else {
      setError('Missing authentication tokens');
      setTimeout(() => router.push('/login'), 3000);
    }
  }, [searchParams, router, refreshUser]);

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
            <div className="text-4xl mb-4">&#x26A0;&#xFE0F;</div>
            <h1 className="text-xl font-serif text-red-400 mb-2">Login Failed</h1>
            <p className="text-temple-400 text-sm">{error}</p>
            <p className="text-temple-500 text-xs mt-4">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          <div className="text-4xl mb-4 animate-pulse">&#x1F3DB;</div>
          <h1 className="text-xl font-serif text-gradient-gold mb-2">Logging in...</h1>
          <p className="text-temple-400 text-sm">Processing authentication</p>
        </div>
      </div>
    </div>
  );
}
