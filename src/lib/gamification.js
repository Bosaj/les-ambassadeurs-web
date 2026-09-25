// Gamification rules shown to members. Point values mirror the database
// triggers in supabase/migrations/20260926100000_fair_gamification.sql.

export const POINT_RULES = [
    { id: 'event', points: 20, icon: 'FaCalendarCheck' },
    { id: 'donation', points: 10, icon: 'FaHandHoldingHeart' },
    { id: 'membership', points: 50, icon: 'FaIdCard' },
    { id: 'recognition', points: 100, icon: 'FaAward', upTo: true },
];

export const LEVELS = [
    { id: 'newcomer', min: 0 },
    { id: 'helper', min: 50 },
    { id: 'volunteer', min: 100 },
    { id: 'active', min: 200 },
    { id: 'ambassador', min: 500 },
    { id: 'champion', min: 1000 },
];

export function getLevel(points = 0) {
    const p = Math.max(0, Number(points) || 0);
    let index = 0;
    for (let i = 0; i < LEVELS.length; i++) {
        if (p >= LEVELS[i].min) index = i;
    }
    const current = LEVELS[index];
    const next = LEVELS[index + 1] || null;
    const progress = next ? Math.round(((p - current.min) / (next.min - current.min)) * 100) : 100;
    return {
        index,
        level: current,
        next,
        progress: Math.min(100, Math.max(0, progress)),
        pointsToNext: next ? next.min - p : 0,
    };
}

// Progress of a badge definition against the member's real stats.
export function badgeProgress(badge, stats = {}) {
    const key = {
        events: 'events',
        donations: 'donations',
        membership_years: 'membership_years',
        points: 'points',
    }[badge?.criteria_type];
    const threshold = Math.max(1, Number(badge?.threshold) || 1);
    const value = key ? Math.max(0, Number(stats[key]) || 0) : 0;
    return {
        value: Math.min(value, threshold),
        threshold,
        percent: Math.min(100, Math.round((value / threshold) * 100)),
        done: value >= threshold,
    };
}

export function localized(field, language, fallback = '') {
    if (!field) return fallback;
    if (typeof field === 'string') return field;
    return field[language] || field.en || field.fr || field.ar || fallback;
}
