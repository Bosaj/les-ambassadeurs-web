import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaCalendarAlt, FaUserPlus, FaCheckCircle, FaTimes, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import AttendeesList from '../components/AttendeesList';
import { formatDateRange, calculateDuration } from '../utils/dateUtils';

const NewsPage = () => {
    const { news, events, registerForEvent, cancelRegistration, getLocalizedContent } = useData();
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, event: null });

    const handleRegisterClick = (event) => {
        if (user) {
            // Auto register logged in user
            if (event.attendees && event.attendees.some(a => a.email === user.email && a.status !== 'rejected')) {
                toast.error(t.you_are_registered);
                return;
            }
            registerForEvent('events', event.id, {
                name: user.full_name || user.user_metadata?.full_name || user.email,
                email: user.email
            });
            toast.success(t.successfully_registered);
        } else {
            // Open modal for details/login prompt
            setSelectedEvent(event);
        }
    };

    const handleCancelClick = (event) => {
        setConfirmModal({ isOpen: true, event });
    };

    const performCancelRegistration = async () => {
        const { event } = confirmModal;
        const toastId = toast.loading(t.cancelling || "Cancelling...");
        try {
            await cancelRegistration('events', event.id, user.email);
            toast.success(t.registration_cancelled || "Cancelled successfully", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error(t.error_occurred || "Error occurred", { id: toastId });
        } finally {
            setConfirmModal({ isOpen: false, event: null });
        }
    };

    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center text-blue-900 dark:text-white mb-12">
                    {t.news_title}
                </h1>

                {/* News Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-8 border-l-4 border-yellow-500 pl-4">
                        {t.news_section_title}
                    </h2>
                    {news.length === 0 ? (
                        <div className="text-center py-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                {t.no_news}
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {news.map((item) => {
                                return (
                                    <div key={item.id} className="bg-transparent rounded-xl flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <img
                                            src={item.image_url || item.image || "https://via.placeholder.com/400x300"}
                                            alt={getLocalizedContent(item.title, language)}
                                            className="h-48 w-full object-cover"
                                        />
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                <FaCalendarAlt className="mr-2" /> {formatDateRange(item.date, item.end_date, language)}
                                                {item.location && getLocalizedContent(item.location, language) && (
                                                    <span className="flex items-center ml-3">
                                                        <FaMapMarkerAlt className="mr-1" /> {getLocalizedContent(item.location, language)}
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                                {getLocalizedContent(item.title, language)}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1 line-clamp-3">
                                                {getLocalizedContent(item.description, language)}
                                            </p>
                                            <div className="flex justify-end items-center mt-auto pt-4 border-t dark:border-gray-700">
                                                <button
                                                    onClick={() => setSelectedEvent(item)} // Re-using modal for reading details essentially
                                                    className="text-blue-900 dark:text-blue-300 font-semibold hover:underline flex items-center gap-2"
                                                >
                                                    {t.read_more} <FaArrowRight />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Events Section */}
                <div>
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-8 border-l-4 border-blue-600 pl-4">
                        {t.events_section_title}
                    </h2>
                    {events.length === 0 ? (
                        <div className="text-center py-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                {t.no_events}
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((item) => {
                                const isRegistered = user && item.attendees && item.attendees.some(a => a.email === user.email && a.status !== 'rejected');
                                return (
                                    <div key={item.id} className="bg-transparent rounded-xl flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <img
                                            src={item.image_url || item.image || "https://via.placeholder.com/400x300"}
                                            alt={getLocalizedContent(item.title, language)}
                                            className="h-48 w-full object-cover"
                                        />
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                <FaCalendarAlt className="mr-2" />
                                                <span>{formatDateRange(item.date, item.end_date, language)}</span>
                                                {item.end_date && calculateDuration(item.date, item.end_date, t) && (
                                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                                                        {calculateDuration(item.date, item.end_date, t)}
                                                    </span>
                                                )}
                                                {item.location && getLocalizedContent(item.location, language) && (
                                                    <span className="flex items-center ml-3">
                                                        <FaMapMarkerAlt className="mr-1" /> {getLocalizedContent(item.location, language)}
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                                {getLocalizedContent(item.title, language)}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1 line-clamp-3">
                                                {getLocalizedContent(item.description, language)}
                                            </p>
                                            <div className="flex justify-between items-center mt-auto pt-4 border-t dark:border-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                                        {item.attendees ? item.attendees.filter(a => a.status !== 'rejected').length : 0} {t.attendees}
                                                    </span>
                                                    <AttendeesList attendees={item.attendees} size="w-8 h-8" showName={true} />
                                                </div>
                                                {isRegistered ? (
                                                    <button
                                                        onClick={() => handleCancelClick(item)}
                                                        className="flex items-center text-green-600 dark:text-green-400 font-bold gap-2 hover:bg-red-50 hover:text-red-500 transition-colors group px-3 py-1 rounded"
                                                    >
                                                        <span className="group-hover:hidden flex items-center gap-2"><FaCheckCircle /> {t.joined}</span>
                                                        <span className="hidden group-hover:flex items-center gap-2"><FaTimes /> {t.cancel_registration || "Cancel"}</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRegisterClick(item)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2 text-sm"
                                                    >
                                                        <FaUserPlus /> {t.join_attend}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={performCancelRegistration}
                title={t.confirm_cancel_registration || "Cancel Registration"}
                message={t.confirm_cancel_message || "Are you sure you want to cancel?"}
                isDangerous={true}
            />

            {/* Guest Registration Modal */}
            <Modal
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                title={selectedEvent?.category === 'event' || selectedEvent?.attendees ?
                    `${t.register_for} ${getLocalizedContent(selectedEvent?.title, language)}` :
                    getLocalizedContent(selectedEvent?.title, language)
                }
                heroImage={selectedEvent?.image_url || selectedEvent?.image}
            >
                <div className="relative">
                    <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                        <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                            <FaCalendarAlt />
                            <span>{formatDateRange(selectedEvent?.date, selectedEvent?.end_date, language)}</span>
                            {selectedEvent?.end_date && calculateDuration(selectedEvent.date, selectedEvent.end_date, t) && (
                                <span className="ml-2 text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full border border-blue-300">
                                    {calculateDuration(selectedEvent.date, selectedEvent.end_date, t)}
                                </span>
                            )}
                        </span>
                        {selectedEvent?.location && getLocalizedContent(selectedEvent.location, language) && (
                            <span className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full border border-red-100 dark:border-red-800">
                                <FaMapMarkerAlt />
                                <span>{getLocalizedContent(selectedEvent.location, language)}</span>
                            </span>
                        )}
                        {(selectedEvent?.attendees) && (
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-blue-900 dark:text-blue-300 font-semibold text-xs">
                                    {selectedEvent.attendees.filter(a => a.status !== 'rejected').length} {t.attendees}
                                </span>
                                <AttendeesList attendees={selectedEvent.attendees} />
                            </div>
                        )}
                    </div>
                    <div className="prose dark:prose-invert max-w-none mb-8">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                            {getLocalizedContent(selectedEvent?.description, language)}
                        </p>
                    </div>

                    {/* Join Section for Events */}
                    {(selectedEvent?.category === 'event' || (selectedEvent?.attendees && !selectedEvent?.description?.en)) && (
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-start">{t.join_event || "Join Event"}</h4>
                            {user ? (
                                selectedEvent.attendees?.some(a => a.email === user.email && a.status !== 'rejected') ? (
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg flex flex-col items-center gap-2">
                                        <span className="flex items-center gap-2 font-bold">
                                            <FaCheckCircle /> {t.already_registered || "You are registered."}
                                        </span>
                                        <button
                                            onClick={() => handleCancelClick(selectedEvent)}
                                            className="text-red-500 hover:text-red-700 underline text-sm"
                                        >
                                            {t.cancel_registration || "Cancel Registration"}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            registerForEvent('events', selectedEvent.id, {
                                                name: user.full_name || user.user_metadata?.full_name || user.email,
                                                email: user.email
                                            });
                                            toast.success(t.successfully_registered);
                                        }}
                                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition"
                                    >
                                        {t.join_verb || "Join"}
                                    </button>
                                )
                            ) : (
                                <div className="text-center py-6">
                                    <div className="mb-4 text-blue-900 dark:text-blue-300 text-4xl flex justify-center opacity-80">
                                        <FaUserPlus />
                                    </div>
                                    <h5 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">{t.login_prompt_title || "Please Login"}</h5>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">{t.login_prompt_desc || "You need to be logged in to register for events."}</p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <Link to="/login" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg">
                                            {t.login_btn || "Login"}
                                        </Link>
                                        <Link to="/register-volunteer" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-bold transition-all border border-gray-200 dark:border-gray-600">
                                            {t.sign_up_btn || "Sign Up"}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default NewsPage;
