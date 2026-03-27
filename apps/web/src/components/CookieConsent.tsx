'use client';

import { useState, useEffect } from 'react';

const CONSENT_KEY = 'zuting_cookie_consent';

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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-yellow-700/30 bg-[#0f172a]/95 px-4 py-4 backdrop-blur-sm sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm leading-relaxed text-slate-300">
          We use cookies to enhance your experience. Essential cookies are
          required for the site to function. Optional cookies help us improve
          our services.{' '}
          <span className="text-slate-400">
            我们使用Cookie来提升您的体验。必要Cookie用于网站正常运行，可选Cookie帮助我们改进服务。
          </span>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleNecessaryOnly}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
          >
            Necessary Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="rounded-lg bg-[#D4A855] px-4 py-2 text-sm font-medium text-[#0f172a] transition-colors hover:bg-[#c49a4a]"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
