# Troubleshooting

## Auth: Stuck on loading screen
Check Supabase project SITE_URL setting and allowed redirect URLs.

## Auth: Logout on page refresh
Fixed in v0.9.0. Ensure you are on latest version.

## Gallery: Images not loading
Verify Supabase Storage bucket is set to public access.

## Gallery: Marquee not looping in Arabic
Fixed in v1.0.0. The overflow container must have dir='ltr'.

## Build: Chunk size warnings
Check vite.config.js manualChunks configuration.

## Payments: Stripe not loading
Verify VITE_STRIPE_PUBLISHABLE_KEY starts with pk_live_ or pk_test_.

## Admin: Data not saving
Check Supabase RLS policies. The user's profiles.role must be 'admin'.
