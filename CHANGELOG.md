# Changelog

All notable changes to **Les Ambassadeurs du Bien** web application are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-03-28

### Added
- **Photo Gallery** — Full gallery page (/gallery) with masonry grid, category filtering (Events/Projects/Programs/General), search, and image lightbox
- **Gallery Preview** — Auto-scrolling infinite marquee section on the home page with placeholder images fallback
- **Gallery Admin Management** — Admin dashboard tab for full CRUD: upload images, add multilingual captions, link to events/projects/programs
- **Supabase gallery_images table** — With RLS policies (public read, admin write), JSONB captions for multilingual support, is_featured flag
- **Gallery route** — /gallery added to React Router with lazy loading
- **Header & Footer gallery links** — Desktop and mobile navigation updated
- **DevOps** — GitHub Actions CI/CD (ci.yml, release.yml, security-scan.yml), GitHub wiki, comprehensive documentation

### Fixed
- Gallery marquee animation broken in Arabic (RTL) mode — replaced JS rAF loop with CSS keyframe animation
- Unused imports (useCallback, Link) in GalleryPage.jsx
- Accessibility: marquee items replaced <div onClick> with proper <Link> elements

---

## [0.9.0] - 2026-03-22

### Fixed
- **Auth deadlock on page refresh** — Race condition between getSession() and onAuthStateChange causing infinite loading and unexpected logouts
- **Authentication redirect loop** — Local development was incorrectly redirecting to production Supabase URLs
- **Syntax error** in AuthContext.jsx line 239

### Changed
- Extended Supabase query timeout to handle cold starts
- Added abort controller to getSession() call
- Configured Supabase redirect URLs to isolate local development from production

---

## [0.8.0] - 2026-03-07

### Added
- **Expired item styling** — Faded/grayed visual treatment for events, programs, and projects past their end date
- **Protected route logic improvements** — More robust role-based route guarding

### Fixed
- Protected route redirect loop for unauthenticated users

---

## [0.7.0] - 2026-02-26

### Fixed
- **Vite chunk size warnings** — Implemented manualChunks and React lazy() splitting, reducing Home chunk from 321kB
- **ErrorPage double import** — Removed conflicting dynamic import; ErrorPage is now statically imported only (used by ErrorBoundary)

---

## [0.6.0] - 2026-02-10

### Added
- **Branches component** — Interactive map with Leaflet, city filtering, branch cards, admin management modal
- **Partners section** — Partner logo grid with admin CRUD
- **Volunteer Dashboard** — Impact metrics, activity history, membership management
- **Impact section** — Animated statistics counters on the home page

---

## [0.5.0] - 2026-02-09

### Added
- **Donation system** — Full Stripe and PayPal integration with bank transfer option
- **Gamification Hub** — User points, badges, leaderboard, admin point-awarding tool
- **Membership management** — Renewal modal with online/bank/cash payment options, admin request approval
- **Programs & Projects pages** — Dedicated pages with registration, support, cancellation
- **Events page** — Event listing, registration, attendee management
- **News page** — News articles with search, filtering, pinning
- **Notification system** — Real-time notification bell with Supabase subscriptions
- **User Profile page** — Edit personal info, avatar upload, membership history, badges, account deletion

---

## [0.4.0] - 2026-02-06

### Added
- **Admin Dashboard** — Comprehensive content management for news, programs, projects, events, partners, testimonials, users, donations
- **Role-based permissions** — Granular permission system (manage_news, manage_programs, etc.)
- **Admin invitation system** — Invite new admins by email, manage permissions per admin
- **Community management** — View/manage user profiles and event attendance

---

## [0.3.0] - 2026-01-31

### Added
- **Authentication system** — Supabase Auth with email/password and Google OAuth
- **AuthContext** — Global auth state, login/logout, profile fetching, permission checks
- **DataContext** — Centralized data management for all content types
- **Signup page** — User registration with role selection
- **Protected routes** — Route guards for authenticated and role-based access

---

## [0.2.0] - 2026-01-26

### Added
- Complete home page sections: Hero, Mission, Programs, Impact, Branches, News, GetInvolved, About, Team, Partners, Testimonials, Contact, Newsletter
- Multilingual support (Arabic/French/English) with 2500+ translation keys
- Dark mode with persistent theme preference
- Responsive mobile menu
- Footer with quick links and contact info
- Netlify SPA routing configuration

---

## [0.1.0] - 2025-12-04

### Added
- Initial project scaffolding: React 19 + Vite 7 + Tailwind CSS 4
- Core application structure with React Router v7
- Supabase client configuration
- Initial component library

[1.0.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Bosaj/les-ambassadeurs-web/releases/tag/v0.1.0
