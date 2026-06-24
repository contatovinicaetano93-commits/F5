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

export function onRouterTransitionStart(...args: unknown[]) {
  try {
    const capture = Sentry.captureRouterTransitionStart as
      | ((...a: unknown[]) => void)
      | undefined;
    capture?.(...args);
  } catch (error) {
    console.warn('Sentry router hook skipped:', error);
  }
}
