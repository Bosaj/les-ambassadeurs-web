# Internationalization & RTL Guidelines

The application is built from the ground up to support three languages: **العربية (Arabic)**, **Français (French)**, and **English**.

---

## 🌐 Supported Languages & Text Directions

| Language Code | Language | Text Direction | Default Font Stack |
|---|---|---|---|
| `ar` | Arabic | **RTL** (`dir="rtl"`) | Tajawal, Cairo, system Arabic |
| `fr` | French | **LTR** (`dir="ltr"`) | Inter, system sans-serif |
| `en` | English | **LTR** (`dir="ltr"`) | Inter, system sans-serif |

---

## 📖 Adding Translation Keys

All UI translation strings reside in `src/translations.js`. When adding new strings, ensure keys are provided for all three languages:

```javascript
export const translations = {
  ar: {
    gallery_title: 'معرض الصور',
    gallery_subtitle: 'استكشف أنشطتنا ومبادراتنا بالصور'
  },
  fr: {
    gallery_title: 'Galerie Photos',
    gallery_subtitle: 'Explorez nos activités et initiatives en images'
  },
  en: {
    gallery_title: 'Photo Gallery',
    gallery_subtitle: 'Explore our activities and initiatives in pictures'
  }
};
```

---

## 📐 RTL Component Design Rules

1. **Direction Container**: The root HTML element direction is dynamically updated by `LanguageContext`:
   ```javascript
   document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
   document.documentElement.lang = language;
   ```
2. **Icons & Chevrons**: Directional arrows (e.g. `FaArrowRight`) must be rotated in RTL mode:
   ```jsx
   <FaArrowRight className={language === 'ar' ? 'rotate-180' : ''} />
   ```
3. **Marquee Exception**: The gallery marquee container MUST remain `dir="ltr"` so keyframe translations calculate from standard offsets.

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Official Documentation for Association des Ambassadeurs du Bien — Oujda*

</div>
