Internationalization Guide

Languages: Arabic (RTL), French, English
Storage: localStorage
File: src/translations.js

Usage: const { t, language } = useLanguage(); then t.my_key

Adding keys: Add to ar/fr/en sections in translations.js

RTL: Use dir=rtl on containers when language===ar
Exception: Gallery marquee always uses dir=ltr to prevent animation bugs