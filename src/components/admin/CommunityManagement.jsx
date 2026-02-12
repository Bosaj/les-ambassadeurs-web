import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FaHistory, FaEye, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import MembershipHistoryModal from './MembershipHistoryModal';
import ConfirmationModal from '../ConfirmationModal';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';

const CommunityManagement = ({ t, onViewUser }) => {
    const [users, setUsers] = useState([]);
    const [attendees, setAttendees] = useState([]);
    const [view, setView] = useState('members');
    const [attendanceFilter, setAttendanceFilter] = useState('all');
    const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();
    const { updateAttendanceStatus, fetchData: refreshGlobalData, cancelRegistration } = useData();
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, data: null });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*');

            if (profilesError) throw profilesError;
            if (profiles) setUsers(profiles);

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
                toast.success(t.approved || "Approved", { id: toastId });
            } else if (type === 'reject') {
                await updateAttendanceStatus(data.id, 'rejected');
                setAttendees(prev => prev.map(item => item.id === data.id ? { ...item, status: 'rejected' } : item));
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
                    onClick={refreshGlobalData ? refreshGlobalData : fetchData}
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
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[900px]">
                                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        <tr>
                                            <th className="p-4 whitespace-nowrap w-[20%]">{t.table_header_name || "Name"}</th>
                                            <th className="p-4 whitespace-nowrap w-[25%]">{t.table_header_email || "Email"}</th>
                                            <th className="p-4 whitespace-nowrap w-[10%]">{t.table_header_role || "Role"}</th>
                                            <th className="p-4 whitespace-nowrap w-[15%]">{t.table_header_phone || "Phone"}</th>
                                            <th className="p-4 whitespace-nowrap w-[15%]">{t.table_header_city || "City"}</th>
                                            <th className="p-4 whitespace-nowrap text-right w-[15%]">{t.table_header_actions || "Actions"}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {users.length > 0 ? users.map(u => (
                                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="p-4 font-medium dark:text-white align-middle">
                                                    <div className="truncate max-w-[200px]" title={(language === 'ar' && u.full_name_ar) ? u.full_name_ar : u.full_name}>
                                                        {(language === 'ar' && u.full_name_ar) ? u.full_name_ar : u.full_name}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap align-middle">{u.email}</td>
                                                <td className="p-4 whitespace-nowrap align-middle"><span className={`px-2 py-1 rounded text-xs inline-block ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{t[`role_${u.role}`] || u.role}</span></td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap align-middle">{u.phone_number || '-'}</td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap align-middle">{(language === 'ar' && u.city_ar) ? u.city_ar : (u.city ? (t[`city_${u.city.toLowerCase()}`] || u.city) : '-')}</td>
                                                <td className="p-4 text-right whitespace-nowrap align-middle">
                                                    <div className="flex justify-end gap-2 items-center">
                                                        <button
                                                            onClick={() => setSelectedUserForHistory(u)}
                                                            className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 p-2 rounded hover:bg-purple-200 transition flex-shrink-0"
                                                            title={t.membership_history_title || "Membership History"}
                                                        >
                                                            <FaHistory />
                                                        </button>
                                                        <button
                                                            onClick={() => onViewUser && onViewUser(u)}
                                                            className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 p-2 rounded hover:bg-blue-200 transition flex-shrink-0"
                                                            title={t.view_profile || "View Full Profile"}
                                                        >
                                                            <FaEye />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="p-4 text-center text-gray-500">No members found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[900px]">
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
                                                    {(language === 'ar' && a.profiles?.full_name_ar) ? a.profiles.full_name_ar : (a.profiles?.full_name || a.name)}
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
