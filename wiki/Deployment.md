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
   * **Jobs**: ESLint check (`npm run lint`), Vitest test suite (`npm test -- --run`), and Vite production build (`npm run build`).
2. **`release.yml`**:
   * Triggers on version tags (`v*.*.*`).
   * Automatically packages build artifacts and creates GitHub Release notes.
3. **`security-scan.yml`**:
   * Executes weekly every Monday at 08:00 UTC.
   * Runs high-severity `npm audit`, TruffleHog secret scanning, and GitHub CodeQL static analysis.
4. **`deploy-preview.yml`**:
   * Deploys preview branches to Netlify on pull requests and posts preview URLs as PR comments.
5. **`labeler.yml`**:
   * Automatically categorizes pull requests based on touched file paths.
