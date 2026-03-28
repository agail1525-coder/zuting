'use client';

import { useState, useEffect } from 'react';
import { API_BASE, fetchAuthProviders, type OAuthProviders } from '@/lib/api';

export default function SocialLoginButtons() {
  const [providers, setProviders] = useState<OAuthProviders | null>(null);

  useEffect(() => {
    fetchAuthProviders()
      .then((data) => setProviders(data))
      .catch(() => setProviders({ wechat: false, google: false }));
  }, []);

  // Hide entirely if no providers configured or still loading
  if (!providers || (!providers.wechat && !providers.google)) {
    return null;
  }

  const handleWechat = () => {
    window.location.href = `${API_BASE}/api/auth/wechat`;
  };

  const handleGoogle = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <div className="mt-6">
      {/* Divider */}
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-400">
            or continue with
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        {providers.wechat && (
          <button
            type="button"
            onClick={handleWechat}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[#07C160]/30 bg-[#07C160]/10 text-[#07C160] font-medium hover:bg-[#07C160]/20 transition-colors"
          >
            {/* WeChat icon (simplified SVG) */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05a6.127 6.127 0 0 1-.233-1.68c0-3.558 3.185-6.449 7.112-6.449.369 0 .726.034 1.079.08-.89-3.558-4.67-6.583-9.267-6.583zM5.785 7.136a.98.98 0 1 1 0-1.96.98.98 0 0 1 0 1.96zm5.812 0a.98.98 0 1 1 0-1.96.98.98 0 0 1 0 1.96zm5.34 2.422c-3.404 0-6.162 2.44-6.162 5.45 0 3.009 2.758 5.448 6.162 5.448.682 0 1.34-.1 1.961-.281a.71.71 0 0 1 .584.081l1.324.774a.26.26 0 0 0 .135.044.237.237 0 0 0 .236-.236c0-.058-.024-.116-.038-.174l-.268-1.024a.479.479 0 0 1 .173-.54c1.498-1.11 2.455-2.747 2.455-4.542 0-3.01-2.758-5.45-6.162-5.45h-.4zm-2.437 3.603a.794.794 0 1 1 0-1.587.794.794 0 0 1 0 1.587zm4.835 0a.794.794 0 1 1 0-1.587.794.794 0 0 1 0 1.587z" />
            </svg>
            WeChat Login
          </button>
        )}

        {providers.google && (
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[#4285F4]/30 bg-[#4285F4]/10 text-[#4285F4] font-medium hover:bg-[#4285F4]/20 transition-colors"
          >
            {/* Google icon (simplified SVG) */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google Login
          </button>
        )}
      </div>
    </div>
  );
}
