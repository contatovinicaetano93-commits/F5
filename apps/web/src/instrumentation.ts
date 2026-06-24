import * as Sentry from '@sentry/nextjs';
import { isServerSentryEnabled } from '@/lib/sentry/init-options';

export async function register() {
  if (!isServerSentryEnabled()) return;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = isServerSentryEnabled()
  ? Sentry.captureRequestError
  : undefined;
