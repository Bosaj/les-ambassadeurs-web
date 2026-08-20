# Deployment

## Platform: Netlify
Auto-deploys from GitHub main branch on every push.

## Manual Deployment
```bash
npm run build
netlify deploy --prod --dir=dist
```n
## Required Env Vars (set in Netlify dashboard)
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_STRIPE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- PAYPAL_CLIENT_ID
- PAYPAL_CLIENT_SECRET

## CI/CD (GitHub Actions)
- ci.yml: lint + build + test on every push/PR
- release.yml: Creates GitHub Release on version tags (v*.*.*)
- security-scan.yml: Weekly dependency audit and secret scan
