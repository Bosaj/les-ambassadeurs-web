# Changelog

All notable changes to **Les Ambassadeurs du Bien — Oujda Branch** are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) | Versioning: [SemVer](https://semver.org)

---

## [1.0.0] - 2026-08-20

### Added
- **Photo Gallery page** (/gallery): masonry grid, category filtering (All/Events/Projects/Programs/General), text search, image lightbox
- **Gallery Preview component**: auto-scrolling infinite marquee on home page (CSS keyframe animation, works in all languages)
- **Gallery Admin Management**: full CRUD tab in Admin Dashboard — upload images, multilingual JSONB captions, link to events/projects/programs, featured flag
- **Supabase gallery_images table**: RLS (public read, admin-only write), JSONB captions, related_type, is_featured
- **Gallery links** in Header (desktop + mobile) and Footer
- **GitHub Actions CI/CD**: ci.yml (lint+build+test), release.yml (version tags), security-scan.yml (weekly), deploy-preview.yml, labeler.yml
- **GitHub Secrets** configured for CI: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLISHABLE_KEY, NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID
- **Repo About**: description, homepage (https://a-a-b-v.netlify.app/), 15 topics
- **Issue templates**: bug_report.md, feature_request.md
- **PR template**: .github/PULL_REQUEST_TEMPLATE.md
- **Documentation**: CHANGELOG, SECURITY, CODE_OF_CONDUCT, CONTRIBUTING, docs/, wiki/ (12 pages)
- **GitHub Milestones**: v1.0.1 (Sep 2026), v1.1.0 (Oct 2026), v2.0.0 (Dec 2026)
- **GitHub Issues**: 5 historical bugs (closed), 10 future enhancements (open, milestoned)
- **GitHub Release**: v1.0.0 with release notes

### Fixed
- Gallery marquee animation broken in Arabic RTL mode (replaced JS rAF with CSS keyframe translateX 0→-50%)
- Unused imports (useCallback, Link) in GalleryPage.jsx

---

## [0.9.0] - 2026-03-22

### Fixed
- **Auth deadlock on page refresh** — race condition between getSession() and onAuthStateChange in AuthContext causing infinite loading spinner and unexpected logout (commit e48f4fa)
- **Syntax error in AuthContext.jsx** — ')' expected on line 239 (commit from 935b2328 session)
- **Authentication redirect loop** — local dev was incorrectly redirecting to production Supabase URLs
- **Production post creation failures** — events, news, and projects silently failed to persist due to missing JWT in INSERT + incorrect RLS (commit df31f22)

### Changed
- Extended Supabase query timeout to handle cold starts
- Added abort controller to getSession() to prevent deadlock
- Supabase redirect URLs now isolated between local and production

---

## [0.8.0] - 2026-03-07

### Added
- **Expired item styling** — faded/grayed visual treatment for events, programs, projects past their end date
- More detailed information about the Volunteer Club (Hero + About sections)

### Fixed
- **Protected route logic** — redirect loop for unauthenticated users resolved

---

## [0.7.0] - 2026-02-26

### Fixed
- **Vite chunk size warnings** — chunks exceeded 500kB limit; implemented React lazy() + Suspense and vite manualChunks. chunkSizeWarningLimit raised to 1400.
- **ErrorPage double import** — was both statically and dynamically imported; removed lazy() from App.jsx

---

## [0.6.0] - 2026-02-10

### Added
- **Partners section** — partner logos grid with admin CRUD
- **Volunteer Dashboard** — activity, impact metrics, membership management, badge display
- **Impact section** — animated statistics on home page (total volunteers, events, programs, beneficiaries)

---

## [0.5.0] - 2026-02-09

### Added
- **Branches component** — Leaflet interactive map, city filtering, branch cards, admin add/edit/delete modal
- **Programs page** — program cards with detail modals, registration/cancellation, admin management
- **Projects page** — project cards with support/cancellation, admin management
- **Events page** — event listing, registration, attendee management, calendar view
- **News page** — news articles with search, pinning, filtering, pagination
- **Gamification Hub** — user points, badges, leaderboard, admin point-awarding tool
- **Notification Bell** — real-time notifications via Supabase realtime subscriptions
- **Logout animation** — smooth logout transition component
- **Membership renewal modal** — online (Stripe), bank transfer, cash payment options
- **AttendeesList component** — admin view of event attendees

---

## [0.4.0] - 2026-02-08

### Added
- **Donation system** — full Stripe CardElement + PayPal PayPalButtons + bank transfer UI
- **DonationsList component** — admin view of all donations with status
- **Stripe + PayPal** npm dependencies and environment configuration
- **StripeCheckout component** — payment intent flow with Netlify function backend

---

## [0.3.0] - 2026-02-06 to 2026-02-07

### Added
- **Admin Dashboard** — comprehensive tabs: news, events, programs, projects, testimonials, partners, team, community, donations, branches, admins
- **Role-based permissions system** — granular per-admin permissions (manage_news, manage_events, manage_programs, manage_projects, manage_testimonials, manage_partners, manage_users, manage_donations, manage_branches, super_admin)
- **Admin invitation** — invite admins by email, set permissions
- **Community management** — view/manage user profiles, event attendance
- **PostList component** — paginated admin content list with filters
- **Error handling** — ErrorBoundary, ErrorPage, global error catch
- **Header & Footer** — full navigation with language switcher, theme toggle, auth-aware links

---

## [0.2.0] - 2026-01-31

### Added
- **Authentication system** — Supabase Auth with email/password and Google OAuth
- **AuthContext** — global session management, login/logout, profile fetching, hasPermission()
- **DataContext** — centralized CRUD for news, events, programs, projects, testimonials, partners, gallery
- **User Profile page** — edit info, Arabic name field, avatar upload (Supabase Storage), membership history, badge display, account deletion
- **Signup page** — registration form with role selection
- **Protected routes** — ProtectedRoute component for role-based access
- **RequestAdminModal** — users can request admin status
- **BadgeDisplay component** — user badge calculation and display
- **Supabase authentication context** — session handling, profile syncing, JWT management
- Initial test infrastructure (Vitest + @testing-library/react + jsdom)

---

## [0.1.0] - 2026-01-26 to 2026-01-30

### Added
- **Core application structure** — React 19 + Vite 7 + Tailwind CSS 4 + React Router v7
- **Home page sections** — Hero, Mission, Programs preview, Impact, Branches, News, GetInvolved, About, Team, Partners, Testimonials, Contact, Newsletter
- **Trilingual i18n system** — 2500+ translation keys for Arabic (RTL), French, English in src/translations.js
- **Dark/Light mode** — persistent theme with ThemeToggle component
- **Responsive Header** — desktop nav, mobile hamburger menu, language selector, auth buttons
- **Footer** — quick links, how to help, contact info, social links
- **LanguageContext** — language persistence in localStorage
- **Netlify SPA routing** — netlify.toml with redirect rule for React Router
- **README** — comprehensive project overview, features, tech stack, setup guide
- **Live deployment** — Netlify with status badge

---

## [0.0.1] - 2025-12-04

### Added
- Initial commit: Complete website migration and enhancements from previous version

[1.0.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/Bosaj/les-ambassadeurs-web/releases/tag/v0.0.1
