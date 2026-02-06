import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarPlus, FaNewspaper, FaMoneyBillWave, FaComments, FaSignOutAlt, FaTrash,
    FaUserShield, FaCheck, FaTimes, FaThumbtack, FaUsers, FaCalendarCheck,
    FaEnvelope, FaPhone, FaEye, FaHandHoldingHeart, FaChartPie, FaSearch, FaPlus, FaCheckCircle, FaClock, FaHistory, FaCalendarAlt, FaTimesCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import DashboardStats from '../components/admin/DashboardStats';
import PostForm from '../components/admin/PostForm';

import { useLanguage } from '../context/LanguageContext';

// Membership History Modal Component
const MembershipHistoryModal = ({ user, onClose, t }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
    const years = Array.from({ length: currentYear - startYear + 2 }, (_, i) => startYear + i); // Up to next year

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('annual_memberships')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    const togglePayment = async (year, existingRecord) => {
        try {
            if (existingRecord) {
                // Remove payment
                const { error } = await supabase
                    .from('annual_memberships')
                    .delete()
                    .eq('id', existingRecord.id);
                if (error) throw error;
                toast.success(`Removed payment for ${year}`);
            } else {
                // Add payment
                const { error } = await supabase
                    .from('annual_memberships')
                    .insert({
                        user_id: user.id,
                        year: year,
                        amount: 50,
                        status: 'paid'
                    });
                if (error) throw error;
                toast.success(`Marked ${year} as Paid`);
            }
            fetchHistory(); // Refresh
        } catch (error) {
            console.error("Error toggling payment:", error);
            toast.error("Failed to update payment");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                            <FaHistory /> {t.membership_history_title || "Membership History"}
                        </h2>
                        <p className="text-sm opacity-80">{user.full_name}</p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition">
                        <FaTimesCircle className="text-2xl" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8">{t.loading_history || "Loading history..."}</div>
                    ) : (
                        <div className="space-y-3">
                            {years.map(year => {
                                const record = history.find(h => h.year === year);
                                const isPaid = !!record;

                                return (
                                    <div key={year} className={`flex items-center justify-between p-4 rounded-xl border-2 transition ${isPaid ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isPaid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <FaCalendarAlt />
                                            </div>
                                            <div>
                                                <div className="font-bold dark:text-white">{year}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{t.annual_fee || "Annual Fee"}: 50 DH</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => togglePayment(year, record)}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${isPaid ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                        >
                                            {isPaid ? (t.remove_payment || 'Remove') : (t.mark_paid || 'Mark Paid')}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PostList = ({ type, data, onDelete, togglePin, onEdit, t, onAdd, searchTerm, setSearchTerm, activeLang }) => {

    // Filter data based on search term
    const filteredData = data.filter(item => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const title = (item.title?.en || item.title?.fr || item.title?.ar || item.title || '').toLowerCase();
        const desc = (item.description?.en || item.description?.fr || item.description?.ar || item.description || '').toLowerCase();
        return title.includes(term) || desc.includes(term);
    });

    return (
        <div>
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold capitalize text-gray-800 dark:text-white flex items-center gap-2">
                    {type === 'news' ? <FaNewspaper /> : (type === 'events' ? <FaCalendarCheck /> : (type === 'projects' ? <FaHandHoldingHeart /> : <FaCalendarPlus />))}
                    {t.manage} {type === 'news' ? t.tab_news : (type === 'events' ? t.tab_events : (type === 'projects' ? (t.projects_section_title || "Projects") : t.tab_programs))}
                </h2>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t.search_placeholder || "Search..."}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium whitespace-nowrap"
                    >
                        <FaPlus size={14} />
                        {type === 'news' ? t.add_new_news : (type === 'events' ? t.add_new_event : (type === 'projects' ? (t.add_new_project || "Add Project") : t.add_new_program))}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <table className="w-full text-left min-w-[800px]">
                    <thead>
                        <tr className="border-b dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50">
                            <th className="p-4 whitespace-nowrap font-semibold">{t.table_image}</th>
                            <th className="p-4 min-w-[30%] font-semibold">{t.table_title}</th>
                            <th className="p-4 whitespace-nowrap font-semibold">{t.table_date}</th>
                            <th className="p-4 whitespace-nowrap font-semibold">{t.location || "Location"}</th>
                            {type === 'events' && <th className="p-4 whitespace-nowrap font-semibold">{t.table_attendees}</th>}
                            {type === 'programs' && <th className="p-4 whitespace-nowrap font-semibold">{t.joined || "Joined"}</th>}
                            {type === 'projects' && <th className="p-4 whitespace-nowrap font-semibold">{t.supported || "Supported"}</th>}
                            <th className="p-4 whitespace-nowrap text-center font-semibold">{t.pin_item}</th>
                            <th className="p-4 whitespace-nowrap text-right font-semibold">{t.table_actions}</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredData.length > 0 ? filteredData.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                                <td className="p-4 whitespace-nowrap">
                                    <div className="relative w-16 h-10 rounded overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                                        <img src={item.image_url || item.image || "https://via.placeholder.com/150"} alt="" className="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td className="p-4 font-medium">
                                    <p className="line-clamp-1">{(item.title?.[activeLang] || item.title?.en || item.title?.fr || item.title?.ar || (typeof item.title === 'string' ? item.title : '') || 'Untitled')}</p>
                                </td>
                                <td className="p-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-sm">
                                    {item.date ? new Date(item.date).toLocaleDateString() : '-'}
                                </td>
                                <td className="p-4 text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    {(item.location?.[activeLang] || item.location?.en || item.location?.fr || item.location?.ar || (typeof item.location === 'string' ? item.location : '-'))}
                                </td>
                                {type === 'events' && <td className="p-4 whitespace-nowrap text-center text-sm">{item.attendees?.length || 0}</td>}
                                {(type === 'programs' || type === 'projects') && <td className="p-4 whitespace-nowrap text-center text-sm">{item.attendees?.length || 0}</td>}
                                <td className="p-4 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => togglePin(type, item.id, item.is_pinned)}
                                        className={`p-2 rounded-full transition-all ${item.is_pinned ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500'}`}
                                        title={item.is_pinned ? "Unpin" : "Pin to top"}
                                    >
                                        <FaThumbtack size={14} />
                                    </button>
                                </td>
                                <td className="p-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(item)} className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors" title={t.edit_btn}>
                                            <FaNewspaper size={14} />
                                        </button>
                                        <button onClick={() => onDelete(type, item.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" title={t.delete_btn}>
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colspan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    No items found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { t, language } = useLanguage();
    const { news, programs, projects, events, testimonials, addPost, updatePost, deletePost, togglePin, fetchUserActivities, fetchUserDonations, fetchUserSuggestions, users, verifyMember } = useData();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [editingId, setEditingId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formType, setFormType] = useState('news'); // 'news' or 'programs'
    // Trilingual Form State
    const [activeLang, setActiveLang] = useState('en');
    const [formData, setFormData] = useState({
        title: { en: '', fr: '', ar: '' },
        date: '',
        image: '',
        description: { en: '', fr: '', ar: '' },
        name: '',
        role: { en: '', fr: '', ar: '' },
        content: { en: '', fr: '', ar: '' },
        rating: 5
    });

    // User Details Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState({ activities: [], donations: [], suggestions: [] });
    const [userDetailsLoading, setUserDetailsLoading] = useState(false);
    const [activeUserTab, setActiveUserTab] = useState('activities');

    const handleViewUser = async (userProfile) => {
        setSelectedUser(userProfile);
        setUserDetailsLoading(true);
        try {
            const [activities, donations, suggestions] = await Promise.all([
                fetchUserActivities(userProfile.email),
                fetchUserDonations(userProfile.email),
                fetchUserSuggestions(userProfile.id)
            ]);
            setUserDetails({ activities, donations, suggestions });
        } catch (error) {
            console.error("Error fetching user details:", error);
            toast.error("Failed to load user details");
        } finally {
            setUserDetailsLoading(false);
        }
    };


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const AdminManagement = () => {
        const [requests, setRequests] = useState([]);
        const [inviteEmail, setInviteEmail] = useState('');
        const [loading, setLoading] = useState(false);

        const fetchRequests = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('request_status', 'pending');
            if (!error) setRequests(data || []);
        };

        useEffect(() => { fetchRequests(); }, []);
        const handleApprove = async (id) => {
            try {
                await supabase.from('profiles').update({ role: 'admin', request_status: 'approved' }).eq('id', id);
                toast.success("Request approved");
                fetchRequests();
            } catch (e) { toast.error("Error approving"); }
        };
        const handleDeny = async (id) => {
            try {
                await supabase.from('profiles').update({ request_status: 'denied' }).eq('id', id);
                toast.success("Request denied");
                fetchRequests();
            } catch (e) { toast.error("Error denying"); }
        };
        const handleInvite = async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
                // Mock invite for now as RPC might not be set up
                // await supabase.rpc('make_admin_by_email', { target_email: inviteEmail });
                toast.success("Invitation sent (Mock)");
                setInviteEmail('');
            } catch (error) {
                console.error(error);
                toast.error("Failed to invite");
            } finally {
                setLoading(false);
            }
        };

        return (
            <div>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8 border border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold mb-4 text-gray-800 dark:text-white">{t.invite_new_admin}</h3>
                    <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="email" required placeholder="User Email"
                            className="flex-1 border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                        />
                        <button disabled={loading} className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition whitespace-nowrap">
                            {loading ? t.processing : t.send_invitation}
                        </button>
                    </form>
                </div>
                <div>
                    <h3 className="font-bold mb-4 text-gray-800 dark:text-white">Pending Requests</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden overflow-x-auto">
                        {requests.length === 0 ? <p className="p-4 text-center">No pending requests</p> : (
                            <table className="w-full text-left min-w-[300px]">
                                <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="p-3 whitespace-nowrap">Name</th><th className="p-3 text-right whitespace-nowrap">Actions</th></tr></thead>
                                <tbody>{requests.map(r => (
                                    <tr key={r.id} className="border-t dark:border-gray-600"><td className="p-3 dark:text-white whitespace-nowrap">{r.full_name}</td><td className="p-3 text-right whitespace-nowrap"><button onClick={() => handleApprove(r.id)} className="text-green-500 mr-2"><FaCheck /></button><button onClick={() => handleDeny(r.id)} className="text-red-500"><FaTimes /></button></td></tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const CommunityManagement = () => {
        const [users, setUsers] = useState([]);
        const [attendees, setAttendees] = useState([]);
        const [view, setView] = useState('members');
        const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);

        useEffect(() => {
            const fetchData = async () => {
                const { data: profiles } = await supabase.from('profiles').select('*');
                if (profiles) setUsers(profiles);

                const { data: att } = await supabase.from('event_attendees').select(`
                    *,
                    events (title, date)
                `).order('created_at', { ascending: false });
                if (att) setAttendees(att);
            };
            fetchData();
        }, []);

        return (
            <div>
                <div className="flex gap-4 mb-6">
                    <button onClick={() => setView('members')} className={`px-4 py-2 rounded font-medium ${view === 'members' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {t.registered_users || "Registered Members"}
                    </button>
                    <button onClick={() => setView('attendance')} className={`px-4 py-2 rounded font-medium ${view === 'attendance' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {t.attendance_history || "Attendance History"}
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
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
                                    {users.map(u => (
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
                                                    onClick={() => handleViewUser(u)}
                                                    className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 p-2 rounded hover:bg-blue-200 transition"
                                                    title="View Full Profile"
                                                >
                                                    <FaEye />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {/* ... attendees table ... */}
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    <tr>
                                        <th className="p-4 whitespace-nowrap">Event</th>
                                        <th className="p-4 whitespace-nowrap">Date</th>
                                        <th className="p-4 whitespace-nowrap">Attendee Name</th>
                                        <th className="p-4 whitespace-nowrap">Attendee Email</th>
                                        <th className="p-4 whitespace-nowrap">Registered At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {attendees.map(a => (
                                        <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="p-4 font-medium dark:text-white whitespace-nowrap">{a.events?.title || 'Unknown Event'}</td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{a.events?.date ? new Date(a.events.date).toLocaleDateString() : '-'}</td>
                                            <td className="p-4 dark:text-gray-300 whitespace-nowrap">{a.name}</td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{a.email}</td>
                                            <td className="p-4 text-gray-400 text-sm whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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

    const MembershipRequests = () => {
        const [pendingMembers, setPendingMembers] = useState([]);

        useEffect(() => {
            if (users) {
                setPendingMembers(users.filter(u => u.membership_status === 'pending'));
            }
        }, [users]);

        const handleVerify = async (id, action) => {
            if (window.confirm(t.confirm_action || "Are you sure?")) {
                const toastId = toast.loading("Processing...");
                const result = await verifyMember(id, action);
                if (result.success) {
                    toast.success("Updated successfully", { id: toastId });
                } else {
                    toast.error("Failed to update", { id: toastId });
                }
            }
        };

        return (
            <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                    <FaUserShield /> {t.membership_requests || "Membership Requests"}
                </h2>

                {pendingMembers.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center text-gray-500">
                        <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3 opacity-50" />
                        <p>{t.no_pending_requests || "No pending membership requests."}</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                <tr>
                                    <th className="p-4">{t.name || "Name"}</th>
                                    <th className="p-4">{t.email || "Email"}</th>
                                    <th className="p-4">{t.status || "Status"}</th>
                                    <th className="p-4">{t.documents || "Documents"}</th>
                                    <th className="p-4 text-right">{t.actions || "Actions"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {pendingMembers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="p-4 font-bold dark:text-white">{user.full_name}</td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                                        <td className="p-4">
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                                                <FaClock size={10} /> Pending
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="flex flex-col gap-1 text-gray-600 dark:text-gray-300">
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <FaCheckCircle size={12} /> Internal Law
                                                </span>
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <FaCheckCircle size={12} /> Commitment
                                                </span>
                                                <span className="flex items-center gap-1 text-yellow-600">
                                                    <FaMoneyBillWave size={12} /> Payment: Unpaid
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleVerify(user.id, 'approve')}
                                                    className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg transition text-sm flex items-center gap-1"
                                                    title="Approve & Verify Payment"
                                                >
                                                    <FaCheck /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(user.id, 'reject')}
                                                    className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg transition text-sm flex items-center gap-1"
                                                    title="Reject"
                                                >
                                                    <FaTimes /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };


    const handleDelete = (type, id) => {
        if (window.confirm(t.confirm_delete)) {
            deletePost(type, id);
            toast.success(t.item_deleted);
        }
    };




    const handleEdit = (item, type) => {
        setEditingId(item.id);
        const tType = type || activeTab;
        setFormType(tType);

        // Normalize data for form
        // Title/Description might be strings or objects
        const normalize = (val) => (typeof val === 'object' && val !== null) ? val : { en: val, fr: val, ar: val };

        setFormData({
            title: normalize(item.title),
            date: item.date ? item.date.split('T')[0] : '',
            image: item.image_url || item.image || '',
            description: normalize(item.description),
            name: item.name || '',
            role: normalize(item.role),
            content: normalize(item.content),
            rating: item.rating || 5,
            is_approved: item.is_approved
        });

        setIsModalOpen(true);
    };

    const handleAdd = (type) => {
        setEditingId(null);
        setFormType(type);
        setFormData({
            title: { en: '', fr: '', ar: '' },
            date: new Date().toISOString().split('T')[0],
            image: '',
            description: { en: '', fr: '', ar: '' },
            name: '',
            role: { en: '', fr: '', ar: '' },
            content: { en: '', fr: '', ar: '' },
            rating: 5
        });
        setIsModalOpen(true);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setIsModalOpen(false);
        setFormData({
            title: { en: '', fr: '', ar: '' },
            date: '',
            image: '',
            description: { en: '', fr: '', ar: '' },
            name: '',
            role: { en: '', fr: '', ar: '' },
            content: { en: '', fr: '', ar: '' },
            rating: 5
        });
    };

    const handleToggleApproval = async (item) => {
        try {
            const postData = {
                ...item,
                image: item.image_url || item.image, // Map image_url to image for updatePost
                is_approved: !item.is_approved
            };

            await updatePost('testimonials', item.id, postData);
            toast.success(item.is_approved ? (t.testimonial_revoked || "Revoked") : (t.testimonial_approved || "Approved"));
        } catch (error) {
            console.error("Error toggling approval:", error);
            toast.error("Failed to update status");
        }
    };

    const handleFormSubmit = (e, type) => {
        e.preventDefault();
        const targetType = type || formType;
        const toastId = toast.loading(t.processing || "Processing...");

        const action = editingId
            ? updatePost(targetType, editingId, formData)
            : addPost(targetType, formData);

        action
            .then(() => {
                toast.success(editingId ? t.item_updated_success : t.item_added_success, { id: toastId });
                handleCancelEdit(); // Reset form & close modal
            })
            .catch((error) => {
                console.error(error);
                toast.error(t.error_adding_item || "Error saving item", { id: toastId });
            });
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex transition-colors duration-300 relative">
            {/* Sidebar */}
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 md:z-30 w-64 bg-blue-900 dark:bg-gray-800 text-white p-6 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <h2 className="text-2xl font-bold mb-8 flex justify-between items-center">
                    {t.admin_panel}
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white">
                        <FaTimes />
                    </button>
                </h2>
                <nav className="space-y-2">
                    <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'overview' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaChartPie /> {t.overview || "Overview"}
                    </button>
                    <button onClick={() => { setActiveTab('news'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'news' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaNewspaper /> {t.manage_news}
                    </button>
                    <button onClick={() => { setActiveTab('programs'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'programs' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaCalendarPlus /> {t.manage_programs}
                    </button>
                    <button onClick={() => { setActiveTab('projects'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'projects' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaHandHoldingHeart /> {t.manage_projects || "Manage Projects"}
                    </button>
                    <button onClick={() => { setActiveTab('events'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'events' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaCalendarCheck /> {t.manage_events}
                    </button>
                    <button onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'users' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaUsers /> {t.manage_users || "Manage Community"}
                    </button>
                    <button onClick={() => { setActiveTab('memberships'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'memberships' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaUserShield /> {t.manage_memberships || "Membership Requests"}
                    </button>
                    <button onClick={() => { setActiveTab('donations'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'donations' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaMoneyBillWave /> {t.donations}
                    </button>
                    <button onClick={() => { setActiveTab('testimonials'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'testimonials' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaComments /> {t.manage_testimonials}
                    </button>
                    {user?.email === 'oussousselhadji@gmail.com' && (
                        <button onClick={() => { setActiveTab('admins'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded flex items-center gap-3 text-yellow-300 transition-colors ${activeTab === 'admins' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                            <FaUserShield /> {t.manage_admins}
                        </button>
                    )}
                    <button onClick={handleLogout} className="w-full text-left p-3 rounded flex items-center gap-3 text-red-200 hover:bg-blue-800 dark:hover:bg-gray-700 mt-8 transition-colors">
                        <FaSignOutAlt /> {t.logout}
                    </button>
                </nav>
            </aside>

            {/* Mobile Header / Content */}
            <div className="flex-1 w-full md:w-auto">
                <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center md:hidden transition-colors duration-300 sticky top-0 z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 dark:text-gray-300 p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-bold text-blue-900 dark:text-white truncate mx-2">{t.admin_panel}</h1>
                    <button onClick={handleLogout} className="text-gray-600 dark:text-gray-300 p-2"><FaSignOutAlt /></button>
                </header>

                <main className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.welcome}, {user?.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">{t.admin_dashboard_subtitle || "Manage your website content and users."}</p>
                        </div>
                        <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                            {t.logout} <FaSignOutAlt />
                        </button>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="animate-fade-in">
                            <DashboardStats
                                data={{ news, programs, projects, events, users: [], donations: [] }} // Pass empty users/donations for now until fetched or context updated to provide them all time
                                t={t}
                            />
                            {/* Shortlists for overview could go here */}
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300 min-h-[500px]">
                        {activeTab === 'news' && <PostList type="news" data={news} onDelete={handleDelete} onAdd={() => handleAdd('news')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeLang={language} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'news')} />}
                        {activeTab === 'programs' && <PostList type="programs" data={programs} onDelete={handleDelete} onAdd={() => handleAdd('programs')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeLang={language} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'programs')} />}
                        {activeTab === 'projects' && <PostList type="projects" data={projects} onDelete={handleDelete} onAdd={() => handleAdd('projects')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeLang={language} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'projects')} />}
                        {activeTab === 'events' && <PostList type="events" data={events} onDelete={handleDelete} onAdd={() => handleAdd('events')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeLang={language} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'events')} />}

                        {activeTab === 'testimonials' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold capitalize text-gray-800 dark:text-white flex items-center gap-2">
                                        <FaComments /> {t.manage_testimonials}
                                    </h2>
                                    <button
                                        onClick={() => handleAdd('testimonials')}
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium"
                                    >
                                        <FaPlus size={14} /> {t.add_new_testimonial || "Add Testimonial"}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {testimonials.length > 0 ? testimonials.map(item => (
                                        <div key={item.id} className={`bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border ${item.is_approved ? 'border-gray-100 dark:border-gray-700' : 'border-yellow-300 dark:border-yellow-600'}`}>
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <img src={item.image_url || "https://via.placeholder.com/50"} alt={item.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-600" />
                                                <div>
                                                    <h4 className="font-bold dark:text-white flex items-center gap-2">
                                                        {item.name}
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {item.is_approved ? (t.approved || "Approved") : (t.pending || "Pending")}
                                                        </span>
                                                    </h4>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col">
                                                        <span>{typeof item.role === 'object' ? (item.role[language] || item.role.en) : item.role}</span>
                                                        {item.rating && <span className="text-yellow-500 text-xs">{'★'.repeat(item.rating)}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleToggleApproval(item)}
                                                    className={`p-2 rounded-lg transition-colors ${item.is_approved
                                                        ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20'
                                                        : 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20'
                                                        }`}
                                                    title={item.is_approved ? "Revoke Approval" : "Approve"}
                                                >
                                                    {item.is_approved ? <FaTimes /> : <FaCheck />}
                                                </button>
                                                <button onClick={() => togglePin('testimonials', item.id, item.is_pinned)} className={`p-2 rounded-full transition ${item.is_pinned ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}>
                                                    <FaThumbtack className={item.is_pinned ? 'text-blue-600' : ''} />
                                                </button>
                                                <button onClick={() => handleEdit(item, 'testimonials')} className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors">
                                                    <FaNewspaper />
                                                </button>
                                                <button onClick={() => handleDelete('testimonials', item.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 transition-colors">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    )) : <p className="text-gray-500">{t.no_testimonials}</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'donations' && <div className="text-gray-500 dark:text-gray-400 text-center py-20 flex flex-col items-center gap-4"><FaMoneyBillWave size={40} opacity={0.3} /> {t.donation_management_soon}</div>}

                        {activeTab === 'admins' && user?.email === 'oussousselhadji@gmail.com' && (
                            <AdminManagement />
                        )}
                        {activeTab === 'users' && <CommunityManagement />}
                        {activeTab === 'memberships' && <MembershipRequests />}
                    </div>
                </main>
            </div>

            {/* Post Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCancelEdit}
                title={editingId ? `${t.edit_btn} ${formType}` : `${t.add_btn} ${formType}`}
            >
                <PostForm
                    type={formType}
                    formData={formData}
                    setFormData={setFormData}
                    handleFormSubmit={handleFormSubmit}
                    activeLang={activeLang}
                    setActiveLang={setActiveLang}
                    t={t}
                    onCancel={handleCancelEdit}
                    editingId={editingId}
                />
            </Modal>
            {/* User Details Modal */}
            <Modal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                title={selectedUser ? `User Details: ${selectedUser.full_name}` : 'User Details'}
            >
                {selectedUser && (
                    <div className="space-y-6">
                        {/* Profile Info */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <img src={selectedUser.avatar_url || `https://ui-avatars.com/api/?name=${selectedUser.full_name}`} alt={selectedUser.full_name} className="w-16 h-16 rounded-full" />
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">{selectedUser.full_name}</h3>
                                {selectedUser.username && <p className="text-sm text-gray-500 dark:text-gray-400">@{selectedUser.username}</p>}
                                <p className="text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-xs px-2 py-1 rounded ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{selectedUser.role}</span>
                                    {selectedUser.phone_number && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded flex items-center gap-1"><FaPhone className="text-[10px]" /> {selectedUser.phone_number}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b dark:border-gray-700">
                            <button onClick={() => setActiveUserTab('activities')} className={`px-4 py-2 font-medium transition-colors ${activeUserTab === 'activities' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                                Activities ({userDetails.activities?.length || 0})
                            </button>
                            <button onClick={() => setActiveUserTab('donations')} className={`px-4 py-2 font-medium transition-colors ${activeUserTab === 'donations' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                                Donations ({userDetails.donations?.length || 0})
                            </button>
                            <button onClick={() => setActiveUserTab('suggestions')} className={`px-4 py-2 font-medium transition-colors ${activeUserTab === 'suggestions' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                                Suggestions ({userDetails.suggestions?.length || 0})
                            </button>
                        </div>

                        {/* Loading State */}
                        {userDetailsLoading ? (
                            <div className="py-8 text-center text-gray-500">Loading details...</div>
                        ) : (
                            <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                {/* Activities Tab */}
                                {activeUserTab === 'activities' && (
                                    <div className="space-y-3">
                                        {userDetails.activities?.length > 0 ? userDetails.activities.map(activity => (
                                            <div key={activity.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-sm">
                                                <div>
                                                    <h4 className="font-bold text-gray-800 dark:text-white">{activity.events?.title?.en || activity.events?.title?.fr || activity.events?.title?.ar || 'Event'}</h4>
                                                    <p className="text-xs text-gray-500">{new Date(activity.events?.date).toLocaleDateString()} • {activity.events?.category || 'Event'}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded capitalize ${activity.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    activity.status === 'attended' ? 'bg-purple-100 text-purple-800' :
                                                        activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {activity.status || 'pending'}
                                                </span>
                                            </div>
                                        )) : <p className="text-gray-500 text-center py-4">No activities found.</p>}
                                    </div>
                                )}

                                {/* Donations Tab */}
                                {activeUserTab === 'donations' && (
                                    <div className="space-y-3">
                                        {userDetails.donations?.length > 0 ? userDetails.donations.map(donation => (
                                            <div key={donation.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-sm">
                                                <div>
                                                    <h4 className="font-bold text-green-600">{donation.amount} MAD</h4>
                                                    <p className="text-xs text-gray-500">Via {donation.method}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-400 block">{new Date(donation.created_at).toLocaleDateString()}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${donation.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{donation.status || 'pending'}</span>
                                                </div>
                                            </div>
                                        )) : <p className="text-gray-500 text-center py-4">No donations found.</p>}
                                    </div>
                                )}

                                {/* Suggestions Tab */}
                                {activeUserTab === 'suggestions' && (
                                    <div className="space-y-3">
                                        {userDetails.suggestions?.length > 0 ? userDetails.suggestions.map(suggestion => (
                                            <div key={suggestion.id} className="p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-gray-800 dark:text-white">{suggestion.title}</h4>
                                                    <span className="text-xs text-gray-400">{new Date(suggestion.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{suggestion.description}</p>
                                                {suggestion.proposed_date && (
                                                    <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
                                                        Proposed Date: {new Date(suggestion.proposed_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        )) : <p className="text-gray-500 text-center py-4">No suggestions found.</p>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div >
    );
};
export default AdminDashboard;
