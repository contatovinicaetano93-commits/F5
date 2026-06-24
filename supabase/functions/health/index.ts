import { withSupabase } from '@supabase/server';

/**
 * Supabase Edge Function example — health check (no auth).
 * Deploy with: supabase functions deploy health
 *
 * For auth: 'publishable' | 'secret' | 'none', set in supabase/config.toml:
 *   [functions.health]
 *   verify_jwt = false
 */
export default {
  fetch: withSupabase({ auth: 'none' }, async () => {
    return Response.json({
      ok: true,
      service: 'f5',
      time: new Date().toISOString(),
    });
  }),
};
