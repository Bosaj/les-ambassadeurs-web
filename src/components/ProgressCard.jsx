import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaTrophy, FaMedal, FaArrowRight } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { getLevel, badgeProgress, localized } from '../lib/gamification';

const LEVEL_FALLBACK = {
    newcomer: 'Newcomer', helper: 'Helper', volunteer: 'Volunteer',
    active: 'Active Volunteer', ambassador: 'Ambassador', champion: 'Champion'
};

// Compact level / rank / next-badge summary for the volunteer dashboard
const ProgressCard = () => {
    const { t, language } = useLanguage();
    const [progress, setProgress] = useState(null);
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [{ data: prog }, { data: defs }] = await Promise.all([
                supabase.rpc('get_my_progress'),
                supabase.from('badge_definitions').select('*').not('criteria_type', 'is', null).order('sort_order'),
            ]);
            if (cancelled) return;
            setProgress(prog || null);
            setBadges(defs || []);
        })();
        return () => { cancelled = true; };
    }, []);

    if (!progress) return null;

    const lvl = getLevel(progress.points);
    const earned = new Set((progress.badges || []).map(b => b.id));
    const next = badges
        .filter(b => !earned.has(b.id))
        .map(b => ({ b, p: badgeProgress(b, progress) }))
        .sort((x, y) => y.p.percent - x.p.percent)[0];
    const levelName = (id) => t[`level_${id}`] || LEVEL_FALLBACK[id];

    return (
        <div className="bg-gradient-to-r from-blue-800 to-red-600 text-white rounded-2xl p-6 shadow-lg" data-testid="progress-card">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                    <p className="text-sm opacity-80">{t.gam_level || 'Level'}</p>
                    <p className="text-2xl font-extrabold">{levelName(lvl.level.id)}</p>
                    <div className="mt-3 h-2.5 bg-white/25 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-300 rounded-full" style={{ width: `${lvl.progress}%` }} />
                    </div>
                    <p className="text-xs mt-1 opacity-90">
                        {lvl.next ? `${lvl.pointsToNext} ${t.gam_points_to || 'points to'} ${levelName(lvl.next.id)}` : (t.gam_max_level || 'Highest level reached')}
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="bg-white/15 rounded-xl px-4 py-3 text-center min-w-[90px]">
                        <FaStar className="mx-auto text-yellow-300" />
                        <p className="text-2xl font-bold">{progress.points}</p>
                        <p className="text-[11px] opacity-80">{t.my_points || 'My Points'}</p>
                    </div>
                    <div className="bg-white/15 rounded-xl px-4 py-3 text-center min-w-[90px]">
                        <FaTrophy className="mx-auto text-yellow-300" />
                        <p className="text-2xl font-bold">{progress.rank ? `#${progress.rank}` : '—'}</p>
                        <p className="text-[11px] opacity-80">{t.gam_rank || 'Rank'}</p>
                    </div>
                    <div className="bg-white/15 rounded-xl px-4 py-3 text-center min-w-[90px]">
                        <FaMedal className="mx-auto text-yellow-300" />
                        <p className="text-2xl font-bold">{earned.size}/{badges.length}</p>
                        <p className="text-[11px] opacity-80">{t.gam_badges || 'Badges'}</p>
                    </div>
                </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/20 pt-4">
                {next ? (
                    <p className="text-sm">
                        <span className="opacity-80">{t.gam_next_badge || 'Next badge'}:</span>{' '}
                        <span className="font-bold">{localized(next.b.name_i18n, language, next.b.name)}</span>{' '}
                        <span className="opacity-80" dir="ltr">({next.p.value}/{next.p.threshold})</span>
                    </p>
                ) : <p className="text-sm font-semibold">{t.gam_all_badges || 'You have earned every badge!'}</p>}
                <Link to="/gamification" className="inline-flex items-center gap-2 bg-white text-blue-800 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-yellow-100 transition">
                    {t.gamification_hub || 'Gamification Hub'} <FaArrowRight className="rtl:rotate-180" />
                </Link>
            </div>
        </div>
    );
};

export default ProgressCard;
