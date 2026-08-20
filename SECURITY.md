# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Report security vulnerabilities by emailing: **asosoufaraelkhir48@gmail.com**

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive a response within **72 hours**. We will work with you to understand and resolve the issue promptly.

## Security Architecture

### What is public (safe to expose)
- VITE_SUPABASE_URL — Supabase project URL (public)
- VITE_SUPABASE_ANON_KEY — Supabase anon key (protected by RLS)
- VITE_STRIPE_PUBLISHABLE_KEY — Stripe publishable key (client-safe)

### What is secret (NEVER commit)
- SUPABASE_SERVICE_ROLE_KEY — bypasses all RLS policies
- STRIPE_SECRET_KEY — full Stripe account access
- PAYPAL_CLIENT_SECRET — PayPal account access
- NETLIFY_PERSONAL_ACCESS_TOKEN — Netlify account access
- Any GitHub PATs

### Row Level Security (RLS)
All Supabase tables are protected by RLS policies:
- profiles — users can only read/update their own profile
- gallery_images — public read, admin-only write
- 
ews, events, programs, projects — public read, admin-only write
- donations — users see only their own, admins see all

### Content Security Policy
The app is deployed on Netlify with security headers configured in 
etlify.toml.

## Dependency Security
We run automated dependency audits weekly via GitHub Actions (security-scan.yml).
Run 
pm audit locally before submitting PRs.
