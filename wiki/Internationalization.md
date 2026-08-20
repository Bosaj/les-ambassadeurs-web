# Internationalization & RTL Guidelines

The application supports three official languages: **العربية (Arabic)**, **Français (French)**, and **English**.

---

## 🌐 Supported Languages & Layouts

| Code | Language | Layout Direction | Font Family |
|---|---|---|---|
| `ar` | العربية (Arabic) | **RTL** (`dir="rtl"`) | Tajawal, Cairo, system-ui |
| `fr` | Français (French) | **LTR** (`dir="ltr"`) | Inter, system-ui |
| `en` | English | **LTR** (`dir="ltr"`) | Inter, system-ui |

---

## 📖 Managing Translation Keys

All static UI strings are defined in `src/translations.js`. Keys must be provided in all three language dictionaries:

```javascript
export const translations = {
  ar: {
    gallery: 'معرض الصور',
    donate: 'تبرع الآن'
  },
  fr: {
    gallery: 'Galerie',
    donate: 'Faire un don'
  },
  en: {
    gallery: 'Gallery',
    donate: 'Donate Now'
  }
};
```

---

## 📐 RTL Styling Rules

1. **Direction State**: `LanguageContext` updates `document.documentElement.dir` and `document.documentElement.lang` on language change.
2. **Icons**: Directional icons (arrows, chevrons) must include dynamic rotation:
   ```jsx
   <FaArrowRight className={language === 'ar' ? 'rotate-180' : ''} />
   ```
3. **Marquee Exception**: The gallery marquee container MUST remain `dir="ltr"` to preserve continuous CSS translation offsets.
