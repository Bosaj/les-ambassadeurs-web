# FAQ

**Q: Why does the app need a Supabase project just to run locally — can't I use mock data?**
Most of the app (news, events, programs, projects, gallery, auth) reads live from Supabase through `DataContext` and `AuthContext`; there's no built-in mock data layer. For real local development you need an active Supabase project with the schema and RLS policies configured, though `npm run dev` will still start without one — pages that depend on data will just show empty/loading states.

**Q: What's the difference between `VITE_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` — can I use the service role key on the client?**
No, never. `VITE_*` variables are compiled directly into the browser bundle and are public by design — only the anon key (which is safe because Postgres Row Level Security enforces the real access control) belongs there. `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely and must stay server-side only (Netlify function environment), never prefixed with `VITE_`.

**Q: Why is there a Netlify serverless function when the rest of the app is a static SPA?**
Creating a Stripe PaymentIntent requires `STRIPE_SECRET_KEY`, which must never reach the browser. `netlify/functions/create-payment-intent.js` is the one piece of server-side compute that exists specifically to hold that secret; everything else (including PayPal Smart Buttons and all Supabase reads/writes) happens directly from the client.

**Q: How does Role-Based Access Control actually work — is it enforced client-side?**
RBAC permission flags (`manage_news`, `manage_events`, `manage_programs`, `manage_projects`, `manage_testimonials`, `manage_partners`, `manage_users`, `manage_donations`, `manage_branches`, `super_admin`) are checked client-side via `AuthContext.hasPermission()` to show/hide admin UI, but the actual security boundary is Postgres Row Level Security policies on each table — a user without the right permission flag can't write to a protected table even if they bypassed the UI.

**Q: Why does refreshing the page sometimes cause an infinite loading spinner or an unexpected logout?**
This was a known issue caused by a mutex deadlock in the Supabase GoTrue client during React StrictMode double-mounts or cold starts. The fix (in `AuthContext.jsx`) fetches the user profile via a direct REST call using the session JWT instead of the higher-level client helper. If you still see this, first confirm `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are actually set — a missing key produces the same symptom.

**Q: How is Arabic RTL support implemented — is it just flipped CSS?**
No. `LanguageContext` sets `document.documentElement.dir` to `rtl` for Arabic and `ltr` for French/English, so the real DOM layout direction changes, not just a visual mirror. One deliberate exception: the gallery marquee (`GalleryPreview.jsx`) forces `dir="ltr"` on its scrolling wrapper so the CSS keyframe scroll animation doesn't break, while the cards inside remain localized.

**Q: What happens if a donation via Stripe fails partway through?**
The PaymentIntent flow means the charge itself is validated by Stripe before confirmation; a failed or abandoned attempt simply doesn't produce a completed donation record, and no partial charge state needs cleanup on the app side.

**Q: Can I add a new admin-manageable content type (e.g., a new "resources" section)?**
Add the table (with RLS policies mirroring the existing public-read/admin-write pattern) in Supabase, extend `DataContext` with fetch/mutation helpers for it, add a new RBAC permission flag if it should be independently gated, and build the corresponding admin tab component under `src/components/admin/`.

**Q: Why does the gallery use JSONB captions instead of a plain text column?**
Captions need to exist in all three languages simultaneously (Arabic, French, English) without a join to a separate translations table — a JSONB column (`{ ar: "...", fr: "...", en: "..." }`) lets a single row carry all three, matching the pattern used by `src/translations.js` for UI strings.

**Q: Is this the same content as the `wiki/` folder checked into the repository?**
No — `wiki/` is a longer-form, topic-by-topic reference (Features, Admin Guide, Gallery Management, Payments, Internationalization, Deployment, Troubleshooting, Security, Changelog) maintained in-repo. This GitHub Wiki's four pages are a shorter entry point; for deep dives on a specific subsystem, check the matching page under `wiki/` in the repository.
