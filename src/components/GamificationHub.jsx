import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import {
    FaTrophy, FaStar, FaLock, FaCheckCircle, FaMedal, FaAward, FaHandHoldingHeart,
    FaCrown, FaRocket, FaShieldAlt, FaUsers, FaCalendarCheck, FaIdCard, FaInfoCircle, FaHistory
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { POINT_RULES, LEVELS, getLevel, badgeProgress, localized, describeHistory } from '../lib/gamification';

// Curated map of icon names usable as badge icons.
// Avoids `import * as FaIcons` which pulls in all 1000+ FA icons.
const ICONS = {
    FaTrophy, FaStar, FaMedal, FaAward, FaCrown, FaRocket, FaShieldAlt, FaUsers,
    FaCalendarCheck, FaHandHoldingHeart, FaCheckCircle, FaIdCard, FaLock
};

const LEVEL_FALLBACK = {
    newcomer: 'Newcomer', helper: 'Helper', volunteer: 'Volunteer',
    active: 'Active Volunteer', ambassador: 'Ambassador', champion: 'Champion'
};

const RULE_FALLBACK = {
    event: 'Take part in an event (confirmed by the team)',
    donation: 'Make a donation (once verified)',
    membership: 'Pay your annual membership',
    recognition: 'Special recognition from the team'
};

const Icon = ({ name, className }) => {
    const C = ICONS[name] || FaAward;
    return <C className={className} />;
};

const GamificationHub = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(null);
    const [badges, setBadges] = useState([]);
    const [period, setPeriod] = useState('all');
    const [leaderboard, setLeaderboard] = useState([]);

    const levelName = (id) => t[`level_${id}`] || LEVEL_FALLBACK[id];
    const dateFmt = (d) => new Date(d).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-GB');

    const loadProgress = useCallback(async () => {
        const [{ data: prog, error: progError }, { data: defs, error: defsError }] = await Promise.all([
            supabase.rpc('get_my_progress'),
            supabase.from('badge_definitions').select('*').not('criteria_type', 'is', null).order('sort_order')
        ]);
        if (progError) throw progError;
        if (defsError) throw defsError;
        setProgress(prog);
        setBadges(defs || []);
    }, []);

    const loadLeaderboard = useCallback(async (p) => {
        const { data, error } = await supabase.rpc('get_leaderboard', { p_period: p, p_limit: 10 });
        if (error) throw error;
        setLeaderboard(data || []);
    }, []);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                await loadProgress();
            } catch (error) {
                console.error('Error fetching gamification data:', error);
                if (!cancelled) toast.error(t.gam_load_error || 'Failed to load gamification data.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [user, loadProgress, t]);

    useEffect(() => {
        if (!user) return;
        loadLeaderboard(period).catch((error) => {
            console.error('Error fetching leaderboard:', error);
            toast.error(t.gam_load_error || 'Failed to load gamification data.');
        });
    }, [user, period, loadLeaderboard, t]);

    if (loading || !progress) {
        return <div className="p-8 text-center dark:text-gray-300">{t.loading_gamification || 'Loading Gamification Hub...'}</div>;
    }

    const points = progress.points || 0;
    const lvl = getLevel(points);
    const earned = new Map((progress.badges || []).map(b => [b.id, b]));
    const isAdmin = user?.role === 'admin';

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8">
            {/* Header: level, points, rank */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-1">{t.gamification_hub || 'Gamification Hub'}</h1>
                        <p className="opacity-90">{t.gam_subtitle || 'Earn points for real contributions and unlock badges.'}</p>

                        <div className="mt-5">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-semibold">{t.gam_level || 'Level'}: {levelName(lvl.level.id)}</span>
                                <span className="opacity-90">
                                    {lvl.next
                                        ? `${lvl.pointsToNext} ${t.gam_points_to || 'points to'} ${levelName(lvl.next.id)}`
                                        : (t.gam_max_level || 'Highest level reached')}
                                </span>
                            </div>
                            <div className="h-3 bg-white/20 rounded-full overflow-hidden" role="progressbar" aria-valuenow={lvl.progress} aria-valuemin={0} aria-valuemax={100}>
                                <div className="h-full bg-yellow-300 rounded-full transition-all duration-700" style={{ width: `${lvl.progress}%` }} />
                            </div>
                            <div className="flex justify-between text-[11px] opacity-75 mt-1" dir="ltr">
                                {LEVELS.map(l => <span key={l.id}>{l.min}</span>)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:w-72">
                        <div className="bg-white/15 rounded-xl p-4 text-center">
                            <p className="text-xs uppercase tracking-wider opacity-80">{t.my_points || 'My Points'}</p>
                            <p className="text-3xl font-extrabold flex items-center justify-center gap-2 mt-1">
                                <FaStar className="text-yellow-300 text-2xl" />{points}
                            </p>
                        </div>
                        <div className="bg-white/15 rounded-xl p-4 text-center">
                            <p className="text-xs uppercase tracking-wider opacity-80">{t.gam_rank || 'Rank'}</p>
                            <p className="text-3xl font-extrabold mt-1">
                                {isAdmin ? '—' : (progress.rank ? `#${progress.rank}` : '—')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6 text-center">
                    {[
                        ['events', t.gam_stat_events || 'Events', 'FaCalendarCheck'],
                        ['donations', t.gam_stat_donations || 'Donations', 'FaHandHoldingHeart'],
                        ['membership_years', t.gam_stat_years || 'Membership years', 'FaIdCard'],
                    ].map(([key, label, iconName]) => (
                        <div key={key} className="bg-white/10 rounded-lg py-3">
                            <Icon name={iconName} className="mx-auto mb-1 opacity-90" />
                            <p className="text-xl font-bold">{progress[key] || 0}</p>
                            <p className="text-xs opacity-80">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* How to earn */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2 mb-4">
                    <FaInfoCircle className="text-blue-600" /> {t.gam_how_to_earn || 'How to earn points'}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {POINT_RULES.map(rule => (
                        <div key={rule.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                            <div className="p-2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                <Icon name={rule.icon} className="text-lg" />
                            </div>
                            <div>
                                <p className="font-bold text-blue-900 dark:text-blue-300">
                                    {rule.upTo ? `${t.gam_up_to || 'up to'} ` : '+'}{rule.points} {t.points || 'pts'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{t[`gam_rule_${rule.id}`] || RULE_FALLBACK[rule.id]}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    {t.gam_fair_note || 'Points are only given for activity verified by the team, and each activity counts once. Admins are not ranked.'}
                </p>
            </section>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Badges */}
                <section className="lg:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <FaMedal className="text-yellow-500" /> {t.gam_badges || 'Badges'}
                        <span className="text-sm font-normal text-gray-500">({earned.size}/{badges.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {badges.map(badge => {
                            const got = earned.get(badge.id);
                            const prog = badgeProgress(badge, progress);
                            return (
                                <div
                                    key={badge.id}
                                    data-testid={`badge-${badge.id}`}
                                    className={`p-5 rounded-xl border-2 transition ${got
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${got ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-100 dark:bg-gray-700'}`}>
                                            <Icon name={badge.icon} className="text-2xl" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold dark:text-white">{localized(badge.name_i18n, language, badge.name)}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{localized(badge.description_i18n, language, badge.description)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        {got ? (
                                            <span className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                                                <FaCheckCircle /> {t.gam_earned_on || 'Earned on'} {dateFmt(got.claimed_at)}
                                            </span>
                                        ) : (
                                            <>
                                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    <span className="flex items-center gap-1"><FaLock /> {t.gam_locked || 'Locked'}</span>
                                                    <span dir="ltr">{prog.value} / {prog.threshold}</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${prog.percent}%` }} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Leaderboard + history */}
                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                            <FaTrophy className="text-yellow-500" /> {t.leaderboard || 'Leaderboard'}
                        </h2>
                        <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                            {[['all', t.gam_all_time || 'All time'], ['month', t.gam_this_month || 'This month']].map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setPeriod(key)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${period === key
                                        ? 'bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 shadow'
                                        : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                            {leaderboard.length === 0 ? (
                                <p className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">{t.gam_no_ranking || 'No points yet — be the first!'}</p>
                            ) : leaderboard.map((row) => (
                                <div
                                    key={row.user_id}
                                    className={`flex items-center gap-3 p-3 border-b last:border-0 dark:border-gray-700 ${row.is_me ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full font-bold text-sm ${row.rank === 1 ? 'bg-yellow-500 text-white'
                                        : row.rank === 2 ? 'bg-gray-400 text-white'
                                            : row.rank === 3 ? 'bg-orange-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                        {row.rank}
                                    </div>
                                    {row.avatar_url
                                        ? <img src={row.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                                        : <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40" />}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate dark:text-white">
                                            {(language === 'ar' && row.display_name_ar) ? row.display_name_ar : row.display_name}
                                            {row.is_me && <span className="text-xs text-blue-600 dark:text-blue-300 ms-1">({t.gam_you || 'You'})</span>}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                            <span>{row.points} {t.points || 'pts'}</span>
                                            {row.badge_count > 0 && <span className="flex items-center gap-1"><FaMedal className="text-yellow-500" />{row.badge_count}</span>}
                                        </p>
                                    </div>
                                    {row.rank === 1 && <FaCrown className="text-yellow-500" />}
                                </div>
                            ))}
                        </div>
                        {isAdmin && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.gam_admin_note || 'Admins are not ranked on the leaderboard.'}</p>
                        )}
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                            <FaHistory className="text-blue-600" /> {t.gam_history || 'My recent points'}
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 divide-y dark:divide-gray-700">
                            {(progress.history || []).length === 0 ? (
                                <p className="p-5 text-sm text-gray-500 dark:text-gray-400 text-center">
                                    {t.gam_no_history || 'No points yet. Join an event to earn your first 20 points!'}{' '}
                                    <Link to="/events" className="text-blue-600 underline">{t.gam_see_events || 'See events'}</Link>
                                </p>
                            ) : progress.history.map((h, i) => (
                                <div key={i} className="flex items-center justify-between p-3 gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate dark:text-white">{describeHistory(h, t, language)}</p>
                                        <p className="text-xs text-gray-500">{dateFmt(h.created_at)}</p>
                                    </div>
                                    <span dir="ltr" className={`font-bold text-sm ${h.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {h.amount >= 0 ? '+' : ''}{h.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default GamificationHub;
