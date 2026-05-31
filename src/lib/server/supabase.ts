import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase clients.
 * - `supabaseAnon()` respects RLS (use for reads as the app).
 * - `supabaseService()` uses the service-role key and BYPASSES RLS — only ever
 *   call this on the server, never expose the key to the browser.
 *
 * When the env vars are absent the app runs in local demo mode and these are
 * not used (see src/lib/data.ts). `isSupabaseConfigured` lets callers branch.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export function supabaseAnon(): SupabaseClient {
  if (!url || !anonKey) throw new Error("Supabase not configured");
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

export function supabaseService(): SupabaseClient {
  if (!url || !serviceKey) throw new Error("Supabase service role not configured");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
