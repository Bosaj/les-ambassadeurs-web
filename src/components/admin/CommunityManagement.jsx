import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FaHistory, FaEye, FaCheck, FaTimes, FaTrash, FaStar, FaSearch } from 'react-icons/fa';
import { getLevel } from '../../lib/gamification';
import MembershipHistoryModal from './MembershipHistoryModal';
import AwardPointsModal from './AwardPointsModal';
import ConfirmationModal from '../ConfirmationModal';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../hooks/useData';
import toast from 'react-hot-toast';

const CommunityManagement = ({ t, onViewUser, initialView = 'members' }) => {
    const [users, setUsers] = useState([]);
    const [attendees, setAttendees] = useState([]);
    const [view, setView] = useState(initialView);
    const [attendanceFilter, setAttendanceFilter] = useState('all');
    const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();
    const { updateAttendanceStatus, fetchData: refreshGlobalData, cancelRegistration } = useData();
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, data: null });
    const [awardModal, setAwardModal] = useState({ isOpen: false, user: null });
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*');

            if (profilesError) {
                console.error("Error fetching profiles:", profilesError);
                toast.error(`Failed to load community members: ${profilesError.message}`);
                throw profilesError;
            }

            if (profiles) {
                setUsers(profiles);
            }

            // Fetch Event Attendees
            const { data: att, error: attError } = await supabase
                .from('event_attendees')
                .select(`
                        *,
                        events (title, date, category),
                        profiles (full_name, full_name_ar)
                    `)
                .order('created_at', { ascending: false });

            if (attError) {
                console.error("Error fetching attendees:", attError);
            }

            if (att) {
                setAttendees(att);
            } else {
                setAttendees([]);
            }
        } catch (error) {
            console.error("Error fetching community data:", error);
            toast.error("Failed to load community data. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const getLocalizedContent = (content) => {
        if (!content) return '';
        if (typeof content === 'string') return content;
        return content[language] || content['en'] || content['fr'] || content['ar'] || '';
    };

    const handleAction = (type, item) => {
        setConfirmModal({ isOpen: true, type, data: item });
    };

    const performAction = async () => {
        const { type, data } = confirmModal;
        if (!data) return;

        const toastId = toast.loading(t.processing || "Processing...");
        try {
            if (type === 'approve') {
                await updateAttendanceStatus(data.id, 'confirmed');
                setAttendees(prev => prev.map(item => item.id === data.id ? { ...item, status: 'confirmed' } : item));

                // Create Notification
                await supabase.from('notifications').insert({
                    user_id: data.user_id,
                    type: 'success',
                    title: t.request_approved || "Request Approved",
                    message: `${t.event || "Event"}: ${getLocalizedContent(data.events?.title)} - ${t.approved || "Approved"}`,
                    is_read: false
                });

                toast.success(t.approved || "Approved", { id: toastId });
            } else if (type === 'reject') {
                await updateAttendanceStatus(data.id, 'rejected');
                setAttendees(prev => prev.map(item => item.id === data.id ? { ...item, status: 'rejected' } : item));

                // Create Notification
                await supabase.from('notifications').insert({
                    user_id: data.user_id,
                    type: 'error',
                    title: t.request_denied || "Request Denied",
                    message: `${t.event || "Event"}: ${getLocalizedContent(data.events?.title)} - ${t.rejected || "Rejected"}`,
                    is_read: false
                });

                toast.success(t.rejected || "Rejected", { id: toastId });
            } else if (type === 'delete') {
                // Use data.event_id directly from the attendee record
                await cancelRegistration(data.events?.category || 'events', data.event_id, data.email);
                setAttendees(prev => prev.filter(attendee => attendee.id !== data.id));
                toast.success(t.deleted_success || "Record deleted successfully", { id: toastId });
            }
            // Optionally refresh global data to sync limits/counts elsewhere
            if (refreshGlobalData) refreshGlobalData();
        } catch (error) {
            console.error(error);
            toast.error(t.error_occurred || "Error occurred", { id: toastId });
        } finally {
            setConfirmModal({ isOpen: false, type: null, data: null });
        }
    };

    const getAttendeeName = (attendee) => {
        let profile = attendee.profiles;
        if (Array.isArray(profile)) profile = profile[0];

        // Fallback to finding in users list if not joined
        if (!profile && users.length > 0) {
            profile = users.find(u => u.email === attendee.email);
        }

        if (language === 'ar' && profile?.full_name_ar) {
            return profile.full_name_ar;
        }
        return profile?.full_name || attendee.name || 'Unknown';
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                    <button
                        onClick={() => setView('members')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded font-medium transition-colors text-center ${view === 'members' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {t.registered_users || "Registered Members"}
                    </button>
                    <button
                        onClick={() => setView('attendance')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded font-medium transition-colors text-center ${view === 'attendance' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {t.attendance_history || "Attendance History"}
                    </button>
                </div>

                {view === 'attendance' && (
                    <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                        {['all', 'program', 'event', 'project'].map(type => (
                            <button
                                key={type}
                                onClick={() => setAttendanceFilter(type)}
                                className={`flex-1 md:flex-none px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap ${attendanceFilter === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t[`filter_${type}`] || type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                            </button>
                        ))}
                    </div>
                )}

                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="self-end md:self-auto flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap"
                >
                    <FaHistory className={loading ? "animate-spin" : ""} />
                    {loading ? (t.refreshing || "Refreshing...") : (t.refresh_data || "Refresh Data")}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 min-h-[400px] w-full max-w-full">
                {loading ? (
                    <div className="flex justify-center items-center h-40 text-gray-500">
                        {t.loading_data || "Loading data..."}
                    </div>
                ) : (
                    <>
                        {view === 'members' ? (
                            <div className="p-4 space-y-4">
                                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                                    <label className="relative flex-1">
                                        <FaSearch className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            placeholder={t.search_members || 'Search by name, email, phone or city'}
                                            className="w-full ps-9 pe-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </label>
                                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg overflow-x-auto">
                                        {['all', 'volunteer', 'member', 'admin'].map(r => (
                                            <button key={r} onClick={() => setRoleFilter(r)}
                                                className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${roleFilter === r ? 'bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {r === 'all' ? (t.filter_all || 'All') : (t[`role_${r}`] || r)} ({r === 'all' ? users.length : users.filter(u => u.role === r).length})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="admin-table-wrap">
                                <table className="admin-table min-w-[980px]">
                                    <thead>
                                        <tr>
                                            <th>{t.table_header_name || "Member"}</th>
                                            <th>{t.table_header_role || "Role"}</th>
                                            <th>{t.membership_label || "Membership"}</th>
                                            <th>{t.points || "Points"}</th>
                                            <th>{t.table_header_phone || "Phone"} / {t.table_header_city || "City"}</th>
                                            <th>{t.joined_on || "Joined"}</th>
                                            <th className="text-end">{t.table_header_actions || "Actions"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const q = search.trim().toLowerCase();
                                            const rows = users
                                                .filter(u => roleFilter === 'all' || u.role === roleFilter)
                                                .filter(u => !q || [u.full_name, u.full_name_ar, u.email, u.phone_number, u.city, u.city_ar]
                                                    .some(v => (v || '').toLowerCase().includes(q)))
                                                .sort((a, b) => (b.points || 0) - (a.points || 0));
                                            if (rows.length === 0) {
                                                return <tr><td colSpan="7" className="text-center text-gray-500 py-8">{t.no_members_found || 'No members found.'}</td></tr>;
                                            }
                                            const roleStyle = { admin: 'bg-purple-100 text-purple-800', member: 'bg-blue-100 text-blue-800', volunteer: 'bg-green-100 text-green-800' };
                                            const memberStyle = { active: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', rejected: 'bg-red-100 text-red-700', expired: 'bg-gray-200 text-gray-700', none: 'bg-gray-100 text-gray-500' };
                                            return rows.map(u => {
                                                const name = (language === 'ar' && u.full_name_ar) ? u.full_name_ar : (u.full_name || u.email);
                                                const lvl = getLevel(u.points || 0).level.id;
                                                return (
                                                    <tr key={u.id}>
                                                        <td>
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                {u.avatar_url
                                                                    ? <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" loading="lazy" />
                                                                    : <span className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold shrink-0">{(name || '?').charAt(0).toUpperCase()}</span>}
                                                                <div className="min-w-0">
                                                                    <p className="font-semibold dark:text-white truncate max-w-[220px]" title={name}>{name}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px]">{u.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><span className={`px-2 py-1 rounded text-xs font-semibold ${roleStyle[u.role] || 'bg-gray-100 text-gray-700'}`}>{t[`role_${u.role}`] || u.role}</span></td>
                                                        <td><span className={`px-2 py-1 rounded text-xs font-semibold ${memberStyle[u.membership_status] || memberStyle.none}`}>{t[`membership_${u.membership_status}`] || u.membership_status || 'none'}</span></td>
                                                        <td>
                                                            <p className="font-bold text-blue-800 dark:text-blue-300">{u.points || 0}</p>
                                                            <p className="text-xs text-gray-500">{t[`level_${lvl}`] || lvl}</p>
                                                        </td>
                                                        <td className="text-gray-600 dark:text-gray-300">
                                                            <p className="whitespace-nowrap">{u.phone_number || '—'}</p>
                                                            <p className="text-xs text-gray-500">{(language === 'ar' && u.city_ar) ? u.city_ar : (u.city ? (t[`city_${u.city.toLowerCase()}`] || u.city) : '—')}</p>
                                                        </td>
                                                        <td className="text-gray-500 whitespace-nowrap">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                                                        <td>
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => setSelectedUserForHistory(u)} className="p-2 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300" title={t.membership_history_title || "Membership History"} aria-label={t.membership_history_title || "Membership History"}><FaHistory /></button>
                                                                <button onClick={() => onViewUser && onViewUser(u)} className="p-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300" title={t.view_profile || "View Full Profile"} aria-label={t.view_profile || "View Full Profile"}><FaEye /></button>
                                                                <button onClick={() => setAwardModal({ isOpen: true, user: u })} className="p-2 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300" title={t.award_points || "Award Points"} aria-label={t.award_points || "Award Points"}><FaStar /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        })()}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table min-w-[900px]">
                                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        <tr>
                                            <th className="p-4 whitespace-nowrap w-[20%]">{t.tab_events || "Event"}</th>
                                            <th className="p-4 whitespace-nowrap w-[15%]">{t.date || "Date"}</th>
                                            <th className="p-4 whitespace-nowrap w-[20%]">{t.table_header_name || "Name"}</th>
                                            <th className="p-4 whitespace-nowrap w-[20%]">{t.table_header_email || "Email"}</th>
                                            <th className="p-4 whitespace-nowrap w-[10%]">{t.status || "Status"}</th>
                                            <th className="p-4 whitespace-nowrap w-[15%]">{t.registered_on || "Registered At"}</th>
                                            <th className="p-4 whitespace-nowrap text-right w-[150px]">{t.actions || "Actions"}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {(attendees.filter(a => attendanceFilter === 'all' || a.events?.category === attendanceFilter).length > 0) ? attendees.filter(a => attendanceFilter === 'all' || a.events?.category === attendanceFilter).map(a => (
                                            <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="p-4 font-medium dark:text-white align-middle">
                                                    <div className="truncate max-w-[200px]" title={getLocalizedContent(a.events?.title)}>
                                                        {getLocalizedContent(a.events?.title) || t.unknown_event || 'Unknown Event'}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap align-middle">{a.events?.date ? new Date(a.events.date).toLocaleDateString() : '-'}</td>
                                                <td className="p-4 dark:text-gray-300 whitespace-nowrap align-middle">
                                                    {getAttendeeName(a)}
                                                </td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap align-middle">{a.email}</td>
                                                <td className="p-4 whitespace-nowrap align-middle">
                                                    <span className={`px-2 py-1 rounded text-xs capitalize inline-block ${a.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        a.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {t[`status_${a.status}`] || a.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-400 text-sm whitespace-nowrap align-middle">{new Date(a.created_at).toLocaleString()}</td>
                                                <td className="p-4 text-right whitespace-nowrap align-middle">
                                                    <div className="flex justify-end gap-2 items-center">
                                                        {a.status !== 'confirmed' && (
                                                            <button
                                                                onClick={() => handleAction('approve', a)}
                                                                className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 p-1.5 rounded transition flex-shrink-0"
                                                                title={t.approve || "Approve"}
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                        )}
                                                        {a.status !== 'rejected' && (
                                                            <button
                                                                onClick={() => handleAction('reject', a)}
                                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded transition flex-shrink-0"
                                                                title={t.reject || "Reject"}
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleAction('delete', a)}
                                                            className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded transition flex-shrink-0"
                                                            title={t.delete || "Delete"}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="p-4 text-center text-gray-500">{t.no_data || "No attendance records found."}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {selectedUserForHistory && (
                    <MembershipHistoryModal
                        user={selectedUserForHistory}
                        onClose={() => setSelectedUserForHistory(null)}
                        t={t}
                    />
                )}

                <AwardPointsModal
                    isOpen={awardModal.isOpen}
                    onClose={() => setAwardModal({ isOpen: false, user: null })}
                    user={awardModal.user}
                    onSuccess={fetchData}
                    t={t}
                />

                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onConfirm={performAction}
                    title={
                        confirmModal.type === 'approve' ? (t.confirm_approve || "Approve Participation") :
                            confirmModal.type === 'reject' ? (t.confirm_reject || "Reject Participation") :
                                (t.confirm_delete || "Delete Record")
                    }
                    message={
                        confirmModal.type === 'approve' ? (t.approve_message || "Are you sure you want to approve this user's participation?") :
                            confirmModal.type === 'reject' ? (t.reject_message || "Are you sure you want to reject this user's participation?") :
                                (t.delete_message || "Are you sure you want to delete this record? The user will be able to apply again.")
                    }
                    isDangerous={confirmModal.type === 'reject' || confirmModal.type === 'delete'}
                />
            </div>
        </div>
    );
};

export default CommunityManagement;
