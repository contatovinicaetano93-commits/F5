import * as Sentry from '@sentry/nextjs';
import { getBaseSentryOptions, getClientSentryDsn } from '@/lib/sentry/init-options';

const dsn = getClientSentryDsn();

if (dsn) {
  Sentry.init({
    ...getBaseSentryOptions(dsn),
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.replayIntegration()],
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
