import { describe, it, expect } from 'vitest';
import { getLocalizedContent } from '../utils/languageUtils';

describe('getLocalizedContent', () => {
    it('returns empty string for null/undefined content', () => {
        expect(getLocalizedContent(null)).toBe('');
        expect(getLocalizedContent(undefined)).toBe('');
    });

    it('returns the string itself if content is a string', () => {
        expect(getLocalizedContent('Hello')).toBe('Hello');
    });

    it('returns content in requested language', () => {
        const content = { en: 'Hello', fr: 'Bonjour', ar: 'مرحبا' };
        expect(getLocalizedContent(content, 'fr')).toBe('Bonjour');
        expect(getLocalizedContent(content, 'ar')).toBe('مرحبا');
    });

    it('falls back to English if requested language is missing', () => {
        const content = { en: 'Hello', fr: 'Bonjour' };
        expect(getLocalizedContent(content, 'es')).toBe('Hello');
    });

    it('falls back to first available value if English is missing', () => {
        const content = { fr: 'Bonjour' };
        expect(getLocalizedContent(content, 'en')).toBe('Bonjour');
    });
});
