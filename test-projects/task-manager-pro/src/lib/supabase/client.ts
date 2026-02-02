/**
 * Supabase client for browser/client-side operations
 * Uses NEXT_PUBLIC environment variables for client-side access
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types/database';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
