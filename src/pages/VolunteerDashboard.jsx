import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import {
    FaUserShield, FaSignOutAlt, FaHandHoldingHeart, FaCalendarCheck,
    FaStar, FaHistory, FaListAlt, FaLightbulb, FaCheckCircle,
    FaClock, FaTimesCircle, FaMoneyBillWave, FaTimes
} from 'react-icons/fa';
import ConfirmationModal from '../components/ConfirmationModal';

const VolunteerDashboard = () => {
    const { user, logout } = useAuth();
    const { t, language } = useLanguage();
    const {
        events: realEvents,
        programs: realPrograms,
        registerForEvent,
        addPost,
        getLocalizedContent,
        fetchUserActivities,
        fetchUserDonations,
        submitSuggestion,
        cancelRegistration
    } = useData();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [userActivities, setUserActivities] = useState([]);
    const [userDonations, setUserDonations] = useState([]);
    const [testimonial, setTestimonial] = useState('');

    const [rating, setRating] = useState(5);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null });

    // Suggestion Form State
    const [suggestionForm, setSuggestionForm] = useState({
        title: '',
        description: '',
        proposed_date: ''
    });

    useEffect(() => {
        if (user?.email) {
            loadUserData();
        }
    }, [user?.email, activeTab]);

    const loadUserData = async () => {
        if (activeTab === 'activities' || activeTab === 'overview') {
            const activities = await fetchUserActivities(user.email);
            setUserActivities(activities);
        }
        if (activeTab === 'impact' || activeTab === 'overview') {
            const donations = await fetchUserDonations(user.email);
            setUserDonations(donations);
        }
    };

    // Combine events and programs for the dashboard list
    const allOpportunities = [...(realEvents || []), ...(realPrograms || [])]
        .filter(item => new Date(item.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleJoinEvent = async (event) => {
        if (!user) return;

        // Check if already joined (client-side check for immediate feedback)
        const isJoined = event.attendees?.some(a => a.email === user.email);
        if (isJoined) {
            toast.error(t.already_joined || "You have already joined this event.");
            return;
        }

        const toastId = toast.loading(t.joining_event || "Joining event...");
        try {
            console.log("DEBUG: handleJoinEvent user:", user);
            const userName = user.full_name || user.user_metadata?.full_name || user.email;
            console.log("DEBUG: Resolved name:", userName);

            await registerForEvent('events', event.id, {
                name: userName,
                email: user.email
            });
            toast.success(t.event_joined_success, { id: toastId });
            loadUserData(); // Reload activities
        } catch (error) {
            console.error(error);
            toast.error(t.error_occurred || "Failed to join event", { id: toastId });
        }
    };



    const handleCancelEvent = (activity) => {
        setConfirmModal({ isOpen: true, data: activity });
    };

    const performCancelEvent = async () => {
        const activity = confirmModal.data;
        if (!activity) return;

        const toastId = toast.loading(t.cancelling || "Cancelling registration...");
        try {
            await cancelRegistration(activity.events?.category || 'event', activity.events?.id, user.email);
            toast.success(t.registration_cancelled || "Registration cancelled successfully", { id: toastId });
            loadUserData(); // Reload activities
        } catch (error) {
            console.error(error);
            toast.error(t.error_occurred || "Failed to cancel", { id: toastId });
        } finally {
            setConfirmModal({ isOpen: false, data: null });
        }
    };

    const handleRequestAdmin = async () => {
        if (!window.confirm(t.confirm_admin_request || "Request Admin access?")) return;

        const toastId = toast.loading(t.submitting_request || "Submitting request...");
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ request_status: 'pending' })
                .eq('id', user.id);

            if (error) throw error;
            toast.success(t.request_submitted || "Request submitted successfully!", { id: toastId });
        } catch (error) {
            console.error('Error requesting admin:', error);
            toast.error(t.request_failed || "Request failed", { id: toastId });
        }
    };

    const handleSubmitTestimonial = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(t.processing || "Processing...");
        try {
            await addPost('testimonials', {
                name: user.full_name || user.user_metadata?.full_name || "Volunteer",
                role: { en: 'Volunteer', fr: 'Bénévole', ar: 'متطوع' },
                content: { [language]: testimonial },
                rating: rating,
                image_url: user.user_metadata?.avatar_url || '',
                is_approved: false
            });
            toast.success(t.testimonial_submitted_approval, { id: toastId });
            setTestimonial('');
        } catch (error) {
            console.error(error);
            toast.error(t.error_occurred, { id: toastId });
        }
    };

    const handleSuggestionSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(t.suggestion_submitting || "Submitting suggestion...");
        const result = await submitSuggestion({
            user_id: user.id,
            ...suggestionForm
        });

        if (result.error) {
            toast.error(t.suggestion_failed || "Failed to submit suggestion", { id: toastId });
        } else {
            toast.success(t.suggestion_success || "Suggestion submitted successfully!", { id: toastId });
            setSuggestionForm({ title: '', description: '', proposed_date: '' });
        }
    };

    // Calculate total donations
    const totalDonated = userDonations.reduce((sum, d) => sum + Number(d.amount), 0);

    const renderTabs = () => (
        <div className="flex flex-wrap gap-2 mb-8 border-b dark:border-gray-700 pb-2">
            {[
                { id: 'overview', icon: FaListAlt, label: t.overview || 'Overview' },
                { id: 'activities', icon: FaHistory, label: t.my_activities || 'My Activities' },
                { id: 'impact', icon: FaHandHoldingHeart, label: t.my_impact || 'My Impact' },
                { id: 'suggestions', icon: FaLightbulb, label: t.suggestions || 'Suggestion Box' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === tab.id
                        ? 'bg-blue-900 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    <tab.icon /> {tab.label}
                </button>
            ))}
        </div>
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"><FaCheckCircle /> {t.status_confirmed || "Confirmed"}</span>;
            case 'attended': return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"><FaCheckCircle /> {t.status_attended || "Attended"}</span>;
            case 'rejected': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"><FaTimesCircle /> {t.status_rejected || "Rejected"}</span>;
            default: return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"><FaClock /> {t.status_pending_badge || "Pending"}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.welcome}, {user?.full_name || user?.email?.split('@')[0]}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{t.volunteer_dashboard}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        {user?.role !== 'admin' && (
                            <button onClick={handleRequestAdmin} className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-4 py-2 rounded hover:bg-yellow-200 flex items-center gap-2 text-sm justify-center flex-1 md:flex-none transition-colors">
                                <FaUserShield /> {t.request_admin || "Request Admin Access"}
                            </button>
                        )}
                        <button onClick={handleLogout} className="bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-sm justify-center flex-1 md:flex-none transition-colors">
                            <FaSignOutAlt /> {t.logout}
                        </button>
                    </div>
                </div>

                {renderTabs()}

                {/* Content */}
                <div className="space-y-8">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-900 text-white rounded-xl p-6 shadow-md flex items-center justify-between cursor-pointer transform hover:scale-105 transition" onClick={() => setActiveTab('impact')}>
                                    <div>
                                        <p className="text-lg opacity-80">{t.donations_made || "Total Donated"}</p>
                                        <h2 className="text-4xl font-bold">{totalDonated} {t.currency_mad || "MAD"}</h2>
                                    </div>
                                    <FaMoneyBillWave className="text-5xl opacity-50" />
                                </div>
                                <div className="bg-red-500 text-white rounded-xl p-6 shadow-md flex items-center justify-between cursor-pointer transform hover:scale-105 transition" onClick={() => setActiveTab('activities')}>
                                    <div>
                                        <p className="text-lg opacity-80">{t.events_joined}</p>
                                        <h2 className="text-4xl font-bold">{userActivities.length}</h2>
                                    </div>
                                    <FaCalendarCheck className="text-5xl opacity-50" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Upcoming Events List */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700 transition-colors">
                                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{t.upcoming_opportunities}</h2>
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {allOpportunities.length === 0 ? (
                                            <p className="text-gray-500 dark:text-gray-400">{t.no_events || "No upcoming events."}</p>
                                        ) : (
                                            allOpportunities.map(event => {
                                                const isJoined = event.attendees?.some(a => a.email === user?.email);
                                                return (
                                                    <div key={event.id} className="border dark:border-gray-700 p-4 rounded-lg hover:shadow-md transition bg-gray-50 dark:bg-gray-700/50">
                                                        <h3 className="font-bold text-blue-900 dark:text-blue-400">{getLocalizedContent(event.title, language)}</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {new Date(event.date).toLocaleDateString()} • {event.category}
                                                        </p>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {event.attendees?.length || 0} {t.attendees || "attendees"}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleJoinEvent(event)}
                                                            disabled={isJoined}
                                                            className={`mt-3 w-full py-2 rounded font-medium transition ${isJoined
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 cursor-default"
                                                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                                                }`}
                                                        >
                                                            {isJoined ? (t.joined || "Joined") : t.join_event_btn}
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Testimonial Form */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700 transition-colors">
                                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{t.share_story}</h2>
                                    <form onSubmit={handleSubmitTestimonial}>
                                        <textarea
                                            value={testimonial}
                                            onChange={(e) => setTestimonial(e.target.value)}
                                            className="w-full border dark:border-gray-600 p-3 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                            rows="4"
                                            placeholder={t.testimonial_placeholder}
                                            required
                                        ></textarea>
                                        <button className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2">
                                            <FaStar /> {t.submit_testimonial}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ACTIVITIES TAB */}
                    {activeTab === 'activities' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                <FaHistory className="text-blue-500" /> {t.activity_history || "My Activity History"}
                            </h2>
                            {userActivities.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-10">{t.no_activities_joined || "You usually haven't joined any events yet."}</p>
                            ) : (
                                <div className="space-y-4">
                                    {userActivities.map(activity => (
                                        <div key={activity.id} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={activity.events?.image_url || "https://via.placeholder.com/150"}
                                                    alt="Event"
                                                    className="w-16 h-16 rounded object-cover"
                                                />
                                                <div>
                                                    <h3 className="font-bold text-gray-800 dark:text-white">
                                                        {getLocalizedContent(activity.events?.title, language) || "Untitled Event"}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(activity.events?.date).toLocaleDateString()}
                                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${activity.events?.category === 'program' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' :
                                                            activity.events?.category === 'project' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' :
                                                                'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                                                            }`}>
                                                            {activity.events?.category || 'Event'}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {t.registered_on || "Registered on:"} {new Date(activity.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                {getStatusBadge(activity.status)}
                                                {activity.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancelEvent(activity)}
                                                        className="block mt-2 text-xs text-red-500 hover:text-red-700 underline mx-auto"
                                                    >
                                                        {t.cancel_registration || "Cancel"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* IMPACT TAB */}
                    {activeTab === 'impact' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                <FaHandHoldingHeart className="text-red-500" /> {t.donation_impact || "My Donation Impact"}
                            </h2>
                            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8 rounded-2xl mb-8 text-center">
                                <p className="text-xl mb-2 opacity-90">{t.total_contribution || "Total Contribution"}</p>
                                <h3 className="text-5xl font-bold">{totalDonated} <span className="text-2xl">MAD</span></h3>
                                <p className="mt-4 text-sm opacity-75">{t.thank_you_diff || "Thank you for making a difference!"}</p>
                            </div>

                            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{t.donation_history || "Donation History"}</h3>
                            {userDonations.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t.no_donations_found || "No donations found yet."}</p>
                            ) : (
                                <div className="space-y-3">
                                    {userDonations.map(donation => (
                                        <div key={donation.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700">
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white">{donation.method || "Direct Donation"}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(donation.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className="font-bold text-green-600 dark:text-green-400">+{donation.amount} MAD</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SUGGESTIONS TAB */}
                    {activeTab === 'suggestions' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                <FaLightbulb className="text-yellow-500" /> {t.suggest_event || "Suggest an Event"}
                            </h2>

                            <form onSubmit={handleSuggestionSubmit} className="max-w-2xl mx-auto space-y-6">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{t.event_title_label || "Event Title"}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                                        value={suggestionForm.title}
                                        onChange={e => setSuggestionForm({ ...suggestionForm, title: e.target.value })}
                                        placeholder={t.event_title_placeholder || "e.g., Beach Cleanup Drive"}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{t.event_desc_label || "Detailed Description"}</label>
                                    <textarea
                                        required
                                        className="w-full border dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                                        rows="5"
                                        value={suggestionForm.description}
                                        onChange={e => setSuggestionForm({ ...suggestionForm, description: e.target.value })}
                                        placeholder={t.event_desc_placeholder || "Describe the objective, target audience, and requirements..."}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{t.proposed_date_label || "Proposed Date (Optional)"}</label>
                                    <input
                                        type="date"
                                        className="w-full border dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                                        value={suggestionForm.proposed_date}
                                        onChange={e => setSuggestionForm({ ...suggestionForm, proposed_date: e.target.value })}
                                    />
                                </div>
                                <button className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition shadow-lg">
                                    {t.submit_suggestion || "Submit Suggestion"}
                                </button>
                            </form>
                        </div>
                    )}

                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={performCancelEvent}
                title={t.confirm_cancel_registration || "Cancel Registration"}
                message={t.confirm_cancel_message || "Are you sure you want to cancel your registration for this event?"}
                isDangerous={true}
            />
        </div>
    );
};

export default VolunteerDashboard;
