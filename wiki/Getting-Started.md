# Getting Started & Development Setup

This guide provides everything needed to clone, install, configure, and run the **Les Ambassadeurs du Bien** web application locally.

---

## 📋 Prerequisites

* **Node.js**: `v20.x` or higher (LTS recommended)
* **npm**: `v10.x` or higher
* **Git**: `v2.x` or higher
* **Supabase Project**: A valid Supabase instance with database migrations applied.

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bosaj/les-ambassadeurs-web.git
   cd les-ambassadeurs-web
   ```

2. **Configure Environment Variables:**
   Copy the provided `.env.example` template:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in the required keys:
   ```ini
   # Public Client Variables (VITE_ prefix exposes to browser bundle)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

   # Server-side Secrets (Used in Netlify Functions, NEVER client-exposed)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   STRIPE_SECRET_KEY=sk_test_...
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_secret
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Start the Local Development Server:**
   ```bash
   npm run dev
   ```
   The development server will launch at `http://localhost:5173`.

---

## 📜 Available NPM Scripts

* `npm run dev`: Launches Vite dev server with Hot Module Replacement (HMR).
* `npm run build`: Executes production build and emits optimized assets to `dist/`.
* `npm run lint`: Runs ESLint check across all JSX and JS files.
* `npm test`: Runs Vitest in watch mode.
* `npm test -- --run`: Executes all unit tests once and outputs results.
* `npm run preview`: Previews the built `dist/` directory on a local web server.

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Official Documentation for Association des Ambassadeurs du Bien — Oujda*

</div>
