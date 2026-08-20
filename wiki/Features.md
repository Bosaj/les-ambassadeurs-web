# Complete Feature Specifications

A detailed guide to all user-facing, authenticated, and administrative capabilities in the application.

---

## 🌐 1. Public Features

* **Home Page Landing Sections**:
  * **Hero**: Dynamic call-to-actions, donation buttons, volunteer onboarding links.
  * **Mission & Vision**: Core pillars of the association.
  * **Interactive Programs Preview**: Highlighted community initiatives with detail modals.
  * **Impact Counters**: Animated statistics for volunteers, events, and beneficiaries.
  * **Interactive Branches Map**: Leaflet map showing association branches across Moroccan cities.
  * **Latest News**: Searchable, filterable news cards.
  * **Team Showcase**: Interactive carousel displaying association leadership.
  * **Partners Grid**: Partner and sponsor logo wall.
  * **Testimonials**: Community reviews and feedback.
  * **Gallery Marquee**: Auto-scrolling infinite photo preview.
  * **Contact & Newsletter**: Direct inquiry form and newsletter subscription.

* **Photo Gallery (`/gallery`)**:
  * Filter by category (*All*, *Events*, *Projects*, *Programs*, *General*).
  * Instant search bar filtering by caption in the user's active language.
  * Responsive masonry grid.
  * Full-screen lightbox with keyboard navigation.

* **Multi-Channel Donation (`/donate`)**:
  * Online Credit/Debit card checkout powered by Stripe.
  * PayPal Smart Payment buttons (Sandbox & Live).
  * Association Bank Account wire transfer details (RIB / IBAN).

---

## 👤 2. Authenticated Member Features

* **Profile Management (`/profile`)**:
  * Edit Latin name, Arabic name (`full_name_ar`), phone number, and city.
  * Upload custom profile avatar stored in Supabase Storage `avatars` bucket.
  * Account deletion with safety confirmation modal.

* **Volunteer Dashboard (`/dashboard/volunteer`)**:
  * Personal impact metrics and logged volunteer hours.
  * Membership status tracker (`pending`, `active`, `rejected`).
  * Digital membership card and renewal workflows.

* **Gamification Hub (`/gamification`)**:
  * User score points and badges display.
  * Real-time volunteer leaderboard.

---

## 🛡️ 3. Administrative Back-Office (`/dashboard/admin`)

* 12 Dedicated Management Tabs.
* Granular permission checking before executing actions.
* Real-time search and filter controls across all tabular data.

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Official Documentation for Association des Ambassadeurs du Bien — Oujda*

</div>
