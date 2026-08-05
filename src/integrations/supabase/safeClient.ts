import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// NOTE: This wrapper exists to prevent the app from crashing when the preview
// environment temporarily fails to inject Vite env vars.
// Values below are publishable (anon) and safe to bundle.

const FALLBACK_SUPABASE_URL = "https://wpxhailrakxuswzleobh.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweGhhaWxyYWt4dXN3emxlb2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzOTI4MjIsImV4cCI6MjA4MTk2ODgyMn0._vpvxdV-TTaDawmw9T3HHEVYkRBXnhH2C6J7xNouLjs";

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
