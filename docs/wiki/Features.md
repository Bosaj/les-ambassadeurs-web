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
* **Membership Renewal (`/membership`)**: Digital commitment signing and online/offline renewal workflows.

---

## 🛡️ 3. Admin Dashboard (`/dashboard/admin`)

* 12 Dedicated control tabs for news, events, programs, projects, gallery, partners, users, memberships, donations, testimonials, branches, and admins.
* Granular Role-Based Access Control enforcing strict permission checks before write operations.
