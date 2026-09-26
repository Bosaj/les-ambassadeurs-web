import React, { useEffect, useState } from 'react';
import {
    FaNewspaper, FaCalendarPlus, FaHandHoldingHeart, FaUsers, FaComments, FaUserShield, FaClock,
    FaCalendarCheck, FaMoneyBillWave, FaIdCard, FaInbox, FaExclamationTriangle, FaLightbulb,
    FaStar, FaMedal, FaTrophy, FaCheckCircle
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

const ICONS = {
    FaNewspaper, FaCalendarPlus, FaHandHoldingHeart, FaUsers, FaComments, FaUserShield,
    FaCalendarCheck, FaMoneyBillWave, FaIdCard, FaInbox, FaExclamationTriangle, FaLightbulb, FaStar, FaMedal
};
const Icon = ({ name, className }) => {
    const C = ICONS[name] || FaStar;
    return <C className={className} />;
};

// Action items shown in the "Needs attention" list: [todo key, label key, fallback, icon, tab, sub-view]
const TODO_ITEMS = [
    ['attendance_to_confirm', 'todo_attendance', 'Attendance to confirm (past events)', 'FaCalendarCheck', 'users', 'attendance'],
    ['membership_requests', 'todo_membership_requests', 'Membership requests', 'FaIdCard', 'memberships'],
    ['membership_payments', 'todo_membership_payments', 'Membership payments to verify', 'FaMoneyBillWave', 'memberships'],
    ['donations', 'todo_donations', 'Donations to verify', 'FaHandHoldingHeart', 'donations'],
    ['admin_requests', 'todo_admin_requests', 'Admin access requests', 'FaUserShield', 'admins'],
    ['testimonials', 'todo_testimonials', 'Testimonials to review', 'FaComments', 'testimonials'],
    ['suggestions', 'todo_suggestions', 'Event suggestions', 'FaLightbulb', 'inbox'],
    ['reports', 'todo_reports', 'Problem reports', 'FaExclamationTriangle', 'inbox'],
];

const Kpi = ({ icon, label, value, sub, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className={`p-3 rounded-full text-white ${color}`}><Icon name={icon} className="text-xl" /></div>
        <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
            {sub && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sub}</p>}
        </div>
    </div>
);

const DashboardOverview = ({ t, news, events, projects, onNavigate, onAdd, language }) => {
    const [overview, setOverview] = useState(null);
    const [top, setTop] = useState([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [{ data, error: e1 }, { data: board }] = await Promise.all([
                supabase.rpc('get_admin_overview'),
                supabase.rpc('get_leaderboard', { p_period: 'all', p_limit: 5 }),
            ]);
            if (cancelled) return;
            if (e1) { console.error('Error loading overview:', e1); setError(true); return; }
            setOverview(data);
            setTop(board || []);
        })();
        return () => { cancelled = true; };
    }, []);

    const dh = t.currency_mad || 'DH';
    const m = overview?.members || {};
    const money = overview?.money || {};
    const ev = overview?.events || {};
    const todo = overview?.todo || {};
    const g = overview?.gamification || {};
    const openTodos = TODO_ITEMS.filter(([key]) => (todo[key] || 0) > 0);

    const allActivity = [
        ...(news || []).map(i => ({ ...i, displayType: t.news || 'News' })),
        ...(events || []).map(i => ({ ...i, displayType: t.tab_events || 'Event' })),
        ...(projects || []).map(i => ({ ...i, displayType: t.manage_projects || 'Project' }))
    ].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)).slice(0, 5);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* KPIs */}
            {error ? (
                <p className="text-red-500 text-sm">{t.overview_load_error || 'Could not load the overview.'}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="admin-kpis">
                    <Kpi icon="FaUsers" color="bg-blue-600" label={t.kpi_members || 'Members'}
                        value={overview ? m.total : '…'}
                        sub={overview && `+${m.new_30d} ${t.kpi_last_30_days || 'in the last 30 days'} · ${m.admins} ${t.kpi_admins || 'admins'}`} />
                    <Kpi icon="FaIdCard" color="bg-green-600" label={t.kpi_paid_members || 'Paid members this year'}
                        value={overview ? m.paid_this_year : '…'}
                        sub={overview && `${Number(money.memberships_this_year).toLocaleString()} ${dh}`} />
                    <Kpi icon="FaHandHoldingHeart" color="bg-pink-600" label={t.kpi_donations || 'Verified donations'}
                        value={overview ? `${Number(money.donations_verified).toLocaleString()} ${dh}` : '…'}
                        sub={overview && `${Number(money.donations_verified_this_year).toLocaleString()} ${dh} ${t.kpi_this_year || 'this year'}`} />
                    <Kpi icon="FaCalendarCheck" color="bg-purple-600" label={t.kpi_events || 'Events'}
                        value={overview ? `${ev.upcoming} ${t.kpi_upcoming || 'upcoming'}` : '…'}
                        sub={overview && `${ev.confirmed}/${ev.registrations} ${t.kpi_participations_confirmed || 'participations confirmed'}`} />
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Needs attention */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <FaUserShield className="text-yellow-500" /> {t.needs_attention || 'Needs attention'}
                    </h3>
                    {overview && openTodos.length === 0 ? (
                        <p className="flex items-center gap-2 text-green-600 font-medium py-6 justify-center">
                            <FaCheckCircle /> {t.all_caught_up || 'All caught up — nothing is waiting for you.'}
                        </p>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                            {openTodos.map(([key, labelKey, fallback, icon, tab, view]) => (
                                <button
                                    key={key}
                                    data-testid={`todo-${key}`}
                                    onClick={() => onNavigate(tab, view)}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition text-start"
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="p-2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"><Icon name={icon} /></span>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t[labelKey] || fallback}</span>
                                    </span>
                                    <span className="text-xl font-bold text-red-600">{todo[key]}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top volunteers */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                        <FaTrophy className="text-yellow-500" /> {t.leaderboard || 'Leaderboard'}
                    </h3>
                    {overview && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            {g.points_awarded} {t.points || 'pts'} · {g.badges_earned} <FaMedal className="inline text-yellow-500" />
                        </p>
                    )}
                    <ol className="space-y-2">
                        {top.map(row => (
                            <li key={row.user_id} className="flex items-center gap-3 text-sm">
                                <span className="w-6 text-center font-bold text-gray-500">{row.rank}</span>
                                <span className="flex-1 truncate dark:text-white">
                                    {(language === 'ar' && row.display_name_ar) ? row.display_name_ar : row.display_name}
                                    {row.role === 'admin' && <span className="ms-2 text-[10px] font-bold uppercase bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">{t.role_admin_tag || 'Admin'}</span>}
                                </span>
                                <span className="font-semibold text-blue-700 dark:text-blue-300">{row.points}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>

            {/* Quick actions */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t.quick_actions || 'Quick actions'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        ['news', 'FaNewspaper', t.add_news || 'Add News', 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'],
                        ['events', 'FaCalendarPlus', t.add_event || 'Add Event', 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800'],
                        ['programs', 'FaCalendarPlus', t.add_program || 'Add Program', 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'],
                        ['projects', 'FaHandHoldingHeart', t.add_project || 'Add Project', 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800'],
                    ].map(([type, icon, label, cls]) => (
                        <button key={type} onClick={() => onAdd(type)} className={`p-4 rounded-xl transition flex flex-col items-center gap-2 border hover:shadow-md ${cls}`}>
                            <Icon name={icon} className="text-2xl" />
                            <span className="font-medium text-sm">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <FaClock className="text-blue-500" /> {t.recent_activity || 'Recent activity'}
                </h3>
                <div className="space-y-2">
                    {allActivity.length > 0 ? allActivity.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-200" loading="lazy" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                    {item.title?.[language] || item.title?.en || item.title?.fr || item.title?.ar || (typeof item.title === 'string' ? item.title : t.untitled || 'Untitled')}
                                </p>
                                <p className="text-xs text-gray-500">{item.displayType} · {new Date(item.created_at || item.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )) : <p className="text-center py-8 text-gray-500">{t.no_recent_activity || 'No recent activity'}</p>}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
