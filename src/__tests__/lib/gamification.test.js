import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getLevel, badgeProgress, localized, describeHistory, localizeNotification, POINT_RULES, LEVELS } from '../../lib/gamification';
import { translations } from '../../translations';

describe('getLevel', () => {
    it('starts at Newcomer with progress toward Helper', () => {
        expect(getLevel(0)).toMatchObject({ level: { id: 'newcomer' }, next: { id: 'helper' }, progress: 0, pointsToNext: 50 });
        expect(getLevel(25)).toMatchObject({ level: { id: 'newcomer' }, progress: 50, pointsToNext: 25 });
    });

    it('moves up exactly at round thresholds', () => {
        expect(getLevel(50).level.id).toBe('helper');
        expect(getLevel(100).level.id).toBe('volunteer');
        expect(getLevel(200).level.id).toBe('active');
        expect(getLevel(500).level.id).toBe('ambassador');
        expect(getLevel(1000).level.id).toBe('champion');
    });

    it('caps at the highest level', () => {
        expect(getLevel(5000)).toMatchObject({ level: { id: 'champion' }, next: null, progress: 100, pointsToNext: 0 });
    });

    it('treats bad input as 0', () => {
        expect(getLevel(undefined).level.id).toBe('newcomer');
        expect(getLevel(-30).level.id).toBe('newcomer');
    });

    it('uses round numbers only', () => {
        for (const l of LEVELS) expect(l.min % 10).toBe(0);
        for (const r of POINT_RULES) expect(r.points % 10).toBe(0);
    });
});

describe('badgeProgress', () => {
    const regular = { criteria_type: 'events', threshold: 5 };

    it('reports partial progress', () => {
        expect(badgeProgress(regular, { events: 2 })).toEqual({ value: 2, threshold: 5, percent: 40, done: false });
    });

    it('clamps when exceeded', () => {
        expect(badgeProgress(regular, { events: 9 })).toEqual({ value: 5, threshold: 5, percent: 100, done: true });
    });

    it('handles membership years and points', () => {
        expect(badgeProgress({ criteria_type: 'membership_years', threshold: 3 }, { membership_years: 1 }).percent).toBe(33);
        expect(badgeProgress({ criteria_type: 'points', threshold: 200 }, { points: 200 }).done).toBe(true);
    });
});

describe('localized', () => {
    it('picks the language, then falls back', () => {
        const f = { ar: 'داعم', en: 'Supporter' };
        expect(localized(f, 'ar')).toBe('داعم');
        expect(localized(f, 'fr')).toBe('Supporter');
        expect(localized(null, 'en', 'x')).toBe('x');
        expect(localized('plain', 'fr')).toBe('plain');
    });
});

describe('point rules match the database triggers', () => {
    const sql = fs.readFileSync(
        path.join(globalThis.process.cwd(), 'supabase/migrations/20260926100000_fair_gamification.sql'),
        'utf8'
    );
    const rule = (id) => POINT_RULES.find(r => r.id === id).points;

    it('event, donation and membership values are the ones granted in SQL', () => {
        expect(sql).toContain(`grant_points(uid, ${rule('event')}, 'event'`);
        expect(sql).toContain(`grant_points(uid, ${rule('donation')}, 'donation'`);
        expect(sql).toContain(`grant_points(new.user_id, ${rule('membership')}, 'membership'`);
    });

    it('manual recognition is capped at the advertised maximum', () => {
        expect(sql).toContain(`abs(p_amount) > ${rule('recognition')}`);
    });
});

describe('describeHistory', () => {
    const ar = translations.ar;
    const fr = translations.fr;

    it('translates automatic entries instead of showing the stored English text', () => {
        const donation = { source_type: 'donation', description: 'Verified donation' };
        expect(describeHistory(donation, ar, 'ar')).toBe('تبرع تم التحقق منه');
        expect(describeHistory(donation, fr, 'fr')).toBe('Don vérifié');

        const membership = { source_type: 'membership', source_id: '2025', description: 'Annual membership 2025' };
        expect(describeHistory(membership, ar, 'ar')).toBe('واجب الانخراط السنوي 2025');
        expect(describeHistory(membership, fr, 'fr')).toBe('Cotisation annuelle 2025');
    });

    it('uses the event title in the reader language', () => {
        const ev = { source_type: 'event', event_title: { ar: 'قافلة الشتاء', en: 'Winter caravan', fr: "Caravane d'hiver" } };
        expect(describeHistory(ev, ar, 'ar')).toBe('المشاركة في نشاط: قافلة الشتاء');
        expect(describeHistory(ev, fr, 'fr')).toBe("Participation à un événement: Caravane d'hiver");
    });

    it('keeps admin-written reasons behind a translated label', () => {
        expect(describeHistory({ source_type: null, action_type: 'bonus', description: 'Thank you' }, ar, 'ar')).toBe('تقدير خاص: Thank you');
        expect(describeHistory({ source_type: 'manual', action_type: 'volunteer', description: 'ACTIF' }, fr, 'fr')).toBe('Bénévolat: ACTIF');
        expect(describeHistory({ action_type: 'referral', description: '' }, fr, 'fr')).toBe('Parrainage');
    });

    it('has every history label in all three languages', () => {
        for (const lang of ['ar', 'en', 'fr']) {
            for (const k of ['event', 'donation', 'membership', 'recognition', 'volunteer', 'referral', 'correction']) {
                expect(translations[lang][`gam_hist_${k}`], `${lang}.gam_hist_${k}`).toBeTruthy();
            }
            expect(translations[lang].gam_new_badge).toBeTruthy();
        }
    });
});

describe('localizeNotification', () => {
    const badge = {
        title: 'New badge: Supporter', message: 'Made a verified donation.',
        meta: { kind: 'badge', badge_id: 'supporter', name: { ar: 'داعم', en: 'Supporter', fr: 'Soutien' }, description: { ar: 'قدّم تبرعاً تم التحقق منه.', fr: 'A fait un don vérifié.' } },
    };

    it('translates badge notifications', () => {
        expect(localizeNotification(badge, translations.ar, 'ar')).toEqual({ title: 'شارة جديدة: داعم', message: 'قدّم تبرعاً تم التحقق منه.' });
        expect(localizeNotification(badge, translations.fr, 'fr')).toEqual({ title: 'Nouveau badge: Soutien', message: 'A fait un don vérifié.' });
    });

    it('leaves other notifications untouched', () => {
        const n = { title: 'Admin Invitation', message: 'Hello' };
        expect(localizeNotification(n, translations.ar, 'ar')).toEqual({ title: 'Admin Invitation', message: 'Hello' });
    });
});
