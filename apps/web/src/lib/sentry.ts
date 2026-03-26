/**
 * Sentry initialization for the Next.js web app.
 * Only initializes if NEXT_PUBLIC_SENTRY_DSN is set AND @sentry/nextjs is installed.
 * Zero build-time dependency — loads at runtime.
 */

let SentryModule: any = null;
let initAttempted = false;

async function loadSentry(): Promise<any> {
  if (SentryModule) return SentryModule;
  try {
    // Construct at runtime to avoid webpack static analysis
    const pkg = ['@sentry', 'nextjs'].join('/');
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const m = await new Function('p', 'return import(p)')(pkg);
    SentryModule = m;
    return m;
  } catch {
    return null;
  }
}

export function initSentry() {
  if (initAttempted) return;
  initAttempted = true;

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  loadSentry().then((Sentry) => {
    if (!Sentry) return;
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      sendDefaultPii: false,
      integrations: [],
    });
    console.log('[Sentry] Initialized for Web');
  });
}

export function captureException(
  error: Error,
  context?: Record<string, any>,
) {
  if (!SentryModule) {
    console.error('[Sentry unavailable]', error);
    return;
  }
  try {
    if (context) {
      SentryModule.withScope((scope: any) => {
        scope.setExtras(context);
        SentryModule.captureException(error);
      });
    } else {
      SentryModule.captureException(error);
    }
  } catch {
    // silent
  }
}
