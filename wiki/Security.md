# Security

Full policy: https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md

## Reporting Vulnerabilities
Email: asosoufaraelkhir48@gmail.com
Do NOT open public issues for security vulnerabilities.

## Key Measures
- All Supabase tables protected by Row Level Security (RLS)
- Payment secrets server-side only (Netlify functions, not in browser bundle)
- Weekly automated security scans (GitHub Actions)
- No secrets committed to git (gitignored .env)
- Supabase anon key protected by RLS (safe to expose in client)
