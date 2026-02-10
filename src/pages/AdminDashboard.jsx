import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarPlus, FaNewspaper, FaMoneyBillWave, FaComments, FaSignOutAlt, FaTrash,
    FaUserShield, FaCheck, FaTimes, FaThumbtack, FaUsers, FaCalendarCheck,
    FaPhone, FaHandHoldingHeart, FaChartPie, FaPlus, FaHandshake
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import MembershipRequests from '../components/admin/MembershipRequests';
import PartnerForm from '../components/admin/PartnerForm';
import PostForm from '../components/admin/PostForm';
import DashboardOverview from '../components/admin/DashboardOverview';
import DashboardStats from '../components/admin/DashboardStats';
import CommunityManagement from '../components/admin/CommunityManagement';
import DonationsList from '../components/admin/DonationsList';
import PostList from '../components/admin/PostList';

import { useLanguage } from '../context/LanguageContext';

// MembershipHistoryModal moved to ../components/admin/MembershipHistoryModal.jsx



const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { t, language } = useLanguage();

    const { news, programs, projects, events, testimonials, partners, addPost, updatePost, deletePost, togglePin, fetchUserActivities, fetchUserDonations, fetchUserSuggestions, users, verifyMember } = useData();
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
                fetchUserDonations(userProfile.email, userProfile.id),
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
            } catch { toast.error("Error approving"); }
        };
        const handleDeny = async (id) => {
            try {
                await supabase.from('profiles').update({ request_status: 'denied' }).eq('id', id);
                toast.success("Request denied");
                fetchRequests();
            } catch { toast.error("Error denying"); }
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
                            type="email" required placeholder={t.user_email_label || "User Email"}
                            className="flex-1 border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                        />
                        <button disabled={loading} className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition whitespace-nowrap">
                            {loading ? (t.processing || "Processing...") : t.send_invitation}
                        </button>
                    </form>
                </div>
                <div>
                    <h3 className="font-bold mb-4 text-gray-800 dark:text-white">{t.pending_requests || "Pending Requests"}</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden overflow-x-auto">
                        {requests.length === 0 ? <p className="p-4 text-center">{t.no_pending_requests || "No pending requests"}</p> : (
                            <table className="w-full text-left min-w-[300px]">
                                <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="p-3 whitespace-nowrap">{t.table_header_name || "Name"}</th><th className="p-3 text-right whitespace-nowrap">{t.actions || "Actions"}</th></tr></thead>
                                <tbody>{requests.map(r => (
                                    <tr key={r.id} className="border-t dark:border-gray-600"><td className="p-3 dark:text-white whitespace-nowrap">{(language === 'ar' && r.full_name_ar) ? r.full_name_ar : r.full_name}</td><td className="p-3 text-right whitespace-nowrap"><button onClick={() => handleApprove(r.id)} className="text-green-500 mr-2"><FaCheck /></button><button onClick={() => handleDeny(r.id)} className="text-red-500"><FaTimes /></button></td></tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // CommunityManagement moved to ../components/admin/CommunityManagement.jsx




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
            is_approved: item.is_approved,
            // Partners specific
            website_url: item.website_url || '',
            image_url: item.image_url || ''
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
                    <button onClick={() => { setActiveTab('partners'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'partners' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaHandshake /> {t.tab_partners || "Partners"}
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
                    <button onClick={() => { setActiveTab('admins'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded flex items-center gap-3 text-yellow-300 transition-colors ${activeTab === 'admins' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaUserShield /> {t.manage_admins}
                    </button>
                    <button onClick={() => navigate('/dashboard/volunteer')} className="w-full text-left p-3 rounded flex items-center gap-3 text-green-300 hover:bg-blue-800 dark:hover:bg-gray-700 transition-colors">
                        <FaHandHoldingHeart /> {t.volunteer_view || "Volunteer View"}
                    </button>
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
                                data={{ news, programs, projects, events, users, donations: [] }}
                                t={t}
                            />
                            <DashboardOverview
                                t={t}
                                news={news}
                                events={events}
                                projects={projects}
                                users={users}
                                testimonials={testimonials}
                                onNavigate={setActiveTab}
                                onAdd={handleAdd}
                                language={language}
                            />
                        </div>
                    )}

                    {activeTab !== 'overview' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300 min-h-[500px]">
                            {activeTab === 'news' && <PostList type="news" data={news} onDelete={handleDelete} onAdd={() => handleAdd('news')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeLang={language} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'news')} />}
                            {activeTab === 'programs' && <PostList type="programs" data={programs} onDelete={handleDelete} onAdd={() => handleAdd('programs')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeLang={language} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'programs')} />}
                            {activeTab === 'projects' && <PostList type="projects" data={projects} onDelete={handleDelete} onAdd={() => handleAdd('projects')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeLang={language} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'projects')} />}
                            {activeTab === 'events' && <PostList type="events" data={events} onDelete={handleDelete} onAdd={() => handleAdd('events')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeLang={language} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'events')} />}
                            {activeTab === 'partners' && <PostList type="partners" data={partners} onDelete={handleDelete} onAdd={() => handleAdd('partners')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeLang={language} t={t} togglePin={togglePin} onEdit={(item) => handleEdit(item, 'partners')} />}


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
                                        )) : <p className="text-gray-500">{t.no_testimonials || "No testimonials yet"}</p>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'donations' && <DonationsList t={t} />}

                            {activeTab === 'admins' && user?.email === 'oussousselhadji@gmail.com' && (
                                <AdminManagement />
                            )}
                            {activeTab === 'users' && <CommunityManagement t={t} onViewUser={handleViewUser} />}
                            {activeTab === 'memberships' && <MembershipRequests />}
                        </div>
                    )}
                </main>
            </div>

            {/* Post Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCancelEdit}
                title={editingId ? `${t.edit_btn} ${formType}` : `${t.add_btn} ${formType}`}
            >
                {formType === 'partners' ? (
                    <PartnerForm
                        formData={formData}
                        setFormData={setFormData}
                        handleFormSubmit={(e) => handleFormSubmit(e, 'partners')}
                        onCancel={handleCancelEdit}
                        t={t}
                    />
                ) : (
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
                )}
            </Modal>
            {/* User Details Modal */}
            <Modal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                title={selectedUser ? `${t.user_details}: ${(language === 'ar' && selectedUser.full_name_ar) ? selectedUser.full_name_ar : selectedUser.full_name}` : t.user_details}
            >
                {selectedUser && (
                    <div className="space-y-6">
                        {/* Profile Info */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <img src={selectedUser.avatar_url || `https://ui-avatars.com/api/?name=${(language === 'ar' && selectedUser.full_name_ar) ? selectedUser.full_name_ar : selectedUser.full_name}`} alt={selectedUser.full_name} className="w-16 h-16 rounded-full" />
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">{(language === 'ar' && selectedUser.full_name_ar) ? selectedUser.full_name_ar : selectedUser.full_name}</h3>
                                {selectedUser.username && <p className="text-sm text-gray-500 dark:text-gray-400">@{selectedUser.username}</p>}
                                <p className="text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-xs px-2 py-1 rounded ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{t[`role_${selectedUser.role}`] || selectedUser.role}</span>
                                    {selectedUser.phone_number && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded flex items-center gap-1"><FaPhone className="text-[10px]" /> {selectedUser.phone_number}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b dark:border-gray-700">
                            <button onClick={() => setActiveUserTab('activities')} className={`px-4 py-2 font-medium transition-colors ${activeUserTab === 'activities' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                                {t.tab_activities} ({userDetails.activities?.length || 0})
                            </button>
                            <button onClick={() => setActiveUserTab('donations')} className={`px-4 py-2 font-medium transition-colors ${activeUserTab === 'donations' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                                {t.tab_donations} ({userDetails.donations?.length || 0})
                            </button>
                            <button onClick={() => setActiveUserTab('suggestions')} className={`px-4 py-2 font-medium transition-colors ${activeUserTab === 'suggestions' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                                {t.tab_suggestions} ({userDetails.suggestions?.length || 0})
                            </button>
                        </div>

                        {/* Loading State */}
                        {userDetailsLoading ? (
                            <div className="py-8 text-center text-gray-500">{t.loading_details || "Loading details..."}</div>
                        ) : (
                            <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                {/* Activities Tab */}
                                {activeUserTab === 'activities' && (
                                    <div className="space-y-3">
                                        {userDetails.activities?.length > 0 ? userDetails.activities.map(activity => (
                                            <div key={activity.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-sm">
                                                <div>
                                                    <h4 className="font-bold text-gray-800 dark:text-white">{activity.events?.title?.[language] || activity.events?.title?.en || activity.events?.title?.fr || activity.events?.title?.ar || t.event}</h4>
                                                    <p className="text-xs text-gray-500">{new Date(activity.events?.date).toLocaleDateString()} • {t[activity.events?.category] || activity.events?.category || t.event}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded capitalize ${activity.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    activity.status === 'attended' ? 'bg-purple-100 text-purple-800' :
                                                        activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {t[`status_${activity.status}`] || activity.status || t.status_pending}
                                                </span>
                                            </div>
                                        )) : <p className="text-gray-500 text-center py-4">{t.no_activities_found}</p>}
                                    </div>
                                )}

                                {/* Donations Tab */}
                                {activeUserTab === 'donations' && (
                                    <div className="space-y-3">
                                        {userDetails.donations?.length > 0 ? userDetails.donations.map(donation => (
                                            <div key={donation.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-sm">
                                                <div>
                                                    <h4 className="font-bold text-green-600">{donation.amount} {t.currency_mad || 'DH'}</h4>
                                                    <p className="text-xs text-gray-500">{t.via} {t[`payment_method_${donation.method}`] || donation.method}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-400 block">{new Date(donation.created_at).toLocaleDateString()}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${donation.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{t[`status_${donation.status}`] || donation.status || t.status_pending}</span>
                                                </div>
                                            </div>
                                        )) : <p className="text-gray-500 text-center py-4">{t.no_donations_found}</p>}
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
                                                        {t.proposed_date}: {new Date(suggestion.proposed_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        )) : <p className="text-gray-500 text-center py-4">{t.no_suggestions_found}</p>}
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
