import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { FaCalendarPlus, FaNewspaper, FaMoneyBillWave, FaComments, FaSignOutAlt, FaTrash, FaUserShield, FaCheck, FaTimes, FaThumbtack, FaUsers, FaCalendarCheck, FaEnvelope, FaPhone } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

import { useLanguage } from '../context/LanguageContext';

const PostList = ({ type, data, onDelete, formData, setFormData, setFormType, handleFormSubmit, activeLang, setActiveLang, t, togglePin }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold capitalize text-gray-800 dark:text-white">{t.manage} {type === 'news' ? t.tab_news : (type === 'events' ? t.tab_events : t.tab_programs)}</h2>
        </div>

        {/* Add New Form */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8 border border-gray-200 dark:border-gray-600">
            <h3 className="font-bold mb-4 text-gray-800 dark:text-white">{type === 'news' ? t.add_new_news : (type === 'events' ? t.add_new_event : t.add_new_program)}</h3>

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
                    {t.add_btn}
                </button>
            </form>
        </div>

        {/* List */}
        < div className="overflow-x-auto" >
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">
                        <th className="pb-3">{t.table_image}</th>
                        <th className="pb-3">{t.table_title}</th>
                        <th className="pb-3">{t.table_date}</th>
                        <th className="pb-3">{t.table_attendees}</th>
                        <th className="pb-3 text-center">{t.pin_item}</th>
                        <th className="pb-3 text-right">{t.table_actions}</th>
                    </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-200">
                    {data.map((item) => (
                        <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 transition-colors">
                            <td className="py-3">
                                <img src={item.image_url || item.image} alt="" className="h-10 w-16 object-cover rounded" />
                            </td>
                            <td className="py-3 font-medium">
                                {(item.title?.en || item.title?.fr || item.title?.ar || (typeof item.title === 'string' ? item.title : '') || 'Untitled')}
                            </td>
                            <td className="py-3 text-gray-500 dark:text-gray-400">
                                {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td className="py-3">{item.attendees?.length || 0}</td>
                            <td className="py-3 text-center">
                                <button onClick={() => togglePin(type, item.id, item.is_pinned)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                    <FaThumbtack className={item.is_pinned ? 'text-blue-600' : 'text-gray-300'} />
                                </button>
                            </td>
                            <td className="py-3 text-right">
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
    const { news, programs, events, testimonials, addPost, deletePost, togglePin } = useData();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('news');

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
                    <form onSubmit={handleInvite} className="flex gap-4">
                        <input
                            type="email" required placeholder="User Email"
                            className="flex-1 border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                        />
                        <button disabled={loading} className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition">
                            {loading ? t.processing : t.send_invitation}
                        </button>
                    </form>
                </div>
                <div>
                    <h3 className="font-bold mb-4 text-gray-800 dark:text-white">Pending Requests</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
                        {requests.length === 0 ? <p className="p-4 text-center">No pending requests</p> : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="p-3">Name</th><th className="p-3 text-right">Actions</th></tr></thead>
                                <tbody>{requests.map(r => (
                                    <tr key={r.id} className="border-t dark:border-gray-600"><td className="p-3 dark:text-white">{r.full_name}</td><td className="p-3 text-right"><button onClick={() => handleApprove(r.id)} className="text-green-500 mr-2"><FaCheck /></button><button onClick={() => handleDeny(r.id)} className="text-red-500"><FaTimes /></button></td></tr>
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
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Phone</th>
                                        <th className="p-4">City</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="p-4 font-medium dark:text-white">{u.full_name}</td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{u.role}</span></td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400">{u.phone_number || '-'}</td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400">{u.city || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    <tr>
                                        <th className="p-4">Event</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Attendee Name</th>
                                        <th className="p-4">Attendee Email</th>
                                        <th className="p-4">Registered At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {attendees.map(a => (
                                        <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="p-4 font-medium dark:text-white">{a.events?.title || 'Unknown Event'}</td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400">{a.events?.date ? new Date(a.events.date).toLocaleDateString() : '-'}</td>
                                            <td className="p-4 dark:text-gray-300">{a.name}</td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400">{a.email}</td>
                                            <td className="p-4 text-gray-400 text-sm">{new Date(a.created_at).toLocaleString()}</td>
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

    const handleFormSubmit = (e, type) => {
        e.preventDefault();
        const targetType = type || formType;
        const toastId = toast.loading(t.processing || "Processing...");

        addPost(targetType, formData)
            .then(() => {
                toast.success(t.item_added_success, { id: toastId });
                setFormData({
                    title: { en: '', fr: '', ar: '' },
                    date: '',
                    image: '',
                    description: { en: '', fr: '', ar: '' }
                });
            })
            .catch((error) => {
                console.error(error);
                toast.error(t.error_adding_item || "Error adding item", { id: toastId });
            });
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-blue-900 dark:bg-gray-800 text-white p-6 hidden md:block transition-colors duration-300">
                <h2 className="text-2xl font-bold mb-8">{t.admin_panel}</h2>
                <nav className="space-y-2">
                    <button onClick={() => setActiveTab('news')} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'news' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaNewspaper /> {t.manage_news}
                    </button>
                    <button onClick={() => setActiveTab('programs')} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'programs' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaCalendarPlus /> {t.manage_programs}
                    </button>
                    <button onClick={() => setActiveTab('events')} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'events' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaCalendarCheck /> {t.manage_events}
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'users' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaUsers /> {t.manage_users || "Manage Community"}
                    </button>
                    <button onClick={() => setActiveTab('donations')} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'donations' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaMoneyBillWave /> {t.donations}
                    </button>
                    <button onClick={() => setActiveTab('testimonials')} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'testimonials' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaComments /> {t.manage_testimonials}
                    </button>
                    {user?.email === 'oussousselhadji@gmail.com' && (
                        <button onClick={() => setActiveTab('admins')} className={`w-full text-left p-3 rounded flex items-center gap-3 text-yellow-300 transition-colors ${activeTab === 'admins' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                            <FaUserShield /> {t.manage_admins}
                        </button>
                    )}
                    <button onClick={handleLogout} className="w-full text-left p-3 rounded flex items-center gap-3 text-red-200 hover:bg-blue-800 dark:hover:bg-gray-700 mt-8 transition-colors">
                        <FaSignOutAlt /> {t.logout}
                    </button>
                </nav>
            </aside>

            {/* Mobile Header / Content */}
            <div className="flex-1">
                <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center md:hidden transition-colors duration-300">
                    <h1 className="font-bold text-blue-900 dark:text-white">{t.admin_panel}</h1>
                    <button onClick={handleLogout} className="text-gray-600 dark:text-gray-300"><FaSignOutAlt /></button>
                </header>

                <main className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.welcome}, {user?.name}</h1>
                        <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors">
                            {t.logout} <FaSignOutAlt />
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
                        {activeTab === 'news' && <PostList type="news" data={news} onDelete={handleDelete} onAdd={addPost} formData={formData} setFormData={setFormData} setFormType={setFormType} handleFormSubmit={handleFormSubmit} activeLang={activeLang} setActiveLang={setActiveLang} t={t} togglePin={togglePin} />}
                        {activeTab === 'programs' && <PostList type="programs" data={programs} onDelete={handleDelete} onAdd={addPost} formData={formData} setFormData={setFormData} setFormType={setFormType} handleFormSubmit={handleFormSubmit} activeLang={activeLang} setActiveLang={setActiveLang} t={t} togglePin={togglePin} />}
                        {activeTab === 'events' && <PostList type="events" data={events} onDelete={handleDelete} onAdd={addPost} formData={formData} setFormData={setFormData} setFormType={setFormType} handleFormSubmit={handleFormSubmit} activeLang={activeLang} setActiveLang={setActiveLang} t={t} togglePin={togglePin} />}

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
                                    <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition">{t.add_btn}</button>
                                </form>

                                <div className="grid grid-cols-1 gap-4">
                                    {testimonials.length > 0 ? testimonials.map(item => (
                                        <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center">
                                            <div className="flex items-center gap-4">
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
        </div >
    );
};
export default AdminDashboard;
