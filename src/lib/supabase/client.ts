import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

// Defaults for the FX Unlock Supabase project so the app builds and runs
// with zero env configuration (Vercel, GitHub Pages, local). The anon key
// is a public, RLS-protected client key — safe to ship in the bundle.
// Env vars still take precedence when set.
const DEFAULT_SUPABASE_URL = "https://lkzgpxkyueazrnbugldj.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxremdweGt5dWVhenJuYnVnbGRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNjIyODMsImV4cCI6MjA5ODYzODI4M30.PaRsUY4ZqrJoslVeCAs1hs7tGxdc8ydf0f0qw8epMAM";

// Static-export app — everything runs in the browser, so a single
// supabase-js client with localStorage session persistence is all we need.
let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  client = createSupabaseClient(url, anonKey);
  return client;
}
