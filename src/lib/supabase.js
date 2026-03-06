import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Missing environment variables.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Netlify dashboard.'
  );
}

// Singleton guard — prevents multiple GoTrueClient instances during Vite HMR
// (Vite re-executes modules on hot reload; storing on globalThis avoids duplication)
const STORAGE_KEY = '__supabase_client__';

if (!globalThis[STORAGE_KEY]) {
  globalThis[STORAGE_KEY] = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'association-ab-auth-token',
      storage: window.localStorage,
    },
  });
}

export const supabase = globalThis[STORAGE_KEY];
