# les-ambassadeurs-web

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/Bosaj/les-ambassadeurs-web) [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)


[![Web CI](https://github.com/Bosaj/les-ambassadeurs-web/actions/workflows/web_ci.yml/badge.svg)](https://github.com/Bosaj/les-ambassadeurs-web/actions/workflows/web_ci.yml)
[![Production Deployment](https://github.com/Bosaj/les-ambassadeurs-web/actions/workflows/deployment_status.yml/badge.svg)](https://github.com/Bosaj/les-ambassadeurs-web/deployments)
[![QA & Monitoring](https://github.com/Bosaj/les-ambassadeurs-web/actions/workflows/ci_qa_monitoring.yml/badge.svg)](https://github.com/Bosaj/les-ambassadeurs-web/actions/workflows/ci_qa_monitoring.yml)
[![GitHub Wiki](https://img.shields.io/badge/Documentation-GitHub%20Wiki-blue.svg)](https://github.com/Bosaj/les-ambassadeurs-web/wiki)
[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-Passed-brightgreen.svg)](docs/MONITORING_AND_QA.md)

---

<div align="center">

![Project Banner](public/images/logo.jpg)

[![Latest Release](https://img.shields.io/github/v/release/Bosaj/les-ambassadeurs-web?color=blue&label=version)](https://github.com/Bosaj/les-ambassadeurs-web/releases)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red.svg)](LICENSE)
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

### 5. 🏆 Fair Gamification & Volunteer Hub
* **Automatic, verified points** (granted once, revoked if the verification is undone):

  | Activity (verified by the team) | Points |
  |---|---|
  | Event participation confirmed | +20 |
  | Donation verified (flat — the amount doesn't buy rank) | +10 |
  | Annual membership paid | +50 / year |
  | Special recognition by an admin (reason required, never to oneself) | 10–100 |

* **Levels** 0 / 50 / 100 / 200 / 500 / 1000 and **8 milestone badges** earned automatically with a notification.
* **Leaderboard** (all-time and this month) with privacy-safe names; admins appear with an *Admin* tag.
* **Volunteer Dashboard**: progress card (level, rank, next badge), participations, impact, and membership renewal (annual fee: **100 DH**, `src/lib/membership.js`).
* Rules are enforced in the database (triggers + RPCs in `supabase/migrations/`), not in the browser.

### 5b. 🗂️ Admin Back-office
* **Overview**: live KPIs (`get_admin_overview`) and a *Needs attention* list that opens the right panel.
* **Inbox**: problem reports and event suggestions with status workflow and author notifications.
* **Community**: searchable members table with role filter, membership status, points/level, and awards.
* Consistent, responsive tables on desktop, tablet, and phone.

### 5c. 🎨 2026 Brand Identity & Team
* Visual identity from the association's 2026 Instagram: navy grid paper, red halftone dots, torn paper, Lalezar poster type.
* **Team 2026** section (9 members) with a switch to the previous team.

### 6. 🗺️ Interactive Branches Map
* Built with **Leaflet** and **React-Leaflet**.
* City filtering and dynamic geolocation pins for association branches across Morocco.
* Admin CRUD modal for adding, editing, and geocoding new branches.

### 7. 🛡️ Comprehensive DevSecOps Pipeline
* **GitHub Actions CI/CD**: Automated linting, Vitest unit testing, and Vite production bundle generation on every push and pull request.
* **Security**: production dependency audit on every PR, row-level security on every table, and guard triggers for privileged columns.
* **Versioned Releases**: SemVer tags and GitHub releases (`v0.3.0` → `v1.1.0`) tied to milestones and [CHANGELOG.md](CHANGELOG.md).

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

| Workflow | Trigger | What it does |
|---|---|---|
| [`web_ci.yml`](.github/workflows/web_ci.yml) | push / PR to `main` | ESLint, Vitest unit tests (54), `npm audit --omit=dev`, production build |
| [`deployment_status.yml`](.github/workflows/deployment_status.yml) | push to `main` | Waits for the Netlify production deploy of the commit, smoke-tests the site, records it in [GitHub Deployments](https://github.com/Bosaj/les-ambassadeurs-web/deployments) |
| [`ci_qa_monitoring.yml`](.github/workflows/ci_qa_monitoring.yml) | push / PR to `main` | Pytest QA suite, evaluation harness, Prometheus/Grafana spec validation |

Netlify builds and publishes `main` automatically; database changes live in [`supabase/migrations/`](supabase/migrations).

---

## 📁 Repository Structure

```
les-ambassadeurs-web/
├── .github/
│   ├── ISSUE_TEMPLATE/       # Bug report & feature request templates
│   ├── workflows/            # web_ci, deployment_status, ci_qa_monitoring
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/                     # Technical documentation (Architecture, Database, API, etc.)
├── supabase/
│   └── migrations/           # SQL migrations applied to production (security, gamification, data standards)
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
├── package.json              # Project dependencies and metadata (v1.1.0)
└── vite.config.js            # Vite build, chunk splitting, and test configuration
```

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history (Keep a Changelog format, SemVer).

---

## 📄 License

Copyright © 2026 Oussama EL HADJI. **All rights reserved** — see [LICENSE](LICENSE) for the terms.

Built and maintained on behalf of the **Association des Ambassadeurs du Bien** (Oujda branch).

---

## 👤 Author

**Oussama EL HADJI** — [github.com/Bosaj](https://github.com/Bosaj)


## 📊 Monitoring, Controlling, Evaluation & QA

This project includes a standardized 4-Pillar Observability and QA framework:
- **Logs & Prometheus/Grafana Monitoring**: Configured in `monitoring/` with Prometheus scraper configs and Grafana dashboards.
- **Health Controlling & Evaluation**: Liveness/readiness controllers in `monitoring/health.py` and evaluation harness in `scripts/eval_harness.py`.
- **QA & Testing**: Automated Pytest/Vitest integration and CI workflows via `.github/workflows/ci_qa_monitoring.yml`.

For complete instructions, architecture details, and commands, see [docs/MONITORING_AND_QA.md](docs/MONITORING_AND_QA.md).

---

## 📚 Documentation & GitHub Wiki
- 📖 **Official Project Wiki**: [https://github.com/Bosaj/les-ambassadeurs-web/wiki](https://github.com/Bosaj/les-ambassadeurs-web/wiki)
- 🔍 **Architecture & Design**: [https://github.com/Bosaj/les-ambassadeurs-web/wiki/Architecture-and-Design](https://github.com/Bosaj/les-ambassadeurs-web/wiki/Architecture-and-Design)
- 🚀 **Getting Started Guide**: [https://github.com/Bosaj/les-ambassadeurs-web/wiki/Getting-Started](https://github.com/Bosaj/les-ambassadeurs-web/wiki/Getting-Started)
- 📊 **Monitoring & Observability**: [docs/MONITORING_AND_QA.md](docs/MONITORING_AND_QA.md)
