import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// NOTE: This wrapper exists to prevent the app from crashing when the preview
// environment temporarily fails to inject Vite env vars.
// Values below are publishable (anon) and safe to bundle.

const FALLBACK_SUPABASE_URL = "https://oxoaoyvvgddqksvdmrkd.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94b2FveXZ2Z2RkcWtzdmRtcmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NTQ2NzksImV4cCI6MjA4MjAzMDY3OX0.Mh2B_NxQ43GTgN5-zKBvZYbrWU9EcnCDelGidRjjFqk";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_PUBLISHABLE_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  // Avoid hard crash; still give a helpful signal for debugging.
  console.warn(
    "[backend] Missing Vite env vars; using publishable fallback config for preview."
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
