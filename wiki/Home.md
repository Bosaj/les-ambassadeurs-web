# Welcome to the Official Technical Wiki

The **Association des Ambassadeurs du Bien (جمعية سفراء الخير - فرع وجدة)** web platform is a modern, full-featured web application designed for a non-profit humanitarian organization based in Oujda, Morocco.

* **Live Production Platform:** [https://a-a-b-v.netlify.app/](https://a-a-b-v.netlify.app/)
* **Official Repository:** [https://github.com/Bosaj/les-ambassadeurs-web](https://github.com/Bosaj/les-ambassadeurs-web)
* **Lead Maintainer:** Oussama ELHADJI ([LinkedIn](https://www.linkedin.com/in/oussama-elhadji))

---

## 🆕 Latest Release — v1.1.0 (2026-09-26)

**Production readiness, fair gamification, admin overhaul and the 2026 brand identity.**

* 🏆 **Fair gamification:** points only for team-verified activity (event +20, donation +10, membership +50/year), 8 automatic badges, levels, leaderboard ([[Features]])
* 🔐 **Security:** members can no longer change their own role, permissions or points ([[Security]])
* 🗂️ **Admin back-office:** live overview, *Needs attention* list, Inbox for reports and suggestions ([[Admin Guide]])
* 🎨 **2026 identity:** navy grid paper, red dots, torn paper and poster type on every page; **Team 2026** on the home page
* 💳 **Membership fee:** 100 DH per year ([[Payments]])

Full notes: [Release v1.1.0](https://github.com/Bosaj/les-ambassadeurs-web/releases/tag/v1.1.0) · [CHANGELOG](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) · [[Changelog]]

---

## 🧭 Documentation Sitemap

| Document | Key Information |
|---|---|
| 🚀 **[Getting Started](Getting-Started)** | Node.js 20+ prerequisites, environment variables setup (`.env.example`), and development server scripts. |
| 🏗️ **[Architecture](Architecture)** | React 19 SPA design, Vite 7, Context providers (`AuthContext`, `DataContext`, `LanguageContext`), Supabase PostgreSQL, and Netlify Functions. |
| ✨ **[Features](Features)** | Public landing sections, Photo Gallery with masonry grid, multi-channel donations, member profiles, and gamification leaderboard. |
| 🛡️ **[Admin Guide](Admin-Guide)** | Back-office management across 12 tabs with granular Role-Based Access Control (RBAC) permission flags. |
| 🖼️ **[Gallery Management](Gallery-Management)** | Photo upload to Supabase Storage, trilingual JSONB captions, and infinite CSS marquee engine. |
| 💳 **[Payments](Payments)** | Stripe CardElement checkout, serverless PaymentIntent creation, PayPal Smart Buttons, and bank wire transfer instructions. |
| 🌐 **[Internationalization](Internationalization)** | Arabic RTL layout support, French/English LTR layout, and `src/translations.js` key dictionary. |
| 🚀 **[Deployment](Deployment)** | Netlify hosting configuration (`netlify.toml`), environment variables, and GitHub Actions CI/CD workflows. |
| 🔧 **[Troubleshooting](Troubleshooting)** | Diagnostic steps for Supabase authentication, storage bucket access, UTF-8 BOM sanitization, and test runners. |
| 📜 **[Changelog](Changelog)** | Full timeline from initial migration (`v0.1.0`) to complete production release (`v1.0.0`). |
| 🔒 **[Security](Security)** | Security policy, vulnerability reporting (`asosoufaraelkhir48@gmail.com`), and Row Level Security (RLS) protections. |

---

## 🏛️ Association Identity & Contacts

* **Association Name:** Association des Ambassadeurs du Bien — Oujda
* **Arabic Name:** جمعية سفراء الخير - فرع وجدة
* **Official Email:** `asosoufaraelkhir48@gmail.com`
* **Social Community:**
  * Facebook: [jamiyat.safarat.khair.oujda](https://www.facebook.com/jamiyat.safarat.khair.oujda)
  * Instagram: [@goodness_ambassadors_oujda](https://www.instagram.com/goodness_ambassadors_oujda)
  * Twitter / X: [@associationabv](https://x.com/associationabv)
  * LinkedIn: [jamiyat-safarat-khair-oujda](https://www.linkedin.com/company/jamiyat-safarat-khair-oujda/)
  * WhatsApp Community: [Join WhatsApp Group](https://chat.whatsapp.com/Lmy97p5Q64H8USGhyTT0TN?mode=gi_t)
