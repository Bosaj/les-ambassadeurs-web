import { describe, it, expect } from 'vitest';
import { translations } from '../translations';

const REQUIRED = ['user_not_found', 'admin_promoted', 'invite_failed', 'invalid_image', 'send_invitation', 'logout', 'currency_mad'];

describe('translations', () => {
    it('provides ar, en and fr', () => {
        expect(Object.keys(translations)).toEqual(expect.arrayContaining(['ar', 'en', 'fr']));
    });

    it.each(['ar', 'en', 'fr'])('has non-empty required keys in %s', (lang) => {
        for (const key of REQUIRED) {
            expect(translations[lang][key], `${lang}.${key}`).toBeTruthy();
        }
    });
});
