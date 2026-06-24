/** Indica deploy de produção (Vercel ou NODE_ENV=production). */
export function isProductionDeploy(): boolean {
  return (
    process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  );
}
