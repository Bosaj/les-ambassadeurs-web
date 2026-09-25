import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getLevel, badgeProgress, localized, POINT_RULES, LEVELS } from '../../lib/gamification';

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
