# Deployment & CI/CD Guide

The web application is hosted on **Netlify** with automated Continuous Integration and Continuous Deployment (CI/CD) via **GitHub Actions**.

---

## 🌐 Hosting Configuration

* **Production URL:** [https://a-a-b-v.netlify.app/](https://a-a-b-v.netlify.app/)
* **Build Command:** `npm run build`
* **Publish Directory:** `dist/`
* **Functions Directory:** `netlify/functions/`

### SPA Routing Configuration (`netlify.toml`)
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
   * Triggers on pushes and pull requests to `main` and `develop`.
   * **Jobs**: ESLint (`npm run lint`), Unit Tests (`npm test -- --run`), and Production Build (`npm run build`).
2. **`release.yml`**:
   * Triggers on version tag pushes (`v*.*.*`).
   * Compiles production build and publishes formal GitHub Release notes.
3. **`security-scan.yml`**:
   * Scheduled weekly every Monday at 08:00 UTC.
   * Runs high-severity `npm audit`, TruffleHog secret scanning, and GitHub CodeQL static analysis.
4. **`deploy-preview.yml`**:
   * Deploys ephemeral Netlify previews on pull requests and comments the live preview URL on the PR.
5. **`labeler.yml`**:
   * Automatically assigns labels to PRs based on touched files (e.g., `i18n`, `gallery`, `auth`, `payments`).

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Official Documentation for Association des Ambassadeurs du Bien — Oujda*

</div>
