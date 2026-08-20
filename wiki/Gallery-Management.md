# Gallery Management & Marquee Engine

The photo gallery system is split between a public browsing experience (`/gallery`), a home page preview marquee (`GalleryPreview.jsx`), and an administrative management panel (`GalleryManagement.jsx`).

---

## 🖼️ Architecture & Workflow

1. **Uploading Images**:
   * Admin navigates to **Admin Dashboard > Gallery**.
   * Clicks **Add Image**.
   * Enters the direct Image URL or uploads a file to the Supabase `gallery` storage bucket.
   * Enters multilingual captions in Arabic, French, and English.
   * Selects category (`event`, `project`, `program`, `general`).
   * (Optional) Links the image to a specific Event or Program ID.
   * (Optional) Checks **Featured** to include the image in the home page marquee.

2. **Database Storage (`gallery_images` table)**:
   ```sql
   CREATE TABLE gallery_images (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       image_url TEXT NOT NULL,
       caption JSONB DEFAULT '{"ar":"","fr":"","en":""}',
       related_type TEXT DEFAULT 'general',
       related_item_id UUID,
       is_featured BOOLEAN DEFAULT false,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
       created_by UUID REFERENCES profiles(id)
   );
   ```

3. **Infinite Marquee Engine (`GalleryPreview.jsx`)**:
   * Built with pure CSS `@keyframes marquee-scroll` (`translateX(0)` to `translateX(-50%)`).
   * Direction-agnostic: The outer container explicitly sets `dir="ltr"`, ensuring the animation loops continuously without snapping or disappearing in Arabic RTL mode.
   * Pauses animation on hover for user accessibility.

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Official Documentation for Association des Ambassadeurs du Bien — Oujda*

</div>
