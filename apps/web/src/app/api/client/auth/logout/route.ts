import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/supabase-client';
import {
  clearClientPortalSessionCookie,
  isClientPortalAuthConfigured,
} from '@/lib/client-portal-auth';

export async function POST(_request: NextRequest) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  const response = NextResponse.json({ ok: true });

  if (isClientPortalAuthConfigured()) {
    clearClientPortalSessionCookie(response);
  }

  return response;
}
