import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaCalendarAlt, FaUserPlus, FaCheckCircle, FaTimes, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NewsPage = () => {
    const { news, events, registerForEvent, getLocalizedContent } = useData();
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [guestForm, setGuestForm] = useState({ name: '', email: '' });

    const handleRegisterClick = (event) => {
        if (user) {
            // Auto register logged in user
            if (event.attendees && event.attendees.some(a => a.email === user.email)) {
                toast.error(t.you_are_registered);
                return;
            }
            registerForEvent('events', event.id, { name: user.name, email: user.email });
            toast.success(t.successfully_registered);
        } else {
            // Open modal for guest
            setSelectedEvent(event);
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
                                    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300">
                                        <img
                                            src={item.image_url || item.image || "https://via.placeholder.com/400x300"}
                                            alt={getLocalizedContent(item.title, language)}
                                            className="h-48 w-full object-cover"
                                        />
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                <FaCalendarAlt className="mr-2" /> {item.date ? new Date(item.date).toLocaleDateString() : 'TBA'}
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
                                const isRegistered = user && item.attendees && item.attendees.some(a => a.email === user.email);
                                return (
                                    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300">
                                        <img
                                            src={item.image_url || item.image || "https://via.placeholder.com/400x300"}
                                            alt={getLocalizedContent(item.title, language)}
                                            className="h-48 w-full object-cover"
                                        />
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                <FaCalendarAlt className="mr-2" /> {item.date ? new Date(item.date).toLocaleDateString() : 'TBA'}
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                                {getLocalizedContent(item.title, language)}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1 line-clamp-3">
                                                {getLocalizedContent(item.description, language)}
                                            </p>
                                            <div className="flex justify-between items-center mt-auto pt-4 border-t dark:border-gray-700">
                                                <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                                    {item.attendees ? item.attendees.length : 0} {t.attendees}
                                                </span>
                                                {isRegistered ? (
                                                    <span className="flex items-center text-green-600 dark:text-green-400 font-bold gap-2">
                                                        <FaCheckCircle /> {t.joined}
                                                    </span>
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

            {/* Guest Registration Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md relative transition-all duration-300">
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            <FaTimes size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-4 dark:text-white">
                            {selectedEvent.category === 'event' || selectedEvent.attendees ?
                                `${t.register_for} ${getLocalizedContent(selectedEvent.title, language)}` :
                                getLocalizedContent(selectedEvent.title, language)
                            }
                        </h2>

                        {(selectedEvent.category === 'event' || (selectedEvent.attendees && !selectedEvent.description.en)) ? (
                            <form onSubmit={handleGuestSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 mb-1">{t.full_name}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={guestForm.name}
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
                                        onChange={e => setGuestForm({ ...guestForm, email: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition">
                                    {t.confirm_registration}
                                </button>
                            </form>
                        ) : (
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-600 dark:text-gray-300">
                                    {getLocalizedContent(selectedEvent.description, language)}
                                </p>
                                {/* Add more details here if available */}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsPage;
