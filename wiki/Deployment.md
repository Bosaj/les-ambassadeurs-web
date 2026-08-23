# Deployment & CI/CD Pipeline

The application is deployed on **Netlify** with continuous integration and security pipelines powered by **GitHub Actions**.

---

## 🌐 Netlify Production Configuration

* **Production URL:** [https://a-a-b-v.netlify.app/](https://a-a-b-v.netlify.app/)
* **Build Command:** `npm run build`
* **Publish Directory:** `dist/`
* **Functions Directory:** `netlify/functions/`

### SPA Routing Rule (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔄 GitHub Actions Workflows

1. **`ci.yml`**:
   * Runs on every push and PR to `main` and `develop`.
   * **Jobs**: strict ESLint (`npm run lint`), deterministic Vitest (`npm test`), Vite production build (`npm run build`), and high-severity dependency audit (`npm audit --audit-level=high`).
2. **`release.yml`**:
   * Triggers on version tags (`v*.*.*`).
   * Automatically packages build artifacts and creates GitHub Release notes.
3. **`security-scan.yml`**:
   * Executes weekly every Monday at 08:00 UTC and on pull requests to `main`.
   * Blocks on high-severity `npm audit` findings and verified TruffleHog secrets, then runs GitHub CodeQL static analysis.
4. **`deploy-preview.yml`**:
   * Deploys preview branches to Netlify on pull requests and posts preview URLs as PR comments.
5. **`package.yml`**:
   * Publishes to GitHub Packages only for published releases or manual runs; it does not publish on every push to `main`.
6. **`labeler.yml`**:
   * Automatically categorizes pull requests based on touched file paths.

Online Stripe and PayPal checkout remain disabled until signed server-side payment reconciliation and Supabase RLS verification are complete. Bank-transfer requests are stored as pending and their proof files belong in private storage buckets.
