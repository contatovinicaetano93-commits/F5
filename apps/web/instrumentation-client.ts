import * as Sentry from '@sentry/nextjs';
import { getBaseSentryOptions, getClientSentryDsn } from '@/lib/sentry/init-options';

const dsn = getClientSentryDsn();

if (dsn) {
  try {
    const integrations: ReturnType<typeof Sentry.replayIntegration>[] = [];
    try {
      integrations.push(Sentry.replayIntegration());
    } catch {
      // Replay opcional — evita crash se indisponível no browser.
    }

    Sentry.init({
      ...getBaseSentryOptions(dsn),
      replaysSessionSampleRate: 0.05,
      replaysOnErrorSampleRate: 1.0,
      ...(integrations.length > 0 ? { integrations } : {}),
    });
  } catch (error) {
    console.warn('Sentry client init skipped:', error);
  }
}

export const onRouterTransitionStart =
  Sentry.captureRouterTransitionStart ??
  (() => {
    /* noop */
  });
