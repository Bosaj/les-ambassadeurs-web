# Complete Application Features

A full directory of all features across the public portal, volunteer dashboard, and administrative back-office.

---

## 🌍 1. Public Portal (`https://a-a-b-v.netlify.app/`)

* **Hero Section**: Call-to-actions for donations, volunteering, and mission discovery.
* **Mission & Values**: Overview of solidarity, youth empowerment, and humanitarian aid in Oujda.
* **Programs & Projects**: Filterable project cards with progress bars and registration modals.
* **Impact Metrics**: Real-time animated counters for volunteers, activities, and beneficiaries.
* **Branches Map**: Leaflet interactive map with pins for association chapters across Morocco.
* **News & Announcements**: Articles with search, category filtering, and pinned updates.
* **Team Showcase**: Interactive carousel highlighting association leaders and coordinators.
* **Partners & Sponsors**: Partner logo wall with external links.
* **Testimonials**: Community feedback and beneficiary reviews with 1–5 star ratings.
* **Photo Gallery**: Masonry photo grid, category filters, full-screen lightbox, and home page marquee.
* **Multi-Gateway Donation (`/donate`)**: Stripe card payment, PayPal buttons, and direct bank wire details (RIB / IBAN).
* **Contact & Social Community**: Direct inquiry form and links to Facebook, Instagram, Twitter, LinkedIn, and WhatsApp.

---

## 👤 2. Authenticated Member Features

* **User Profile (`/profile`)**: Update Latin/Arabic names, avatar upload to Supabase Storage, view membership status, and delete account.
* **Volunteer Dashboard (`/dashboard/volunteer`)**: Track registered activities, personal impact stats, and download digital membership cards.
* **Gamification Hub (`/gamification`)**: Volunteer score points, activity badges, and community leaderboard.
* **Membership Renewal (`/membership`)**: Digital commitment signing and online/offline renewal workflows. Annual membership fee: **100 DH** (defined in `src/lib/membership.js`).

---

## 🛡️ 3. Admin Dashboard (`/dashboard/admin`)

* 12 Dedicated control tabs for news, events, programs, projects, gallery, partners, users, memberships, donations, testimonials, branches, and admins.
* Granular Role-Based Access Control enforcing strict permission checks before write operations.

## 🏆 Gamification & Recognition (`/gamification`)

Points are earned automatically, once per activity, and only after the team verifies it:

| Activity | Points |
| --- | --- |
| Event participation confirmed by an admin | +20 |
| Donation verified by an admin | +10 (flat, the amount does not buy rank) |
| Annual membership paid | +50 per year |
| Special recognition by an admin (with a reason, never to oneself) | 10–100 |

**Levels:** Newcomer (0), Helper (50), Volunteer (100), Active Volunteer (200), Ambassador (500), Champion (1000).

**Badges** (earned automatically, with a notification): First Step (1 event), Regular Volunteer (5), Community Pillar (20), Supporter (1 verified donation), Official Member (1 paid year), Loyal Member (3 years), Rising Star (200 pts), Ambassador of Good (1000 pts).

The leaderboard (all-time and this month) lists volunteers and members only (admins are excluded) and shows names as "Firstname L.". Undoing a verification removes the points it granted.
