import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { translations } from '../translations';
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight, FaThumbtack } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AttendeesList from './AttendeesList';

const News = () => {
    const { language } = useLanguage();
    const { news, events, getLocalizedContent, registerForEvent, cancelRegistration } = useData();
    const t = translations[language];
    const { user } = useAuth();
    const [selectedNewsId, setSelectedNewsId] = useState(null); // { id, type }

    // Derive active item from global state
    const activeNews = selectedNewsId
        ? (selectedNewsId.type === 'news'
            ? news.find(n => n.id === selectedNewsId.id)
            : events.find(e => e.id === selectedNewsId.id))
        : null;

    // Merge type
    const currentNewsItem = activeNews ? { ...activeNews, type: selectedNewsId.type } : null;

    const [guestForm, setGuestForm] = useState({ name: '', email: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

    const handleCancelClick = (eventId) => {
        setConfirmModal({ isOpen: true, id: eventId });
    };

    const performCancelRegistration = async () => {
        const eventId = confirmModal.id;
        const toastId = toast.loading(t.cancelling || "Cancelling...");
        try {
            await cancelRegistration('event', eventId, user?.email);
            toast.success(t.registration_cancelled || "Cancelled successfully", { id: toastId });
            // Don't close modal, it will update automatically
        } catch (error) {
            console.error(error);
            toast.error(t.error_occurred || "Error occurred", { id: toastId });
        } finally {
            setConfirmModal({ isOpen: false, id: null });
        }
    };

    // Separate News and Events, sort by date, and take top 3 of each
    const sortedNews = (news || []).map(n => ({ ...n, type: 'news', displayCategory: 'News' }))
        .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
        .slice(0, 3);

    const sortedEvents = (events || []).map(e => ({ ...e, type: 'event', displayCategory: e.category || 'Event' }))
        .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
        .slice(0, 3);

    const displayItems = [...sortedNews, ...sortedEvents];

    return (
        <section id="news" className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-gray-100 mb-4">
                        {t.news_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.news_desc}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayItems.length > 0 ? displayItems.map((item, index) => (
                        <div
                            key={item.id || index}
                            className="bg-transparent rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition group cursor-pointer"
                            onClick={() => setSelectedNewsId({ id: item.id, type: item.type })}
                        >
                            <div className="relative">
                                <img
                                    src={item.image_url || "https://via.placeholder.com/300"}
                                    alt={getLocalizedContent(item.title, language)}
                                    className="w-full h-48 object-cover transition group-hover:scale-105"
                                />
                                <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider ${item.type === 'news' ? 'bg-red-500 text-white' :
                                    item.category === 'program' ? 'bg-purple-500 text-white' :
                                        item.category === 'project' ? 'bg-amber-500 text-white' :
                                            'bg-blue-500 text-white'
                                    }`}>
                                    {item.displayCategory}
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <span className="flex items-center gap-1">
                                        <FaCalendarAlt /> <span>{new Date(item.date).toLocaleDateString()}</span>
                                    </span>
                                    {item.location && (
                                        <span className="flex items-center gap-1 ml-3">
                                            <FaMapMarkerAlt /> <span>{getLocalizedContent(item.location, language)}</span>
                                        </span>
                                    )}
                                    {item.is_pinned && <span className="flex items-center gap-1 text-blue-600 ml-auto"><FaThumbtack /> {t.pin_item || "Pinned"}</span>}
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-white mb-3 line-clamp-2">
                                    {getLocalizedContent(item.title, language)}
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                                    {getLocalizedContent(item.description, language)}
                                </p>
                                <div className="flex items-center justify-between mt-4">
                                    {item.type === 'event' && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                                                {item.attendees ? item.attendees.filter(a => a.status !== 'rejected').length : 0}
                                            </span>
                                            <AttendeesList attendees={item.attendees} size="w-6 h-6" />
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedNewsId({ id: item.id, type: item.type });
                                        }}
                                        className="inline-flex items-center text-red-500 hover:text-red-600 font-medium hover:underline ml-auto"
                                    >
                                        <span>{t.read_more}</span>
                                        <FaArrowRight className={`ml-1 ${language === 'ar' ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="col-span-full text-center text-gray-500">{t.loading_events}</p>
                    )}
                </div>

                <div className="text-center mt-12">
                    <Link
                        to="/news"
                        className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <span>{t.view_all_news}</span>
                        <FaArrowRight className={`ml-2 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </Link>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={!!currentNewsItem}
                onClose={() => setSelectedNewsId(null)}
                title={getLocalizedContent(currentNewsItem?.title, language)}
                heroImage={currentNewsItem?.image_url || currentNewsItem?.image}
            >
                <div className="relative">
                    <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                        <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                            <FaCalendarAlt />
                            <span>{currentNewsItem?.date ? new Date(currentNewsItem.date).toLocaleDateString() : ''}</span>
                        </span>
                        {currentNewsItem?.location && getLocalizedContent(currentNewsItem.location, language) && (
                            <span className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full border border-red-100 dark:border-red-800">
                                <FaMapMarkerAlt />
                                <span>{getLocalizedContent(currentNewsItem.location, language)}</span>
                            </span>
                        )}
                        {currentNewsItem?.type === 'event' && (
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-blue-900 dark:text-blue-300 font-semibold text-xs">
                                    {currentNewsItem.attendees ? currentNewsItem.attendees.filter(a => a.status !== 'rejected').length : 0} {t.attendees}
                                </span>
                                <AttendeesList attendees={currentNewsItem.attendees} />
                            </div>
                        )}
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {getLocalizedContent(currentNewsItem?.description, language)}
                        </p>
                    </div>

                    {/* Optional: Add call to action if it's an event */}
                    {currentNewsItem?.type === 'event' && (
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                            {/* Registration Logic similar to ProgramsPage */}
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                {t.join_event || "Join Event"}
                            </h4>

                            {(user && currentNewsItem.attendees && currentNewsItem.attendees.some(a => a.email === user.email)) ? (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg flex flex-col items-center gap-2">
                                    <span className="flex items-center gap-2 font-bold">
                                        <FaArrowRight className={`ml-1 ${language === 'ar' ? 'rotate-180' : ''}`} /> {t.already_registered || "You are registered."}
                                    </span>
                                    <button
                                        onClick={() => handleCancelClick(currentNewsItem.id)}
                                        className="text-red-500 hover:text-red-700 underline text-sm"
                                    >
                                        {t.cancel_registration || "Cancel Registration"}
                                    </button>
                                </div>
                            ) : (
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = user ? { name: user.full_name, email: user.email } : guestForm;
                                        try {
                                            await registerForEvent('event', currentNewsItem.id, formData);
                                            toast.success(t.successfully_joined || "Successfully joined!");
                                            // Close modal removed to let it update
                                            setGuestForm({ name: '', email: '' });
                                        } catch (err) {
                                            toast.error(t.error_occurred || "Error occurred");
                                        }
                                    }}
                                    className="space-y-4"
                                >
                                    {!user && (
                                        <>
                                            <div>
                                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">{t.full_name || "Full Name"}</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:text-white transition-colors"
                                                    value={guestForm.name}
                                                    onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                                                    placeholder={t.enter_name_placeholder || "Enter your name"}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">{t.email_address || "Email Address"}</label>
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:text-white transition-colors"
                                                    value={guestForm.email}
                                                    onChange={e => setGuestForm({ ...guestForm, email: e.target.value })}
                                                    placeholder={t.enter_email_placeholder || "Enter your email"}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition"
                                    >
                                        {user ? (t.confirm_registration || "Confirm Registration") : (t.join_verb || "Join")}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={performCancelRegistration}
                title={t.confirm_cancel_registration || "Cancel Registration"}
                message={t.confirm_cancel_message || "Are you sure you want to cancel?"}
                isDangerous={true}
            />
        </section >
    );
};

export default News;
