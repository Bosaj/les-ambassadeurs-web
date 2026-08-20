# Architecture — Les Ambassadeurs du Bien

## Overview

The application is a **Single-Page Application (SPA)** built with React 19, bundled by Vite 7, styled with Tailwind CSS 4, and deployed on Netlify. The backend is entirely managed by Supabase (PostgreSQL database + Auth + Storage).

## Technology Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Frontend      | React 19, React Router v7         |
| Build Tool    | Vite 7                            |
| Styling       | Tailwind CSS 4, Framer Motion     |
| Backend       | Supabase (PostgreSQL + Auth)      |
| Storage       | Supabase Storage                  |
| Payments      | Stripe, PayPal                    |
| Deployment    | Netlify (CDN + Serverless Fns)   |
| Map           | Leaflet + React-Leaflet           |
| i18n          | Custom translations.js (~165KB)   |

## Application Architecture

`
Browser
  └── React SPA (Vite bundle, lazy-loaded pages)
        ├── Contexts (Global State)
        │     ├── AuthContext    — user session, profile, RBAC
        │     ├── DataContext    — all content (news, events, etc.)
        │     ├── LanguageContext — active language, t() helper
        │     └── ThemeContext   — dark/light mode
        ├── Router (React Router v7)
        │     ├── Public routes  — /, /gallery, /news, /events, /programs
        │     ├── Auth routes    — /login, /signup
        │     └── Protected      — /profile, /dashboard/admin, /dashboard/volunteer
        └── Components
              ├── Pages (lazy loaded)
              └── Shared components

Supabase (Backend-as-a-Service)
  ├── PostgreSQL DB (with RLS)
  ├── Auth (email/password + Google OAuth)
  └── Storage (avatar images, gallery photos)

Netlify
  ├── Static CDN (React SPA)
  └── Serverless Functions (Stripe/PayPal webhooks)
`

## Context Architecture

### AuthContext (src/context/AuthContext.jsx)
- Wraps the entire app
- Manages Supabase session via getSession() + onAuthStateChange
- Exposes: user, login(), logout(), hasPermission()
- RBAC: checks profiles.permissions JSON array

### DataContext (src/context/DataContext.jsx)
- Manages all content: news, events, programs, projects, testimonials, partners, gallery_images
- CRUD operations mapped to Supabase table operations
- Exposes data and functions via useData() hook

### LanguageContext (src/context/LanguageContext.jsx)
- Manages language state ('ar' | 'fr' | 'en')
- Persists to localStorage
- Exposes 	 (translations object), changeLanguage()

## Routing

All routes are lazy-loaded (React lazy() + Suspense) for optimal code splitting.

| Path                    | Component         | Access        |
|-------------------------|-------------------|---------------|
| /                     | Home              | Public        |
| /gallery              | GalleryPage       | Public        |
| /news                 | NewsPage          | Public        |
| /events               | EventsPage        | Public        |
| /programs             | ProgramsPage      | Public        |
| /donate               | Donate            | Public        |
| /volunteer            | Volunteer         | Public        |
| /login                | Login             | Public        |
| /signup               | Signup            | Public        |
| /profile              | Profile           | Authenticated |
| /membership           | MembershipPage    | Authenticated |
| /gamification         | GamificationHub   | Authenticated |
| /dashboard/admin      | AdminDashboard    | Admin only    |
| /dashboard/volunteer  | VolunteerDashboard| Volunteer+    |
