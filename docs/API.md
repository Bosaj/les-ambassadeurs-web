API Guide

Supabase Client: src/lib/supabase.js

Patterns:
- Read: supabase.from(table).select(*)
- Insert: supabase.from(table).insert(data)
- Update: supabase.from(table).update(data).eq(id, value)
- Delete: supabase.from(table).delete().eq(id, value)

Netlify Functions: netlify/functions/
- Used for: Stripe/PayPal server-side operations
- Access via: /.netlify/functions/function-name