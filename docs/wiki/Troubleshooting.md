# Troubleshooting & Technical FAQ

A reference guide for diagnosing and fixing issues in local development and production.

---

## 🔐 1. Authentication & Session Handling

### Issue: Page refresh triggers infinite loading spinner or unexpected logout
* **Root Cause**: GoTrue client internal mutex lock deadlocked during StrictMode mounts or Supabase cold starts.
* **Fix**: The application uses direct native REST API calls with the session token in `AuthContext.jsx`. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are defined in `.env`.

---

## 🖼️ 2. Gallery & Media

### Issue: Uploaded photos return 403 Forbidden or broken images
* **Fix**: Ensure the `gallery` and `avatars` buckets in Supabase Storage have **Public Bucket** enabled with public `SELECT` policies.

### Issue: Marquee animation snaps or stops in Arabic mode
* **Fix**: `GalleryPreview.jsx` enforces `dir="ltr"` on the overflow wrapper while keeping inner cards localized.

---

## 📦 3. Build & Vite

### Issue: `SyntaxError: Unexpected token '﻿'` during build
* **Fix**: Remove UTF-8 BOM from `package.json` using Node.js `fs.writeFileSync`.

### Issue: Vitest cannot find setup file
* **Fix**: Ensure `vite.config.js` sets `setupFiles: './src/tests/setup.js'`.
