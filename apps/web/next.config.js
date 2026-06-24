const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@f5/schemas', '@f5/core', '@f5/ui'],
  eslint: { ignoreDuringBuilds: true },
};

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? 'imobi-hl',
  // Interim: DSN key "f5-web" lives on project `javascript` until Owner creates `f5-web`
  project: process.env.SENTRY_PROJECT ?? 'javascript',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  // Sem tunnelRoute: /monitoring retornava 404 na Vercel e bloqueava envio.
  // CSP já permite connect-src para *.sentry.io e *.ingest.us.sentry.io.
  silent: !process.env.CI,
  disableLogger: true,
});
