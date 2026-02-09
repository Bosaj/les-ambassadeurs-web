import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { translations } from '../translations';
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight, FaThumbtack, FaUserPlus } from 'react-icons/fa';
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
        <section id="news" className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
                            className="bg-transparent rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition group cursor-pointer flex flex-col"
                            // Removed overflow-hidden to allow tooltips to show
                            onClick={() => setSelectedNewsId({ id: item.id, type: item.type })}
                        >
                            <div className="relative">
                                <img
                                    src={item.image_url || "https://via.placeholder.com/300"}
                                    alt={getLocalizedContent(item.title, language)}
                                    className="w-full h-48 object-cover transition group-hover:scale-105 rounded-t-lg"
                                />
                                <span className={`absolute top-3 ${language === 'ar' ? 'right-3' : 'left-3'} text-xs font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider ${item.type === 'news' ? 'bg-red-500 text-white' :
                                    item.category === 'program' ? 'bg-purple-500 text-white' :
                                        item.category === 'project' ? 'bg-amber-500 text-white' :
                                            'bg-blue-500 text-white'
                                    }`}>
                                    {item.displayCategory}
                                </span>
                            </div>
                            <div className="p-6 flex-1 flex flex-col text-start">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <span className="flex items-center gap-1">
                                        <FaCalendarAlt /> <span>{new Date(item.date).toLocaleDateString()}</span>
                                    </span>
                                    {item.location && (
                                        <span className={`flex items-center gap-1 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>
                                            <FaMapMarkerAlt /> <span>{getLocalizedContent(item.location, language)}</span>
                                        </span>
                                    )}
                                    {item.is_pinned && <span className={`flex items-center gap-1 text-blue-600 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}><FaThumbtack /> {t.pin_item || "Pinned"}</span>}
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-white mb-3 line-clamp-2">
                                    {getLocalizedContent(item.title, language)}
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
                                    {getLocalizedContent(item.description, language)}
                                </p>
                                <div className="flex items-center justify-between mt-4">
                                    {item.type === 'event' ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full whitespace-nowrap">
                                                {item.attendees ? item.attendees.filter(a => a.status !== 'rejected').length : 0} {t.attendees || "Attendees"}
                                            </span>
                                            <div className={`flex items-center ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>
                                                <AttendeesList attendees={item.attendees} size="w-8 h-8" showName={true} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div></div> // Spacer
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedNewsId({ id: item.id, type: item.type });
                                        }}
                                        className={`inline-flex items-center text-red-500 hover:text-red-600 font-medium hover:underline ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}
                                    >
                                        <span>{t.read_more}</span>
                                        <FaArrowRight className={`${language === 'ar' ? 'mr-1 rotate-180' : 'ml-1'}`} />
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
                        <FaArrowRight className={`${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
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
                <div className="relative" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                        <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                            <FaCalendarAlt />
                            <span>{currentNewsItem?.date ? new Date(currentNewsItem.date).toLocaleDateString() : ''}</span>
                        </span>
                        {currentNewsItem?.location && getLocalizedContent(currentNewsItem.location, language) && (
                            <span className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full border border-red-100 dark:border-red-800">
                                <FaMapMarkerAlt />
                                <span className={language === 'ar' ? 'mr-1' : 'ml-1'}>{getLocalizedContent(currentNewsItem.location, language)}</span>
                            </span>
                        )}
                        {currentNewsItem?.type === 'event' && (
                            <div className={`flex items-center gap-2 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
                                <span className="text-blue-900 dark:text-blue-300 font-semibold text-xs">
                                    {currentNewsItem.attendees ? currentNewsItem.attendees.filter(a => a.status !== 'rejected').length : 0} {t.attendees}
                                </span>
                                <AttendeesList attendees={currentNewsItem.attendees} />
                            </div>
                        )}
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-start">
                            {getLocalizedContent(currentNewsItem?.description, language)}
                        </p>
                    </div>

                    {/* Optional: Add call to action if it's an event */}
                    {currentNewsItem?.type === 'event' && (
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                            {/* Registration Logic similar to ProgramsPage */}
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-start">
                                {t.join_event || "Join Event"}
                            </h4>

                            {(user && currentNewsItem.attendees && currentNewsItem.attendees.some(a => a.email === user.email)) ? (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg flex flex-col items-center gap-2">
                                    <span className="flex items-center gap-2 font-bold">
                                        <FaArrowRight className={`${language === 'ar' ? 'ml-1 rotate-180' : 'mr-1'}`} /> {t.already_registered || "You are registered."}
                                    </span>
                                    <button
                                        onClick={() => handleCancelClick(currentNewsItem.id)}
                                        className="text-red-500 hover:text-red-700 underline text-sm"
                                    >
                                        {t.cancel_registration || "Cancel Registration"}
                                    </button>
                                </div>
                            ) : (
                                !user ? (
                                    <div className="text-center py-6">
                                        <div className="mb-4 text-blue-900 dark:text-blue-300 text-4xl flex justify-center opacity-80">
                                            <FaUserPlus />
                                        </div>
                                        <h5 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">{t.login_prompt_title}</h5>
                                        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">{t.login_prompt_desc}</p>
                                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                            <Link to="/login" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg">
                                                {t.login_btn}
                                            </Link>
                                            <Link to="/register-volunteer" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-bold transition-all border border-gray-200 dark:border-gray-600">
                                                {t.sign_up_btn || "Sign Up"}
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const formData = { name: user.full_name, email: user.email };
                                                await registerForEvent('event', currentNewsItem.id, formData);
                                                toast.success(t.successfully_joined || "Successfully joined!");
                                            } catch (err) {
                                                toast.error(t.error_occurred || "Error occurred");
                                            }
                                        }}
                                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition"
                                    >
                                        {t.join_verb || "Join"}
                                    </button>
                                )
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
