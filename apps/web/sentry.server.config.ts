import * as Sentry from '@sentry/nextjs';
import { getBaseSentryOptions, getServerSentryDsn } from '@/lib/sentry/init-options';

const dsn = getServerSentryDsn();

if (dsn) {
  Sentry.init({
    ...getBaseSentryOptions(dsn),
    includeLocalVariables: true,
  });
}
