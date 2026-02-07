import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaCalendarAlt, FaUserPlus, FaCheckCircle, FaTimes, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';

const NewsPage = () => {
    const { news, events, registerForEvent, cancelRegistration, getLocalizedContent } = useData();
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [guestForm, setGuestForm] = useState({ name: '', email: '' });
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
            // Open modal for guest
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

    const handleGuestSubmit = (e) => {
        e.preventDefault();
        registerForEvent('events', selectedEvent.id, guestForm);
        toast.success(t.successfully_registered);
        setSelectedEvent(null);
        setGuestForm({ name: '', email: '' });
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
                                                <FaCalendarAlt className="mr-2" /> {item.date ? new Date(item.date).toLocaleDateString() : 'TBA'}
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
                                                <FaCalendarAlt className="mr-2" /> {item.date ? new Date(item.date).toLocaleDateString() : 'TBA'}
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
                                                <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                                    {item.attendees ? item.attendees.filter(a => a.status !== 'rejected').length : 0} {t.attendees}
                                                </span>
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
                {(selectedEvent?.category === 'event' || (selectedEvent?.attendees && !selectedEvent?.description?.en)) ? (
                    <form onSubmit={handleGuestSubmit} className="space-y-4 pt-2">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">{t.full_name}</label>
                            <input
                                type="text"
                                required
                                className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:text-white transition-colors"
                                value={guestForm.name}
                                onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">{t.email_address}</label>
                            <input
                                type="email"
                                required
                                className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:text-white transition-colors"
                                value={guestForm.email}
                                onChange={e => setGuestForm({ ...guestForm, email: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition shadow-lg mt-4">
                            {t.confirm_registration}
                        </button>
                    </form>
                ) : (
                    <div className="relative">
                        <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                            <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                                <FaCalendarAlt />
                                <span>{selectedEvent?.date ? new Date(selectedEvent.date).toLocaleDateString() : 'TBA'}</span>
                            </span>
                        </div>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                                {getLocalizedContent(selectedEvent?.description, language)}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default NewsPage;
