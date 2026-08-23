# Ambassadors of Good Association (Association des Ambassadeurs du Bien — Oujda)

<div align="center">

![Project Banner](public/images/new_ABV.jpg)

[![CI Status](https://github.com/Bosaj/les-ambassadeurs-web/actions/workflows/ci.yml/badge.svg)](https://github.com/Bosaj/les-ambassadeurs-web/actions/workflows/ci.yml)
[![Security Scan](https://github.com/Bosaj/les-ambassadeurs-web/actions/workflows/security-scan.yml/badge.svg)](https://github.com/Bosaj/les-ambassadeurs-web/actions/workflows/security-scan.yml)
[![Latest Release](https://img.shields.io/github/v/release/Bosaj/les-ambassadeurs-web?color=blue&label=version)](https://github.com/Bosaj/les-ambassadeurs-web/releases)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Netlify Status](https://api.netlify.com/api/v1/badges/ee33b656-05db-4629-b6ec-55ed881b3d90/deploy-status)](https://a-a-b-v.netlify.app/)

**🌐 Production Website:** [https://a-a-b-v.netlify.app/](https://a-a-b-v.netlify.app/)  
**📖 Project Wiki:** [https://github.com/Bosaj/les-ambassadeurs-web/wiki](https://github.com/Bosaj/les-ambassadeurs-web/wiki)

</div>

---

## 🌍 About The Organization & Platform

**Association des Ambassadeurs du Bien (جمعية سفراء الخير - فرع وجدة)** is a non-profit humanitarian organization based in Oujda, Morocco. This web application is the official community platform providing public awareness, volunteer recruitment, multi-channel donations, event registration, branch mapping, gamification, and an administrative back-office.

---

## ✨ Key Features & Modules

### 1. 🖼️ Photo Gallery & Infinite Marquee
* **Dedicated Gallery Page (`/gallery`)**: Responsive masonry layout with multi-category filters (*All*, *Events*, *Projects*, *Programs*, *General*), live search, and full-screen lightbox modal.
* **Home Page Gallery Marquee**: Auto-scrolling infinite CSS marquee with pause-on-hover, bidirectional support (Arabic RTL and French/English LTR), and gradient fade masks.
* **Admin Gallery Management**: Upload photos to Supabase Storage, tag with multilingual JSONB captions, link to specific events/programs, and toggle `is_featured`.

### 2. 🌐 Trilingual Internationalization (i18n & RTL)
* Seamlessly toggle between **العربية (Arabic)**, **Français (French)**, and **English**.
* Complete RTL (Right-to-Left) mirroring and directional styling for Arabic.
* Over **2,500+ localized translation keys** managed in `src/translations.js`.

### 3. 🔐 Authentication & Granular RBAC
* Powered by **Supabase Auth** (Email/Password + Google OAuth).
* Global `AuthContext` with session persistence and mutex-free REST profile syncing.
* Granular **Role-Based Access Control (RBAC)**: `manage_news`, `manage_events`, `manage_programs`, `manage_projects`, `manage_testimonials`, `manage_partners`, `manage_users`, `manage_donations`, `manage_branches`, `super_admin`.

### 4. 💳 Multi-Gateway Donation System
* **Stripe Checkout**: Client-side CardElement with serverless Netlify function (`/.netlify/functions/create-payment-intent`).
* **PayPal Smart Buttons**: Sandbox & live PayPal checkout integration.
* **Direct Bank Transfer**: Structured bank transfer instructions with automated receipt logging.

### 5. 🏆 Gamification & Volunteer Hub
* **Points & Badges**: Community score leaderboard, activity milestones, and badge unlocks.
* **Volunteer Dashboard**: Track active participations, impact metrics, and membership renewals.
* **Admin Tools**: Point awarding modal (`AwardPointsModal`) and membership verification.

### 6. 🗺️ Interactive Branches Map
* Built with **Leaflet** and **React-Leaflet**.
* City filtering and dynamic geolocation pins for association branches across Morocco.
* Admin CRUD modal for adding, editing, and geocoding new branches.

### 7. 🛡️ Comprehensive DevSecOps Pipeline
* **GitHub Actions CI/CD**: Automated linting, Vitest unit testing, and Vite production bundle generation on every push and pull request.
* **Weekly Security Auditing**: Automated npm audit, TruffleHog secret scanning, and CodeQL static analysis.
* **Progressive Version Releases**: Documented SemVer releases (`v0.1.0` to `v1.0.0`) with automated GitHub release packaging.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/), [React Router v7](https://reactrouter.com/) |
| **Bundler & Build Tool** | [Vite 7](https://vitejs.dev/) |
| **Styling & Design** | [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend as a Service** | [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security, Auth, Storage) |
| **Payment Processing** | [Stripe](https://stripe.com/), [PayPal](https://developer.paypal.com/) |
| **Mapping** | [Leaflet](https://leafletjs.com/), [React-Leaflet](https://react-leaflet.js.org/) |
| **Testing** | [Vitest](https://vitest.dev/), [@testing-library/react](https://testing-library.com/) |
| **Hosting & Functions** | [Netlify](https://www.netlify.com/) (CDN + Serverless Functions) |

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js**: >= 20.x
* **npm**: >= 10.x
* **Git**

### Installation

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
   Fill in real values for the variables below (never commit `.env`):

   | Variable | Used for |
   |---|---|
   | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase client (public, bundled into the browser build) |
   | `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Checkout (client-side, public) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Netlify functions only — server-side, never exposed to the browser |
   | `STRIPE_SECRET_KEY` | Netlify function `create-payment-intent` (server-side) |
   | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENVIRONMENT` | PayPal Smart Buttons checkout |
   | `SUPABASE_ACCESS_TOKEN`, `NETLIFY_PERSONAL_ACCESS_TOKEN`, `GITHUB_PERSONAL_ACCESS_TOKEN` | Local tooling/CI only — never read by the app |

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

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts local Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles and optimizes assets into the `dist/` directory for production. |
| `npm run lint` | Runs ESLint across all JavaScript/JSX source files. |
| `npm test` | Runs Vitest unit test suites. |
| `npm test -- --run` | Executes all unit tests once and outputs results. |
| `npm run preview` | Previews the local production build on an HTTP server. |

---

## 🧪 Testing & CI

The `ci.yml` workflow runs on every push/PR to `main` and `develop`:

| Job | What it checks |
|---|---|
| **Lint** | ESLint across all JS/JSX source files |
| **Test** | Vitest unit test suite (`@testing-library/react`, jsdom) |
| **Build & Attest** | Production Vite build, uploaded as a build artifact, with a Sigstore build-provenance attestation |

Additional automation:
* **`security-scan.yml`** — weekly `npm audit`, TruffleHog secret scanning, and CodeQL static analysis
* **`deploy.yml`** — deploys `main` to Netlify production and runs a Supabase backend health check
* **`package.yml`** — publishes the package to GitHub Packages on release
* **`release.yml`** — automates tagged GitHub releases
* **`deploy-preview.yml`** / **`labeler.yml`** — PR preview deployments and automatic PR labeling

---

## 📁 Repository Structure

```
les-ambassadeurs-web/
├── .github/
│   ├── ISSUE_TEMPLATE/       # Bug report & feature request templates
│   ├── workflows/            # CI, release, security-scan, labeler, deploy-preview
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/                     # Technical documentation (Architecture, Database, API, etc.)
├── netlify/
│   └── functions/            # Serverless payment handlers (Stripe PaymentIntent)
├── public/                   # Static assets, logo banner, icons
├── src/
│   ├── __tests__/            # Vitest unit test suites
│   ├── components/           # Reusable UI components (GalleryPreview, Modal, Header, Footer...)
│   │   └── admin/            # Admin management tabs (GalleryManagement, PostList...)
│   ├── context/              # Global React Contexts (AuthContext, DataContext, LanguageContext...)
│   ├── hooks/                # Custom React hooks (useAuth, useLanguage, useData...)
│   ├── lib/                  # External service clients (Supabase client singleton)
│   ├── pages/                # Lazy-loaded route pages (Home, GalleryPage, AdminDashboard...)
│   ├── utils/                # Date, image, and language helper utilities
│   ├── App.jsx               # Route definitions and provider composition
│   ├── index.css             # Tailwind CSS imports and theme configuration
│   └── translations.js       # Trilingual translation dictionaries (AR, FR, EN)
├── wiki/                     # Markdown source files synchronized to GitHub Wiki
├── netlify.toml              # Netlify SPA routing & headers configuration
├── package.json              # Project dependencies and metadata (v1.0.0)
└── vite.config.js            # Vite build, chunk splitting, and test configuration
```

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history (Keep a Changelog format, SemVer).

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

Built and maintained on behalf of the **Association des Ambassadeurs du Bien** (Oujda branch).

---

## 👤 Author

**Oussama EL HADJI** — [github.com/Bosaj](https://github.com/Bosaj)
