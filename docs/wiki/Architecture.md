# Technical Architecture & System Design

The **Les Ambassadeurs du Bien** platform is architected as a high-performance Single-Page Application (SPA) backed by serverless cloud services.

---

## 🏗️ Architecture Stack Overview

| Layer | Technology | Responsibilities |
|---|---|---|
| **Frontend Core** | React 19, React Router v7 | Component rendering, client-side routing, and DOM reconciliation. |
| **Build & Tooling** | Vite 7 | Fast ESM bundling, code splitting via `manualChunks`, and HMR. |
| **Styling & Motion** | Tailwind CSS 4, Framer Motion | Responsive layouts, RTL mirroring, dark mode, and fluid animations. |
| **Backend as a Service** | Supabase (PostgreSQL 15) | Relational database, Row Level Security (RLS), Auth, Storage buckets. |
| **Serverless Functions** | Netlify Functions (Node.js) | Server-side Stripe PaymentIntent creation at `/.netlify/functions/create-payment-intent`. |
| **Third-Party Gateways**| Stripe Elements, PayPal SDK | Secure PCI-compliant online donation processing. |
| **Geographic Mapping** | Leaflet, React-Leaflet | Dynamic branch mapping across Moroccan cities. |

---

## 🧩 Global React State Architecture

State is shared across components using modular React Context providers:

1. **`AuthContext` (`src/context/AuthContext.jsx`)**:
   * Synchronizes user authentication state via Supabase Auth events (`SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`).
   * Fetches user profile directly via native REST API using the session JWT to avoid client mutex deadlocks.
   * Exposes helper methods: `login()`, `logout()`, `loginWithGoogle()`, `refreshProfile()`, and `hasPermission(permName)`.

2. **`DataContext` (`src/context/DataContext.jsx`)**:
   * Centralizes all content retrieval (`news`, `events`, `programs`, `projects`, `testimonials`, `partners`, `gallery_images`).
   * Uses `Promise.all` for parallel non-blocking public data fetches.
   * Manages admin mutation actions (`addPost`, `updatePost`, `deletePost`, `togglePin`, `verifyMember`).

3. **`LanguageContext` (`src/context/LanguageContext.jsx`)**:
   * Manages the selected language (`ar`, `fr`, `en`) and stores user preference in `localStorage`.
   * Dynamically alters `document.documentElement.dir` to `rtl` for Arabic and `ltr` for French/English.

4. **`ThemeContext` (`src/context/ThemeContext.jsx`)**:
   * Controls dark/light theme toggle and applies the `dark` class to `document.documentElement`.
