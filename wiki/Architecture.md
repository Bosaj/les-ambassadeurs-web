# System Architecture & Technical Design

The **Les Ambassadeurs du Bien** platform is engineered as a modern Single-Page Application (SPA) with serverless backend integrations and distributed cloud services.

---

## 🏗️ Architecture Diagram

```
                     ┌────────────────────────────────────────┐
                     │          Client Browser (SPA)          │
                     │  React 19 + React Router v7 + Tailwind │
                     └───────────────────┬────────────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
                 ▼                       ▼                       ▼
     ┌──────────────────────┐  ┌───────────────────┐  ┌──────────────────────┐
     │  Supabase Auth & DB  │  │ Netlify Functions │  │ Third-Party Gateways │
     │  PostgreSQL with RLS │  │ Serverless Stripe │  │ Stripe Elements      │
     │  Storage Buckets     │  │ PaymentIntents    │  │ PayPal Smart Buttons │
     └──────────────────────┘  └───────────────────┘  └──────────────────────┘
```

---

## 🧩 Global State & Context Layer

The application utilizes React Context for centralized global state management:

1. **`AuthContext` (`src/context/AuthContext.jsx`)**:
   * Manages user session state, Supabase authentication listeners, and profile synchronization.
   * Uses direct REST API calls for profile fetching to eliminate client-side GoTrue mutex deadlocks.
   * Exposes `login`, `logout`, `loginWithGoogle`, `refreshProfile`, `upgradeToMember`, and `hasPermission(permName)`.

2. **`DataContext` (`src/context/DataContext.jsx`)**:
   * Centralizes CRUD operations for `news`, `events`, `programs`, `projects`, `testimonials`, `partners`, and `gallery_images`.
   * Implements parallel data queries via `Promise.all` for fast public data hydration.
   * Connects to Supabase RPC functions such as `get_public_supporters`.

3. **`LanguageContext` (`src/context/LanguageContext.jsx`)**:
   * Controls active language (`ar`, `fr`, `en`) and persists choice to `localStorage`.
   * Automatically updates `document.documentElement.dir` (`rtl` for Arabic, `ltr` for French/English).
   * Provides the global translation dictionary `t`.

4. **`ThemeContext` (`src/context/ThemeContext.jsx`)**:
   * Manages dark/light mode toggle and updates `class="dark"` on `document.documentElement`.

---

## 🗄️ Database Schema & Storage

The database runs on Supabase (PostgreSQL 15) with Row Level Security (RLS) enabled on all tables:

* `profiles`: Extended user profiles (`full_name`, `full_name_ar`, `avatar_url`, `role`, `permissions`, `points`, `membership_status`).
* `gallery_images`: Photos with `caption` (JSONB: `{"ar": "...", "fr": "...", "en": "..."}`), `related_type`, `related_item_id`, `is_featured`.
* `news`: Articles with multilingual JSONB `title` and `content`, `image`, `date`, `is_pinned`.
* `events`: Events with multilingual `title`, `description`, `location`, `date`, `end_date`, `attendees` (UUID array).
* `programs` & `projects`: Community programs and social projects with goals and attendee registries.
* `donations`: Transaction records (`amount`, `currency`, `payment_method`, `status`, `user_id`).
* `branches`: Association branch locations (`name`, `city`, `address`, `lat`, `lng`, `phone`).
* `testimonials`: Approved community reviews with 1–5 star ratings.
* `notifications`: Real-time user notifications.

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Official Documentation for Association des Ambassadeurs du Bien — Oujda*

</div>
