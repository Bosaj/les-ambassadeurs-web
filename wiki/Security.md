# Security Policy & Vulnerability Disclosure

Security is a primary priority for the **Association des Ambassadeurs du Bien** platform.

---

## 🛡️ Supported Versions

| Version | Supported |
|---|---|
| `1.0.x` | ✅ Supported (Active) |
| `< 1.0` | ❌ Discontinued |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within this project, please report it directly via email:

📧 **Security Contact**: `asosoufaraelkhir48@gmail.com`

**Please do NOT open public GitHub issues for security vulnerabilities.**

When reporting, please include:
1. Type of vulnerability (e.g. XSS, RLS bypass, CSRF, sensitive data exposure).
2. Step-by-step instructions or proof-of-concept to reproduce the vulnerability.
3. Affected components or API endpoints.

We will acknowledge receipt within **48 hours** and provide an estimated remediation timeline.

---

## 🔒 Security Architecture & Measures

1. **Row Level Security (RLS)**: Every PostgreSQL table in Supabase has RLS policies enforcing that users can only modify their own profile data and administrative operations require verified admin role claims.
2. **Secrets Protection**: All payment secret keys (`STRIPE_SECRET_KEY`, `PAYPAL_CLIENT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) are restricted to serverless Netlify functions and are NEVER bundled into client JavaScript.
3. **Automated Scanning**: GitHub Actions executes weekly automated secret detection (TruffleHog), dependency vulnerability checks (`npm audit`), and static code analysis (CodeQL).

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Official Documentation for Association des Ambassadeurs du Bien — Oujda*

</div>
