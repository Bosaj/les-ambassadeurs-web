# Troubleshooting & Common Issues

A guide for diagnosing and fixing common local development and production issues.

---

## 🔐 1. Authentication & Profile Fetching

### Issue: Application hangs on "Loading..." or user gets logged out on refresh
* **Root Cause**: GoTrue client internal mutex lock deadlocked during React Strict Mode mounts or Supabase free-tier cold starts.
* **Resolution**: The application uses direct native REST API fetch with the JWT bearer token for profile retrieval in `AuthContext.jsx`. Also, ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are defined in `.env`.

---

## 🖼️ 2. Gallery & Media Storage

### Issue: Uploaded images show broken image icons
* **Root Cause**: The Supabase Storage bucket `gallery` or `avatars` is private.
* **Resolution**: In the Supabase Dashboard > Storage > Buckets, ensure the `gallery` bucket has **Public Bucket** enabled with public `SELECT` policies.

### Issue: Marquee stops scrolling in Arabic mode
* **Root Cause**: RTL container direction causes CSS `translateX` offsets to reverse outside the viewport.
* **Resolution**: `GalleryPreview.jsx` enforces `dir="ltr"` on the overflow wrapper while leaving card content localized.

---

## 📦 3. Build & Vite Optimization

### Issue: `SyntaxError: Unexpected token '﻿'` during build
* **Root Cause**: UTF-8 BOM (Byte Order Mark) inserted into `package.json` by certain Windows tools.
* **Resolution**: Ensure files are saved in UTF-8 without BOM.

### Issue: Vitest cannot find `setup.js`
* **Resolution**: Verify `setupFiles` in `vite.config.js` points to `./src/tests/setup.js`.

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Official Documentation for Association des Ambassadeurs du Bien — Oujda*

</div>
