# Security Policy & Vulnerability Disclosure

Security and data integrity are central to the **Association des Ambassadeurs du Bien** infrastructure.

---

## 🛡️ Supported Software Versions

| Version | Status |
|---|---|
| `1.0.x` | ✅ Active Support |
| `< 1.0` | ❌ End of Life |

---

## 🚨 Reporting a Vulnerability

Please report security issues directly via email:

📧 **Security Contact:** `asosoufaraelkhir48@gmail.com`

**Do NOT file public GitHub issues for security vulnerabilities.**

Please include in your report:
1. Vulnerability description and classification.
2. Step-by-step reproduction instructions.
3. Affected endpoints, tables, or client components.

We acknowledge receipt within **48 hours** and provide remediation patches promptly.

---

## 🔒 Security Architecture & Protections

1. **Row Level Security (RLS)**: Enforced across all Supabase PostgreSQL tables. Public reads are scoped to published content; user data is restricted to owner access; admin mutations require validated admin roles.
2. **Serverless Secrets Isolation**: Sensitive keys (`STRIPE_SECRET_KEY`, `PAYPAL_CLIENT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) reside solely in Netlify function environments and are NEVER exposed to the client bundle.
3. **Automated Auditing**: GitHub Actions executes weekly TruffleHog secret scanning, high-severity `npm audit` dependency checks, and CodeQL static security analysis.
