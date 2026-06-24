import * as Sentry from '@sentry/nextjs';
import { getBaseSentryOptions, getClientSentryDsn } from '@/lib/sentry/init-options';

const dsn = getClientSentryDsn();

if (dsn) {
  try {
    Sentry.init({
      ...getBaseSentryOptions(dsn),
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
