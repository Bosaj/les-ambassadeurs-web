# Internationalization

## Languages Supported
| Code | Language | Direction |
|------|----------|-----------|
| ar   | Arabic   | RTL       |
| fr   | French   | LTR       |
| en   | English  | LTR       |

## Adding Translation Keys
In src/translations.js:
```javascript
ar: { my_key: 'Arabic text' },
fr: { my_key: 'French text' },
en: { my_key: 'English text' },
```Usage:
```javascript
const { t } = useLanguage();
return <p>{t.my_key}</p>;
```n
## RTL Guidelines
- Apply dir='rtl' to containers when language === 'ar'
- Gallery marquee: ALWAYS dir='ltr' (prevents animation direction bugs)
- Flip arrow icons in RTL: className={language === 'ar' ? 'rotate-180' : ''}

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Wiki last updated: 2026-08-20*

</div>
