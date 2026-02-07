import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaCalendarAlt, FaUserPlus, FaCheckCircle, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

const EventsPage = () => {
    const { events, registerForEvent, cancelRegistration, getLocalizedContent } = useData();
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [guestForm, setGuestForm] = useState({ name: '', email: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, event: null });

    const handleJoinClick = (event) => {
        if (user) {
            if (event.attendees.some(a => a.email === user.email && a.status !== 'rejected')) {
                toast.error(t.you_are_registered);
                return;
            }
            registerForEvent('events', event.id, { name: user.full_name || user.user_metadata?.full_name || user.email, email: user.email });
            toast.success(t.successfully_joined);
        } else {
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
        toast.success("Successfully registered!");
        setSelectedEvent(null);
        setGuestForm({ name: '', email: '' });
    };

    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center text-blue-900 dark:text-white mb-12">{t.events_page_title}</h1>

                <div className="space-y-8">
                    {events.length > 0 ? events.map((event) => {
                        const isJoined = user && event.attendees.some(a => a.email === user.email && a.status !== 'rejected');
                        return (
                            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300">
                                <img src={event.image_url || event.image} alt={getLocalizedContent(event.title, language)} className="h-64 md:h-auto md:w-1/3 object-cover" />
                                <div className="p-8 flex flex-col justify-center flex-1">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        <FaCalendarAlt className="mr-2" /> {new Date(event.date).toLocaleDateString()}
                                        {event.location && getLocalizedContent(event.location, language) && (
                                            <span className="flex items-center ml-4">
                                                <FaMapMarkerAlt className="mr-1" /> {getLocalizedContent(event.location, language)}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{getLocalizedContent(event.title, language)}</h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">{getLocalizedContent(event.description, language)}</p>
                                    <div className="flex items-center gap-6">
                                        <span className="text-blue-900 dark:text-blue-300 font-semibold">{event.attendees ? event.attendees.filter(a => a.status !== 'rejected').length : 0} {t.attendees}</span>
                                        {isJoined ? (
                                            <button
                                                onClick={() => handleCancelClick(event)}
                                                className="flex items-center text-green-600 dark:text-green-400 font-bold gap-2 border px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all group"
                                            >
                                                <span className="group-hover:hidden flex items-center gap-2"><FaCheckCircle /> {t.joined}</span>
                                                <span className="hidden group-hover:flex items-center gap-2"><FaTimes /> {t.cancel_registration || "Cancel"}</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleJoinClick(event)}
                                                className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition flex items-center gap-2"
                                            >
                                                <FaUserPlus /> {t.join_event}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center text-gray-500 py-10 italic">{t.no_events}</div>
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

            {/* Guest Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md relative transition-all duration-300">
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            <FaTimes size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-4 dark:text-white">{t.join_event}: {getLocalizedContent(selectedEvent.title, language)}</h2>
                        <form onSubmit={handleGuestSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-1">{t.full_name}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={guestForm.name}
                                    placeholder={t.enter_name_placeholder}
                                    onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-1">{t.email_address}</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={guestForm.email}
                                    placeholder={t.enter_email_placeholder}
                                    onChange={e => setGuestForm({ ...guestForm, email: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition">
                                {t.confirm_join}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventsPage;
