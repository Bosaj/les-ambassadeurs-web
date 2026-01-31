import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaCalendarAlt, FaUserPlus, FaCheckCircle, FaTimes, FaHandsHelping, FaThumbtack } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProgramsPage = () => {
    const { programs, projects, registerForEvent, getLocalizedContent } = useData();
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const location = useLocation();

    // Generic selection state
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedType, setSelectedType] = useState('programs'); // 'programs' or 'projects'
    const [guestForm, setGuestForm] = useState({ name: '', email: '' });

    useEffect(() => {
        if (location.state?.selectedProgram) {
            setSelectedItem(location.state.selectedProgram);
            setSelectedType('programs'); // Assuming standard programs for now
        }
    }, [location.state]);

    const handleJoinClick = (item, type) => {
        if (user) {
            if (item.attendees && item.attendees.some(a => a.email === user.email)) {
                toast.error(type === 'projects' ? t.already_supporting : t.already_registered);
                return;
            }
            registerForEvent(type, item.id, { name: user.name, email: user.email });
            toast.success(type === 'projects' ? t.successfully_supported : t.successfully_joined);
        } else {
            setSelectedItem(item);
            setSelectedType(type);
        }
    };

    const handleGuestSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerForEvent(selectedType, selectedItem.id, guestForm);
            toast.success(selectedType === 'projects' ? t.successfully_supported : t.successfully_joined);
            setSelectedItem(null);
            setGuestForm({ name: '', email: '' });
        } catch (error) {
            toast.error(t.error_occurred);
        }
    };

    const renderCard = (item, type) => {
        const isJoined = user && item.attendees && item.attendees.some(a => a.email === user.email);
        const isProject = type === 'projects';

        return (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <img
                    src={item.image_url || "https://via.placeholder.com/400"}
                    alt={getLocalizedContent(item.title, language)}
                    className="h-64 md:h-auto md:w-1/3 object-cover"
                />
                <div className="p-8 flex flex-col justify-center flex-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2 justify-between">
                        <div className="flex items-center">
                            <FaCalendarAlt className="mr-2" /> {item.date ? new Date(item.date).toLocaleDateString() : t.ongoing}
                        </div>
                        {item.is_pinned && <div className="flex items-center text-blue-600 gap-1"><FaThumbtack /> {t.pin_item || "Pinned"}</div>}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                        {getLocalizedContent(item.title, language)}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                        {getLocalizedContent(item.description, language)}
                    </p>
                    <div className="flex items-center gap-6 mt-auto">
                        <span className="text-blue-900 dark:text-blue-300 font-semibold">
                            {item.attendees ? item.attendees.length : 0} {isProject ? t.supporters : t.participants}
                        </span>
                        {isJoined ? (
                            <span className="flex items-center text-green-600 dark:text-green-400 font-bold gap-2 border px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                                <FaCheckCircle /> {isProject ? t.supported : t.joined}
                            </span>
                        ) : (
                            <button
                                onClick={() => handleJoinClick(item, type)}
                                className={`${isProject ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-900 hover:bg-blue-800'} text-white px-6 py-2 rounded-lg transition flex items-center gap-2 font-medium shadow-md`}
                            >
                                {isProject ? <FaHandsHelping /> : <FaUserPlus />}
                                {isProject ? t.support_project : t.join_program}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center text-blue-900 dark:text-white mb-12">
                    {t.programs_projects_title}
                </h1>

                {/* Programs Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 border-l-4 border-blue-900 pl-4">
                        {t.programs_section_title}
                    </h2>
                    <div className="space-y-8">
                        {programs.length > 0 ? programs.map(p => renderCard(p, 'programs')) : (
                            <p className="text-gray-500 italic">{t.no_programs}</p>
                        )}
                    </div>
                </div>

                {/* Projects Section */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 border-l-4 border-green-600 pl-4">
                        {t.projects_section_title}
                    </h2>
                    <div className="space-y-8">
                        {projects.length > 0 ? projects.map(p => renderCard(p, 'projects')) : (
                            <p className="text-gray-500 italic">{t.no_projects}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Guest Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md relative transition-all duration-300 animate-fade-in">
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                        >
                            <FaTimes size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-4 dark:text-white">
                            {selectedType === 'projects' ? t.support_verb : t.join_verb} {getLocalizedContent(selectedItem.title, language)}
                        </h2>
                        <form onSubmit={handleGuestSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-1">{t.full_name}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={guestForm.name}
                                    onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                                    placeholder={t.enter_name_placeholder}
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
                                    placeholder={t.enter_email_placeholder}
                                />
                            </div>
                            <button type="submit" className={`w-full ${selectedType === 'projects' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-900 hover:bg-blue-800'} text-white py-3 rounded-lg font-bold transition shadow-lg`}>
                                {selectedType === 'projects' ? t.confirm_support : t.confirm_registration}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramsPage;
