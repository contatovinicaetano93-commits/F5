/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@f5/schemas', '@f5/core', '@f5/ui'],
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
