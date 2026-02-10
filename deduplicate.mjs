
import fs from 'fs';
import { translations } from './src/translations.js';

const cleanTranslations = {
    ar: translations.ar,
    en: translations.en,
    fr: translations.fr
};

const fileContent = `export const translations = ${JSON.stringify(cleanTranslations, null, 4)};`;

fs.writeFileSync('src/translations.js', fileContent);
console.log('Translations deduplicated and overwritten.');
