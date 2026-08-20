# Gallery Management & Marquee Engine

The photo gallery system delivers both a dedicated visual explorer (`/gallery`) and an interactive home page preview marquee (`GalleryPreview.jsx`).

---

## 🖼️ Upload & Management Workflow

1. **Upload Process**:
   * Admin navigates to **Admin Dashboard > Gallery**.
   * Clicks **Add Image**.
   * Enters image URL or uploads a photo file to the Supabase `gallery` storage bucket.
   * Fills in captions in Arabic, French, and English.
   * Selects category: `event`, `project`, `program`, or `general`.
   * Optionally links the photo to an existing Event, Project, or Program.
   * Checks **Featured** if the image should appear in the home page auto-scrolling marquee.

2. **Database Schema (`gallery_images`)**:
   * `id`: UUID Primary Key.
   * `image_url`: Direct public HTTPS URL.
   * `caption`: JSONB object `{"ar": "...", "fr": "...", "en": "..."}`.
   * `related_type`: Category identifier string.
   * `related_item_id`: Optional UUID foreign key to associated event/program.
   * `is_featured`: Boolean flag for homepage marquee visibility.
   * `created_at`: Timestamp with timezone.

3. **Infinite Marquee Engine**:
   * Powered by CSS keyframes (`translateX(0)` to `translateX(-50%)`).
   * The outer container enforces `dir="ltr"` so the animation scroll direction is stable regardless of whether the site language is Arabic (RTL) or French/English (LTR).
   * Hovering over any photo pauses the marquee for accessibility.
