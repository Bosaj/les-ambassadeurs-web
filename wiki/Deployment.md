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

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Wiki last updated: 2026-08-20*

</div>
