import React, { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaLightbulb, FaCheck, FaTimes, FaTrash, FaEnvelope, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const REPORT_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

const STATUS_STYLE = {
    open: 'bg-red-100 text-red-700', in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-200 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-700', rejected: 'bg-gray-200 text-gray-600',
};

const statusLabel = (t, s) => t[`status_${s}`] || s.replace('_', ' ');

const TABS = [
    { key: 'reports', icon: FaExclamationTriangle, labelKey: 'inbox_reports', fallback: 'Problem reports' },
    { key: 'suggestions', icon: FaLightbulb, labelKey: 'inbox_suggestions', fallback: 'Event suggestions' },
];

// Admin inbox: problem reports and event suggestions sent by members
const InboxManagement = ({ t, language }) => {
    const [view, setView] = useState('reports');
    const [reports, setReports] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const errorText = t.inbox_load_error || 'Could not load the inbox';

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            supabase.from('problem_reports').select('*').order('created_at', { ascending: false }),
            supabase.from('event_suggestions').select('*').order('created_at', { ascending: false }),
        ]).then(([r, s]) => {
            if (cancelled) return;
            if (r.error || s.error) toast.error(errorText);
            setReports(r.data || []);
            setSuggestions(s.data || []);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [errorText]);

    const setReportStatus = async (id, status) => {
        const { error } = await supabase.from('problem_reports').update({ status }).eq('id', id);
        if (error) return toast.error(error.message);
        setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    };

    const decideSuggestion = async (s, status) => {
        const { error } = await supabase.from('event_suggestions').update({ status }).eq('id', s.id);
        if (error) return toast.error(error.message);
        setSuggestions(prev => prev.map(x => x.id === s.id ? { ...x, status } : x));
        if (s.user_id) {
            await supabase.from('notifications').insert({
                user_id: s.user_id,
                type: status === 'approved' ? 'success' : 'info',
                title: status === 'approved' ? (t.suggestion_approved_title || 'Your event idea was approved!') : (t.suggestion_rejected_title || 'About your event idea'),
                message: s.title,
                link: '/events',
            });
        }
        toast.success(statusLabel(t, status));
    };

    const remove = async (table, id) => {
        if (!window.confirm(t.confirm_delete || 'Delete this item?')) return;
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) return toast.error(error.message);
        if (table === 'problem_reports') setReports(prev => prev.filter(r => r.id !== id));
        else setSuggestions(prev => prev.filter(r => r.id !== id));
    };

    const date = (d) => new Date(d).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-GB');
    const counts = {
        reports: reports.filter(r => r.status === 'open' || r.status === 'in_progress').length,
        suggestions: suggestions.filter(s => s.status === 'pending').length,
    };

    return (
        <div className="space-y-6">
            <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                {TABS.map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                        <button key={tab.key} onClick={() => setView(tab.key)}
                            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 ${view === tab.key ? 'bg-white dark:bg-gray-900 shadow text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`}>
                            <TabIcon /> {t[tab.labelKey] || tab.fallback}
                            {counts[tab.key] > 0 && <span className="bg-red-600 text-white text-xs rounded-full px-2">{counts[tab.key]}</span>}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <p className="flex items-center gap-2 text-gray-500"><FaSpinner className="animate-spin" /> {t.loading || 'Loading...'}</p>
            ) : view === 'reports' ? (
                reports.length === 0 ? <p className="text-gray-500 py-8 text-center">{t.inbox_empty || 'Nothing here yet.'}</p> : (
                    <div className="space-y-3">
                        {reports.map(r => (
                            <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-bold dark:text-white">{r.subject}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                            {date(r.created_at)}
                                            {r.email && <a href={`mailto:${r.email}`} className="text-blue-600 inline-flex items-center gap-1"><FaEnvelope />{r.email}</a>}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[r.status]}`}>{statusLabel(t, r.status)}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">{r.description}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {REPORT_STATUSES.filter(s => s !== r.status).map(s => (
                                        <button key={s} onClick={() => setReportStatus(r.id, s)} className="text-xs px-3 py-1 rounded border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">
                                            {statusLabel(t, s)}
                                        </button>
                                    ))}
                                    <button onClick={() => remove('problem_reports', r.id)} className="text-xs px-3 py-1 rounded text-red-600 hover:bg-red-50 ms-auto" aria-label={t.delete || 'Delete'}><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                suggestions.length === 0 ? <p className="text-gray-500 py-8 text-center">{t.inbox_empty || 'Nothing here yet.'}</p> : (
                    <div className="space-y-3">
                        {suggestions.map(s => (
                            <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <p className="font-bold dark:text-white">{s.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {date(s.created_at)}{s.proposed_date && ` · ${t.proposed_date || 'Proposed'}: ${date(s.proposed_date)}`}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[s.status]}`}>{statusLabel(t, s.status)}</span>
                                </div>
                                {s.description && <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">{s.description}</p>}
                                <div className="flex gap-2 mt-3">
                                    {s.status !== 'approved' && (
                                        <button onClick={() => decideSuggestion(s, 'approved')} className="text-xs px-3 py-1 rounded bg-green-600 text-white flex items-center gap-1"><FaCheck /> {t.approve || 'Approve'}</button>
                                    )}
                                    {s.status !== 'rejected' && (
                                        <button onClick={() => decideSuggestion(s, 'rejected')} className="text-xs px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-gray-200 flex items-center gap-1"><FaTimes /> {t.reject || 'Reject'}</button>
                                    )}
                                    <button onClick={() => remove('event_suggestions', s.id)} className="text-xs px-3 py-1 rounded text-red-600 hover:bg-red-50 ms-auto" aria-label={t.delete || 'Delete'}><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default InboxManagement;
