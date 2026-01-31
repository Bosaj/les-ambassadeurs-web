import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarPlus, FaNewspaper, FaMoneyBillWave, FaComments, FaSignOutAlt, FaTrash,
    FaUserShield, FaCheck, FaTimes, FaThumbtack, FaUsers, FaCalendarCheck,
    FaEnvelope, FaPhone, FaEye, FaHandHoldingHeart
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';

import { useLanguage } from '../context/LanguageContext';

const PostList = ({ type, data, onDelete, formData, setFormData, setFormType, handleFormSubmit, activeLang, setActiveLang, t, togglePin, onEdit, editingId, onCancel }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold capitalize text-gray-800 dark:text-white">{t.manage} {type === 'news' ? t.tab_news : (type === 'events' ? t.tab_events : (type === 'projects' ? (t.projects_section_title || "Projects") : t.tab_programs))}</h2>
        </div>

        {/* Add New Form */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8 border border-gray-200 dark:border-gray-600">
            <h3 className="font-bold mb-4 text-gray-800 dark:text-white">
                {editingId ? `${t.edit_btn} ${type === 'news' ? t.tab_news : (type === 'events' ? t.tab_events : (type === 'projects' ? "Project" : t.tab_programs))}` : (type === 'news' ? t.add_new_news : (type === 'events' ? t.add_new_event : (type === 'projects' ? (t.add_new_project || "Add New Project") : t.add_new_program)))}
            </h3>

            {/* Language Tabs */}
            <div className="flex gap-2 mb-4">
                {['en', 'fr', 'ar'].map(lang => (
                    <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveLang(lang)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${activeLang === lang
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                    >
                        {lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'العربية'}
                    </button>
                ))}
            </div>

            <form onSubmit={(e) => { setFormType(type); handleFormSubmit(e, type); }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600 dark:text-gray-300">{t.title_label} ({activeLang.toUpperCase()})</label>
                        <input
                            type="text" placeholder={`${t.title_label} in ${activeLang}`} required
                            className="border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                            value={formData.title[activeLang]}
                            onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600 dark:text-gray-300">{t.date_label}</label>
                        <input
                            type="date" required
                            className="border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.image_label}</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept="image/*"
                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                dark:file:bg-gray-700 dark:file:text-white"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                const toastId = toast.loading(t.uploading_image);
                                try {
                                    const fileExt = file.name.split('.').pop();
                                    const fileName = `${Math.random()}.${fileExt}`;
                                    const filePath = `${type}/${fileName}`;

                                    const { error: uploadError } = await supabase.storage
                                        .from('images')
                                        .upload(filePath, file);

                                    if (uploadError) throw uploadError;

                                    const { data: { publicUrl } } = supabase.storage
                                        .from('images')
                                        .getPublicUrl(filePath);

                                    setFormData({ ...formData, image: publicUrl });
                                    toast.success(t.image_uploaded, { id: toastId });
                                } catch (error) {
                                    console.error("Upload error:", error);
                                    toast.error(t.upload_failed, { id: toastId });
                                }
                            }}
                        />
                        {formData.image && (
                            <img src={formData.image} alt={t.preview} className="h-10 w-10 object-cover rounded border" />
                        )}
                    </div>
                    <input
                        type="url" placeholder={t.or_paste_url}
                        className="w-full border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                        value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600 dark:text-gray-300">{t.description_label} ({activeLang.toUpperCase()})</label>
                    <textarea
                        placeholder={`${t.description_label} in ${activeLang}`} required rows="3"
                        className="w-full border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                        value={formData.description[activeLang]}
                        onChange={e => setFormData({ ...formData, description: { ...formData.description, [activeLang]: e.target.value } })}
                    ></textarea>
                </div>

                <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition-colors">
                    {editingId ? t.update_btn : t.add_btn}
                </button>
                {editingId && (
                    <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors ml-2">
                        {t.cancel_btn}
                    </button>
                )}
            </form>
        </div>

        {/* List */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left min-w-[800px]">
                <thead>
                    <tr className="border-b dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
                        <th className="p-4 whitespace-nowrap">{t.table_image}</th>
                        <th className="p-4 min-w-[200px]">{t.table_title}</th>
                        <th className="p-4 whitespace-nowrap">{t.table_date}</th>
                        <th className="p-4 whitespace-nowrap">{t.table_attendees}</th>
                        <th className="p-4 whitespace-nowrap text-center">{t.pin_item}</th>
                        <th className="p-4 whitespace-nowrap text-right">{t.table_actions}</th>
                    </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="p-4 whitespace-nowrap">
                                <img src={item.image_url || item.image} alt="" className="h-10 w-16 object-cover rounded" />
                            </td>
                            <td className="p-4 font-medium">
                                {(item.title?.en || item.title?.fr || item.title?.ar || (typeof item.title === 'string' ? item.title : '') || 'Untitled')}
                            </td>
                            <td className="p-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                {item.date ? new Date(item.date).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-4 whitespace-nowrap text-center">{item.attendees?.length || 0}</td>
                            <td className="p-4 whitespace-nowrap text-center">
                                <button onClick={() => togglePin(type, item.id, item.is_pinned)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition">
                                    <FaThumbtack className={item.is_pinned ? 'text-blue-600' : 'text-gray-300'} />
                                </button>
                            </td>
                            <td className="p-4 whitespace-nowrap text-right">
                                <button onClick={() => onEdit(item)} className="text-blue-500 hover:text-blue-700 p-2 border rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:border-blue-800 transition-colors mr-2">
                                    <FaNewspaper />
                                </button>
                                <button onClick={() => onDelete(type, item.id)} className="text-red-500 hover:text-red-700 p-2 border rounded hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-800 transition-colors">
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    </div >
);

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const { news, programs, projects, events, testimonials, addPost, updatePost, deletePost, togglePin, fetchUserActivities, fetchUserDonations, fetchUserSuggestions } = useData();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('news');
    const [editingId, setEditingId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        const [view, setView] = useState('members'); // 'members' or 'attendance'

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
                                        <th className="p-4 whitespace-nowrap">Name</th>
                                        <th className="p-4 whitespace-nowrap">Email</th>
                                        <th className="p-4 whitespace-nowrap">Role</th>
                                        <th className="p-4 whitespace-nowrap">Phone</th>
                                        <th className="p-4 whitespace-nowrap">City</th>
                                        <th className="p-4 whitespace-nowrap text-right">Actions</th>
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
                                            <td className="p-4 text-right whitespace-nowrap">
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
                </div>
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

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
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
                handleCancelEdit(); // Reset form
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

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 dark:bg-gray-800 text-white p-6 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <h2 className="text-2xl font-bold mb-8 flex justify-between items-center">
                    {t.admin_panel}
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white">
                        <FaTimes />
                    </button>
                </h2>
                <nav className="space-y-2">
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
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.welcome}, {user?.name}</h1>
                        <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors">
                            {t.logout} <FaSignOutAlt />
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
                        {activeTab === 'news' && <PostList type="news" data={news} onDelete={handleDelete} onAdd={addPost} formData={formData} setFormData={setFormData} setFormType={setFormType} handleFormSubmit={handleFormSubmit} activeLang={activeLang} setActiveLang={setActiveLang} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'news')} editingId={editingId} onCancel={handleCancelEdit} />}
                        {activeTab === 'programs' && <PostList type="programs" data={programs} onDelete={handleDelete} onAdd={addPost} formData={formData} setFormData={setFormData} setFormType={setFormType} handleFormSubmit={handleFormSubmit} activeLang={activeLang} setActiveLang={setActiveLang} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'programs')} editingId={editingId} onCancel={handleCancelEdit} />}
                        {activeTab === 'projects' && <PostList type="projects" data={projects} onDelete={handleDelete} onAdd={addPost} formData={formData} setFormData={setFormData} setFormType={setFormType} handleFormSubmit={handleFormSubmit} activeLang={activeLang} setActiveLang={setActiveLang} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'projects')} editingId={editingId} onCancel={handleCancelEdit} />}
                        {activeTab === 'events' && <PostList type="events" data={events} onDelete={handleDelete} onAdd={addPost} formData={formData} setFormData={setFormData} setFormType={setFormType} handleFormSubmit={handleFormSubmit} activeLang={activeLang} setActiveLang={setActiveLang} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'events')} editingId={editingId} onCancel={handleCancelEdit} />}

                        {activeTab === 'testimonials' && (
                            <div>
                                <h3 className="font-bold mb-4 text-gray-800 dark:text-white">{t.add_new_testimonial}</h3>

                                <div className="flex gap-2 mb-4">
                                    {['en', 'fr', 'ar'].map(lang => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => setActiveLang(lang)}
                                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${activeLang === lang
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                                }`}
                                        >
                                            {lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'العربية'}
                                        </button>
                                    ))}
                                </div>

                                <form onSubmit={(e) => {
                                    setFormType('testimonials');
                                    handleFormSubmit(e, 'testimonials');
                                }} className="space-y-4 mb-8 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600 dark:text-gray-300">{t.name_placeholder}</label>
                                            <input
                                                type="text" placeholder={t.name_placeholder} required
                                                className="border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                value={formData.name || ''}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600 dark:text-gray-300">{t.role_placeholder} ({activeLang.toUpperCase()})</label>
                                            <input
                                                type="text" placeholder={t.role_placeholder} required
                                                className="border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                                value={formData.role?.[activeLang] || ''}
                                                onChange={e => setFormData({ ...formData, role: { ...formData.role, [activeLang]: e.target.value } })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600 dark:text-gray-300">{t.rating_label || "Rating"} (1-5)</label>
                                            <input
                                                type="number" min="1" max="5" required
                                                className="border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                value={formData.rating || 5}
                                                onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.image_title}</label>
                                            <div className="flex items-center gap-4">
                                                <input type="file" accept="image/*"
                                                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-white"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;
                                                        const toastId = toast.loading(t.uploading_image);
                                                        try {
                                                            const fileExt = file.name.split('.').pop();
                                                            const fileName = `testimonials/${Math.random()}.${fileExt}`;
                                                            const { error } = await supabase.storage.from('images').upload(fileName, file);
                                                            if (error) throw error;
                                                            const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
                                                            setFormData({ ...formData, image: publicUrl });
                                                            toast.success(t.image_uploaded, { id: toastId });
                                                        } catch (err) { toast.error(t.upload_failed, { id: toastId }); }
                                                    }}
                                                />
                                                {formData.image && <img src={formData.image} alt={t.preview} className="h-10 w-10 object-cover rounded" />}
                                                <input
                                                    type="url" placeholder="URL"
                                                    className="w-full border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                                                    value={formData.image || ''} onChange={e => setFormData({ ...formData, image: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm text-gray-600 dark:text-gray-300">{t.content_placeholder} ({activeLang.toUpperCase()})</label>
                                        <textarea
                                            placeholder={t.content_placeholder} required rows="3"
                                            className="w-full border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                            value={formData.content?.[activeLang] || ''}
                                            onChange={e => setFormData({ ...formData, content: { ...formData.content, [activeLang]: e.target.value } })}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition">{editingId ? t.update_btn : t.add_btn}</button>
                                    {editingId && (
                                        <button type="button" onClick={handleCancelEdit} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition ml-2">
                                            {t.cancel_btn}
                                        </button>
                                    )}
                                </form>

                                <div className="grid grid-cols-1 gap-4">
                                    {testimonials.length > 0 ? testimonials.map(item => (
                                        <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <img src={item.image_url || "https://via.placeholder.com/50"} alt={item.name} className="w-12 h-12 rounded-full object-cover" />
                                                <div>
                                                    <h4 className="font-bold dark:text-white">{item.name}</h4>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col">
                                                        <span>{typeof item.role === 'object' ? (item.role[activeLang] || item.role.en) : item.role}</span>
                                                        {item.rating && <span className="text-yellow-500 text-xs">{'★'.repeat(item.rating)}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => togglePin('testimonials', item.id, item.is_pinned)} className="text-gray-400 hover:text-blue-500 p-2">
                                                    <FaThumbtack className={item.is_pinned ? 'text-blue-600' : ''} />
                                                </button>
                                                <button onClick={() => handleEdit(item, 'testimonials')} className="text-blue-500 hover:text-blue-700 p-2">
                                                    <FaNewspaper />
                                                </button>
                                                <button onClick={() => handleDelete('testimonials', item.id)} className="text-red-500 hover:text-red-700">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    )) : <p className="text-gray-500">{t.no_testimonials}</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'donations' && <div className="text-gray-500 dark:text-gray-400 text-center py-10">{t.donation_management_soon}</div>}

                        {activeTab === 'admins' && user?.email === 'oussousselhadji@gmail.com' && (
                            <AdminManagement />
                        )}
                        {activeTab === 'users' && <CommunityManagement />}
                    </div>
                </main>
            </div >
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
