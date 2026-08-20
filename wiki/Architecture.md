# Architecture

## Stack Overview

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + React Router v7 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + Framer Motion |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Stripe + PayPal (Netlify Functions) |
| Map | Leaflet + React-Leaflet |
| Deployment | Netlify CDN + Serverless |
| i18n | Custom translations.js (ar/fr/en) |

## Application Flow

`
Browser
  └── React SPA (Vite, lazy-loaded pages)
        ├── AuthContext    — Supabase session, RBAC, profile
        ├── DataContext    — all content CRUD (news, events, etc.)
        ├── LanguageContext — language state, t() helper, localStorage
        ├── ThemeContext   — dark/light mode, localStorage
        └── React Router v7
              ├── Public: /, /gallery, /news, /events, /programs, /donate, /volunteer
              ├── Auth:   /login, /signup
              └── Protected: /profile, /membership, /gamification, /dashboard/*

Supabase
  ├── PostgreSQL (RLS on all tables)
  ├── Auth (email/password + Google OAuth)
  └── Storage (avatars, gallery images)

Netlify
  ├── Static CDN (React SPA dist/)
  └── Functions (Stripe PaymentIntent, PayPal orders)
`

## Key Contexts

- **AuthContext** (src/context/AuthContext.jsx): Session management, login/logout, hasPermission(perm) for RBAC
- **DataContext** (src/context/DataContext.jsx): Centralized Supabase CRUD for all content types + gallery
- **LanguageContext** (src/context/LanguageContext.jsx): Active language, 	 object, changeLanguage()

## RBAC Permissions
Admin permissions stored as JSONB array in profiles.permissions:
manage_news, manage_events, manage_programs, manage_projects, manage_testimonials, manage_partners, manage_users, manage_donations, manage_branches, super_admin

## Full Route Table

| Path | Component | Access |
|------|-----------|--------|
| / | Home | Public |
| /gallery | GalleryPage | Public |
| /news | NewsPage | Public |
| /events | EventsPage | Public |
| /programs | ProgramsPage | Public |
| /donate | Donate | Public |
| /volunteer | Volunteer | Public |
| /login | Login | Public |
| /signup | Signup | Public |
| /profile | Profile | Auth |
| /membership | MembershipPage | Auth |
| /gamification | GamificationHub | Auth |
| /dashboard/admin | AdminDashboard | Admin |
| /dashboard/volunteer | VolunteerDashboard | Volunteer+ |
---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Wiki last updated: 2026-08-20*

</div>
