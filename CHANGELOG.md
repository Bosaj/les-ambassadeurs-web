# Changelog

All notable changes to **Les Ambassadeurs du Bien — Oujda Branch** are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) | Versioning: [SemVer](https://semver.org)

---

## [Unreleased]

### Added
- **Brand identity on every page** (#138): shared `PageHeader` banner (grid paper, torn paper title, red dots) on Events, News, Programs and Donate; poster styling for Gallery, Volunteer sign-up, Membership, Profile, Volunteer dashboard, Login, Sign-up, legal pages, 404 and the footer
- **Brand theme from the 2026 Instagram identity**: navy grid-paper and red halftone-dot backgrounds, torn white paper cards, taped polaroid photos, Lalezar poster display font for headings, offset-shadow buttons; new hero, header bar, team section, Gamification Hub header and admin sidebar
- **Admin tables**: one consistent style everywhere (navy header with red rule, zebra rows, hover, rounded frame) and horizontal scrolling on phones/tablets; Community members table rebuilt with search, role filter with counts, avatar, membership status, points and level, contact and join date, and labelled action buttons

- **Admin overview** (#135): real KPIs from a single admin-only RPC (`get_admin_overview`): members (+30 days), paid members and fees this year, verified donations, events and confirmed participations; a *Needs attention* list with counts that opens the right panel (attendance to confirm, membership requests/payments, donations, admin requests, testimonials, suggestions, reports); top-5 leaderboard
- **Admin Inbox** (#135): new panel to triage problem reports (open → in progress → resolved/closed) and approve or reject event suggestions, notifying the author
- **Volunteer progress card** (#135): level, progress to next level, points, rank, badges and the closest next badge on the volunteer dashboard
- **Team 2026** (#135): the 9-member team introduced on Instagram, with a switch to the previous team
- **Admins on the leaderboard** (#135): admins are ranked with an *Admin* tag (they still cannot award points to themselves)

- **Fair gamification** (#131): points are awarded automatically and only once for admin-verified activity (confirmed event participation +20, verified donation +10, paid annual membership +50); manual recognition limited to 10–100 in steps of 10 with a reason and never to oneself; 8 real milestone badges earned automatically with a notification; levels at 0/50/100/200/500/1000; leaderboard (all-time / this month) excludes admins and shows privacy-safe names; hub shows how to earn, badge progress and point history. Existing members were credited for activity they already qualified for.
- **Deploy & Environment Status workflow** (`deploy.yml`): Netlify production deploy with deployment status reporting and a Supabase backend health check on every push to `main`
- **Publish Package workflow** (`package.yml`): builds and publishes the app to GitHub Packages on release/push to `main`

- **Production deployment status** (`deployment_status.yml`): on every push to `main`, waits for the Netlify production deploy of that commit, smoke-tests the live site, and records the result in GitHub Deployments (#129)
- **Web CI** (`web_ci.yml`): lint, unit tests, production dependency audit, and build on every push/PR to `main` (#129)
- **Real gallery**: 44 photos from four association events (Nov 2024 meeting, Feb 2025 youth trip, Feb 2025 volunteer training, Mar 2025 children's celebration), resized to 1920px with EXIF/GPS stripped, with AR/EN/FR captions (#129)
- **Tests**: admin invite, ProtectedRoute, membership fee, translations and image compression (12 → 26 tests) (#129)

### Changed
- **Branding**: replaced the site logo (header, favicon, 404 page, README banner) with the new official A.A.B.V emblem (`public/images/logo.jpg`) (#126)
- **Membership fee**: annual inscription fee raised from 50 DH to **100 DH**; the fee now lives in a single constant (`src/lib/membership.js`) shared by the renewal modal and admin history, and admin history shows each year's recorded amount (#126)
- Modernized `README.md` with live badge, architecture overview, and updated feature list
- Added global wiki `_Footer.md`, `_Sidebar.md`, `_Header.md` pages and corrected association details across the wiki

### Fixed
- Footer overflowed horizontally on tablets (long e-mail in a 4-column grid); Community "Refresh" button reloaded global data instead of the table; hero image reduced from 1.7 MB to 160 KB

- **Data standards** (#135): CHECK constraints and defaults for roles, statuses, categories, ratings, amounts and points; email-only event registrations linked to member accounts; membership payments without a method marked `manual`
- **Testimonials** (#135): admins could not see or delete pending testimonials (only approved ones were readable) and members could submit a testimonial already approved
- **Event suggestions** (#135): admins had no access at all; they can now review, approve, reject and delete them

- **Security** (#131): members could change any column of their own profile (points, badges, role, permissions — i.e. make themselves admin) and mark their own membership as paid; guard triggers and an admin-only membership update policy now prevent it. Public donations and event registrations always start as pending.
- **Leaderboard** only ever showed the viewer (profiles RLS); it now uses a privacy-safe RPC (#131)
- **Gallery upload** no longer fails with `new row violates row-level security policy`: removed `upsert` (it needs SELECT/UPDATE storage policies) and camera photos are compressed client-side instead of being rejected over 5 MB (#129)
- **Membership proof upload** pointed at a non-existent `receipts` bucket; it now uses the `donations` bucket (#129)
- **Admin invite** was a mock; it now promotes existing accounts through `make_admin_by_email`, which checks server-side that the caller holds `manage_admins` (#129)

- Sanitized image URLs in `Profile.jsx` to prevent unsafe/malformed avatar URLs from rendering
- Improved Stripe error URL pattern matching in `src/lib/stripe.js`
- Enabled Sigstore build attestations (`actions/attest-build-provenance`) in the CI build job for verifiable build provenance

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

[Unreleased]: https://github.com/Bosaj/les-ambassadeurs-web/compare/v1.0.0...HEAD
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
