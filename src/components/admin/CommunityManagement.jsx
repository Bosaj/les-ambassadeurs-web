import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FaHistory, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import MembershipHistoryModal from './MembershipHistoryModal';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';

const CommunityManagement = ({ t, onViewUser }) => {
    const [users, setUsers] = useState([]);
    const [attendees, setAttendees] = useState([]);
    const [view, setView] = useState('members');
    const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();
    const { updateAttendanceStatus } = useData();

    useEffect(() => {
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
                        events (title, date)
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
        fetchData();
    }, []);

    const getLocalizedContent = (content) => {
        if (!content) return '';
        if (typeof content === 'string') return content;
        return content[language] || content['en'] || content['fr'] || content['ar'] || '';
    };

    return (
        <div>
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setView('members')}
                    className={`px-4 py-2 rounded font-medium transition-colors ${view === 'members' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    {t.registered_users || "Registered Members"}
                </button>
                <button
                    onClick={() => setView('attendance')}
                    className={`px-4 py-2 rounded font-medium transition-colors ${view === 'attendance' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    {t.attendance_history || "Attendance History"}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-40 text-gray-500">
                        Loading data...
                    </div>
                ) : (
                    <>
                        {view === 'members' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        <tr>
                                            <th className="p-4 whitespace-nowrap">{t.table_header_name || "Name"}</th>
                                            <th className="p-4 whitespace-nowrap">{t.table_header_email || "Email"}</th>
                                            <th className="p-4 whitespace-nowrap">{t.table_header_role || "Role"}</th>
                                            <th className="p-4 whitespace-nowrap">{t.table_header_phone || "Phone"}</th>
                                            <th className="p-4 whitespace-nowrap">{t.table_header_city || "City"}</th>
                                            <th className="p-4 whitespace-nowrap text-right">{t.table_header_actions || "Actions"}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {users.length > 0 ? users.map(u => (
                                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="p-4 font-medium dark:text-white whitespace-nowrap">{u.full_name}</td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{u.email}</td>
                                                <td className="p-4 whitespace-nowrap"><span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{u.role}</span></td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{u.phone_number || '-'}</td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{u.city || '-'}</td>
                                                <td className="p-4 text-right whitespace-nowrap flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedUserForHistory(u)}
                                                        className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 p-2 rounded hover:bg-purple-200 transition"
                                                        title={t.membership_history_title || "Membership History"}
                                                    >
                                                        <FaHistory />
                                                    </button>
                                                    <button
                                                        onClick={() => onViewUser && onViewUser(u)}
                                                        className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 p-2 rounded hover:bg-blue-200 transition"
                                                        title="View Full Profile"
                                                    >
                                                        <FaEye />
                                                    </button>
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
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        <tr>
                                            <th className="p-4 whitespace-nowrap">{t.tab_events || "Event"}</th>
                                            <th className="p-4 whitespace-nowrap">{t.date || "Date"}</th>
                                            <th className="p-4 whitespace-nowrap">{t.table_header_name || "Name"}</th>
                                            <th className="p-4 whitespace-nowrap">{t.table_header_email || "Email"}</th>
                                            <th className="p-4 whitespace-nowrap">{t.status || "Status"}</th>
                                            <th className="p-4 whitespace-nowrap">{t.registered_on || "Registered At"}</th>
                                            <th className="p-4 whitespace-nowrap text-right">{t.actions || "Actions"}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {attendees.length > 0 ? attendees.map(a => (
                                            <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="p-4 font-medium dark:text-white whitespace-nowrap">{getLocalizedContent(a.events?.title) || 'Unknown Event'}</td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{a.events?.date ? new Date(a.events.date).toLocaleDateString() : '-'}</td>
                                                <td className="p-4 dark:text-gray-300 whitespace-nowrap">{a.name}</td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{a.email}</td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded text-xs capitalize ${a.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        a.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {a.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-400 text-sm whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
                                                <td className="p-4 text-right whitespace-nowrap flex justify-end gap-2">
                                                    {a.status !== 'confirmed' && (
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(t.confirm_approve || "Approve participation?")) {
                                                                    try {
                                                                        await updateAttendanceStatus(a.id, 'confirmed');
                                                                        setAttendees(prev => prev.map(item => item.id === a.id ? { ...item, status: 'confirmed' } : item));
                                                                        toast.success(t.approved || "Approved");
                                                                    } catch (e) {
                                                                        toast.error("Error approving");
                                                                    }
                                                                }
                                                            }}
                                                            className="text-green-500 hover:bg-green-50 p-2 rounded transition"
                                                            title={t.approve || "Approve"}
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                    )}
                                                    {a.status !== 'rejected' && (
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(t.confirm_reject || "Reject participation?")) {
                                                                    try {
                                                                        await updateAttendanceStatus(a.id, 'rejected');
                                                                        setAttendees(prev => prev.map(item => item.id === a.id ? { ...item, status: 'rejected' } : item));
                                                                        toast.success(t.rejected || "Rejected");
                                                                    } catch (e) {
                                                                        toast.error("Error rejecting");
                                                                    }
                                                                }
                                                            }}
                                                            className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                                                            title={t.reject || "Reject"}
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    )}
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
            </div>
        </div>
    );
};

export default CommunityManagement;
