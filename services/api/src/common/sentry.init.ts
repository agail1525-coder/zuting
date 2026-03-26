/**
 * Sentry initialization for the NestJS API.
 * Must be called BEFORE NestFactory.create() in main.ts.
 *
 * Only initializes if SENTRY_DSN_API is set.
 */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN_API;
  if (!dsn) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/node');

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      release: `zuting-api@${process.env.npm_package_version || '0.0.0'}`,

      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Don't send PII by default
      sendDefaultPii: false,

      // Ignore common non-errors
      ignoreErrors: [
        'ECONNRESET',
        'ECONNREFUSED',
        'ETIMEDOUT',
      ],
    });

    console.log('[Sentry] Initialized for API');
  } catch {
    console.warn('[Sentry] @sentry/node not installed — skipping');
  }
}
