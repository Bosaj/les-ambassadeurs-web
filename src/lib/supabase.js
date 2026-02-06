
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mimfwguttesvrmejlibq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbWZ3Z3V0dGVzdnJtZWpsaWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTMyODgsImV4cCI6MjA4NTM2OTI4OH0.NEY7qHJ7S-FoEkx6meDx798_yTYrlgAQhQGfx-A7byo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
