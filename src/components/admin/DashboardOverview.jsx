import React from 'react';
import { FaNewspaper, FaCalendarPlus, FaHandHoldingHeart, FaUsers, FaComments, FaUserShield, FaClock } from 'react-icons/fa';

const DashboardOverview = ({ t, news, events, projects, users, testimonials, onNavigate, onAdd, language }) => {
    // 1. Needs Attention
    const pendingMembers = users?.filter(u => u.membership_status === 'pending') || [];
    const pendingTestimonials = testimonials?.filter(t => !t.is_approved) || [];

    // 2. Recent Activity (Top 5 items)
    const allActivity = [
        ...(news || []).map(i => ({ ...i, type: 'news', displayType: t.news || 'News' })),
        ...(events || []).map(i => ({ ...i, type: 'event', displayType: t.tab_events || 'Event' })),
        ...(projects || []).map(i => ({ ...i, type: 'project', displayType: t.manage_projects || 'Project' }))
    ].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)).slice(0, 5);

    return (
        <div className="space-y-8 mt-8 animate-fade-in slide-in-bottom">
            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t.quick_actions}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => onAdd('news')} className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition flex flex-col items-center justify-center gap-2 border border-green-100 dark:border-green-800">
                        <FaNewspaper className="text-2xl" />
                        <span className="font-medium text-sm">{t.add_news || "Add News"}</span>
                    </button>
                    <button onClick={() => onAdd('events')} className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition flex flex-col items-center justify-center gap-2 border border-purple-100 dark:border-purple-800">
                        <FaCalendarPlus className="text-2xl" />
                        <span className="font-medium text-sm">{t.add_event || "Add Event"}</span>
                    </button>
                    <button onClick={() => onAdd('programs')} className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition flex flex-col items-center justify-center gap-2 border border-blue-100 dark:border-blue-800">
                        <FaCalendarPlus className="text-2xl" />
                        <span className="font-medium text-sm">{t.add_program || "Add Program"}</span>
                    </button>
                    <button onClick={() => onAdd('projects')} className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition flex flex-col items-center justify-center gap-2 border border-orange-100 dark:border-orange-800">
                        <FaHandHoldingHeart className="text-2xl" />
                        <span className="font-medium text-sm">{t.add_project || "Add Project"}</span>
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Needs Attention */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <FaUserShield className="text-yellow-500" /> {t.needs_attention}
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer" onClick={() => onNavigate('memberships')}>
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition">
                                    <FaUsers />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white text-sm opacity-80">{t.pending_members_count || "Pending Members"}</p>
                                    <p className="text-2xl font-bold dark:text-gray-100">{pendingMembers.length}</p>
                                </div>
                            </div>
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition transform translate-x-2 group-hover:translate-x-0">
                                {t.view_details} &rarr;
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer" onClick={() => onNavigate('testimonials')}>
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition">
                                    <FaComments />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white text-sm opacity-80">{t.pending_testimonials_count || "Pending Testimonials"}</p>
                                    <p className="text-2xl font-bold dark:text-gray-100">{pendingTestimonials.length}</p>
                                </div>
                            </div>
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition transform translate-x-2 group-hover:translate-x-0">
                                {t.view_details} &rarr;
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <FaClock className="text-blue-500" /> {t.recent_activity}
                    </h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {allActivity.length > 0 ? allActivity.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition">
                                <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-200" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                        {item.title?.[language] || item.title?.en || item.title?.fr || item.title?.ar || (typeof item.title === 'string' ? item.title : t.untitled || 'Untitled')}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize`}>
                                            {item.displayType}
                                        </span>
                                        <span>• {new Date(item.created_at || item.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center py-8 text-gray-500">{t.no_recent_activity}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
