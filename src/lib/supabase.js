import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mimfwguttesvrmejlibq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbWZ3Z3V0dGVzdnJtZWpsaWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTMyODgsImV4cCI6MjA4NTM2OTI4OH0.NEY7qHJ7S-FoEkx6meDx798_yTYrlgAQhQGfx-A7byo';

// Singleton guard — prevents multiple GoTrueClient instances during Vite HMR
// (Vite re-executes modules on hot reload; storing on globalThis avoids duplication)
const STORAGE_KEY = '__supabase_client__';

if (!globalThis[STORAGE_KEY]) {
  globalThis[STORAGE_KEY] = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: window.localStorage,   // persist across reloads
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'sb-ambassadeurs-auth', // explicit key avoids conflicts
    }
  });
}

export const supabase = globalThis[STORAGE_KEY];
