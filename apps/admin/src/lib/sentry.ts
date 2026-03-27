/**
 * Sentry initialization for the Admin dashboard (Vite + React).
 * Only initializes if VITE_SENTRY_DSN is set AND @sentry/react is installed.
 * Zero build-time dependency — loads at runtime via globalThis.
 */

interface SentryScope {
  setExtras(extras: Record<string, unknown>): void;
}

interface SentryLike {
  init(options: Record<string, unknown>): void;
  captureException(error: Error): void;
  withScope(callback: (scope: SentryScope) => void): void;
}

let SentryModule: SentryLike | null = null;

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  try {
    // Construct module name at runtime to prevent Vite static analysis
    const pkg = ['@sentry', 'react'].join('/');
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const loader = new Function('m', 'return import(m)');
    loader(pkg)
      .then((Sentry: SentryLike) => {
        SentryModule = Sentry;
        Sentry.init({
          dsn,
          environment: import.meta.env.MODE || 'development',
          tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        });
        console.log('[Sentry] Initialized for Admin');
      })
      .catch(() => {
        // @sentry/react not installed
      });
  } catch {
    // silent
  }
}

export function captureException(
  error: Error,
  context?: Record<string, unknown>,
) {
  if (!SentryModule) return;
  try {
    if (context) {
      SentryModule.withScope((scope: SentryScope) => {
        scope.setExtras(context);
        SentryModule!.captureException(error);
      });
    } else {
      SentryModule.captureException(error);
    }
  } catch {
    // silent
  }
}
