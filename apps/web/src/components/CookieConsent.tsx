'use client';

import { useState, useEffect } from 'react';

const CONSENT_KEY = 'joinus_cookie_consent';

type ConsentValue = 'all' | 'necessary' | null;

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentValue>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'all' || stored === 'necessary') {
      setConsent(stored);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(CONSENT_KEY, 'all');
    setConsent('all');
  };

  const handleNecessaryOnly = () => {
    localStorage.setItem(CONSENT_KEY, 'necessary');
    setConsent('necessary');
  };

  // Don't render during SSR or if consent already given
  if (!mounted || consent !== null) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur-sm sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm leading-relaxed text-gray-600">
          We use cookies to enhance your experience. Essential cookies are
          required for the site to function. Optional cookies help us improve
          our services.{' '}
          <span className="text-gray-500">
            我们使用Cookie来提升您的体验。必要Cookie用于网站正常运行，可选Cookie帮助我们改进服务。
          </span>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleNecessaryOnly}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
          >
            Necessary Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="rounded-lg bg-[#0066FF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0052CC]"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
