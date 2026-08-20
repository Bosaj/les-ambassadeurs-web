# Getting Started & Development Setup

This document walks you through setting up and running the **Les Ambassadeurs du Bien** web application locally.

---

## 📋 System Prerequisites

* **Node.js**: `>= 20.x` (LTS recommended)
* **npm**: `>= 10.x`
* **Git**: `>= 2.x`
* **Supabase Project**: Active project with database schema and RLS policies configured.

---

## 🛠️ Step-by-Step Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bosaj/les-ambassadeurs-web.git
   cd les-ambassadeurs-web
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```
   Provide your specific keys:
   ```ini
   # Public client-side variables (bundled into browser)
   VITE_SUPABASE_URL=https://mimfwguttesvrmejlibq.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

   # Serverless & Administrative Secrets (NEVER committed to git)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   STRIPE_SECRET_KEY=sk_test_...
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_secret
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available NPM Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Launches local Vite development server with Hot Module Replacement. |
| `npm run build` | Compiles optimized production bundle into `dist/`. |
| `npm run lint` | Checks JavaScript and JSX code quality with ESLint. |
| `npm test` | Runs unit test suites with Vitest in watch mode. |
| `npm test -- --run` | Executes all test suites once for CI validation. |
| `npm run preview` | Serves the local `dist/` production build. |
