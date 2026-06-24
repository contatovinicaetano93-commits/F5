import { createBrowserClient } from '@supabase/ssr';
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabaseServerConfigured,
} from '@/lib/supabase/env';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.placeholder';

export const createClient = () => {
  const url = getSupabaseUrl() || PLACEHOLDER_URL;
  const key = getSupabasePublishableKey() || PLACEHOLDER_KEY;
  return createBrowserClient(url, key);
};

export const isSupabaseConfigured = () => isSupabaseServerConfigured();
