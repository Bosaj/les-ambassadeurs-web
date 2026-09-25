import { describe, it, expect } from 'vitest';
import { MEMBERSHIP_FEE } from '../../lib/membership';
import { translations } from '../../translations';

describe('membership fee', () => {
    it('is 100 DH', () => {
        expect(MEMBERSHIP_FEE).toBe(100);
    });

    it('is shown as 100 in every language', () => {
        for (const lang of ['ar', 'en', 'fr']) {
            expect(translations[lang].step_pay_fee).toContain('100');
            expect(translations[lang].step_pay_fee).not.toMatch(/\b50\b/);
        }
    });
});
