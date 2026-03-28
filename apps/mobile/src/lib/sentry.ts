/**
 * Sentry initialization for the React Native / Expo mobile app.
 * Only initializes if SENTRY_DSN_MOBILE is configured in app.json extra.
 *
 * Usage:
 *   import { initSentry, wrap } from '@/lib/sentry';
 *   initSentry();
 *   export default wrap(App);
 */

import Constants from 'expo-constants';

interface SentryScope {
  setExtras(extras: Record<string, unknown>): void;
  setExtra(key: string, value: unknown): void;
  setTag(key: string, value: string): void;
}

interface SentryModule {
  init(options: Record<string, unknown>): void;
  captureException(error: unknown): void;
  withScope(callback: (scope: SentryScope) => void): void;
  wrap<T>(component: T): T;
}

let Sentry: SentryModule | null = null;
let initialized = false;

function getDsn(): string | undefined {
  return Constants.expoConfig?.extra?.SENTRY_DSN_MOBILE;
}

export function initSentry() {
  if (initialized) return;
  initialized = true;

  const dsn = getDsn();
  if (!dsn) return;

  try {
    const mod: SentryModule = require('@sentry/react-native');

    mod.init({
      dsn,
      environment: __DEV__ ? 'development' : 'production',
      release: `zuting-mobile@${Constants.expoConfig?.version || '0.0.0'}`,

      // Performance monitoring
      tracesSampleRate: __DEV__ ? 1.0 : 0.1,

      // Don't send PII by default
      sendDefaultPii: false,

      // Enable native crash reporting
      enableNative: true,
      enableNativeCrashHandling: true,
    });

    Sentry = mod;
    console.log('[Sentry] Initialized for Mobile');
  } catch {
    // @sentry/react-native not installed
  }
}

/**
 * Wrap root component with Sentry.wrap() for automatic
 * error boundary and performance tracking.
 * Falls back to identity function if Sentry is not available.
 */
export function wrap<T>(component: T): T {
  if (Sentry?.wrap) {
    return Sentry.wrap(component);
  }
  return component;
}

/**
 * Capture an exception and send it to Sentry.
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
) {
  if (!Sentry) {
    console.error('[Sentry unavailable]', error);
    return;
  }

  const s = Sentry;
  if (context) {
    s.withScope((scope: SentryScope) => {
      scope.setExtras(context);
      s.captureException(error);
    });
  } else {
    s.captureException(error);
  }
}
