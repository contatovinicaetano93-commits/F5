/** Shared Sentry init — org imobi-hl, project f5-web (separado do imobi). */

export function getSentryEnvironment(): string {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';
}

export function getServerSentryDsn(): string | undefined {
  return process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
}

export function getClientSentryDsn(): string | undefined {
  return process.env.NEXT_PUBLIC_SENTRY_DSN;
}

export function isServerSentryEnabled(): boolean {
  return Boolean(getServerSentryDsn());
}

export function isClientSentryEnabled(): boolean {
  return Boolean(getClientSentryDsn());
}

export const SENTRY_ORG = 'imobi-hl';
export const SENTRY_PROJECT = 'f5-web';

export function getBaseSentryOptions(dsn: string) {
  return {
    dsn,
    environment: getSentryEnvironment(),
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
    enableLogs: true,
    initialScope: {
      tags: {
        service: 'f5-web',
        app: 'f5-industria-digital',
      },
    },
  };
}
