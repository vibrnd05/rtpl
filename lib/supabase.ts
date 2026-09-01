import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for server-side use (server actions, route handlers).
 *
 * Uses the anon key, so every write is governed by the row level security
 * policies in `supabase/schema.sql` — anonymous visitors may INSERT a team
 * registration and nothing else. No service-role key is needed or used.
 */
export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Copy .env.local.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
