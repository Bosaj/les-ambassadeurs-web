import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { translations } from '../translations';
import { FaGraduationCap, FaHandsHelping, FaHeart, FaLeaf, FaArrowRight, FaMapMarkerAlt, FaCheckCircle, FaUserPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AttendeesList from './AttendeesList';

const Programs = () => {
    const { language } = useLanguage();
    const { programs, projects, getLocalizedContent, registerForEvent, cancelRegistration } = useData(); // Fetch dynamic programs & projects
    const t = translations[language];
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedProgramId, setSelectedProgramId] = useState(null); // Store object with { id, type } or null

    // Derive selected item from global state to ensure updates (like attendees) are reflected immediately
    const selectedProgram = selectedProgramId
        ? (selectedProgramId.type === 'projects'
            ? projects.find(p => p.id === selectedProgramId.id)
            : programs.find(p => p.id === selectedProgramId.id))
        : null;

    // Merge type if found (consistency with displayItems)
    const activeItem = selectedProgram ? { ...selectedProgram, type: selectedProgramId.type } : null;

    const [guestForm, setGuestForm] = useState({ name: '', email: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null });

    const handleCancelClick = (eventId, type) => {
        setConfirmModal({ isOpen: true, data: { eventId, type } });
    };

    const performCancelRegistration = async () => {
        const { eventId, type } = confirmModal.data;
        const toastId = toast.loading(t.cancelling || "Cancelling...");
        try {
            await cancelRegistration(type, eventId, user?.email);
            toast.success(t.registration_cancelled || "Cancelled successfully", { id: toastId });
            // Don't close modal, let it update via global state
        } catch (error) {
            console.error(error);
            toast.error(t.error_occurred || "Error occurred", { id: toastId });
        } finally {
            setConfirmModal({ isOpen: false, data: null });
        }
    };


    // Dynamic programs & projects from DB (3 of each as requested)
    const latestPrograms = programs.slice(0, 3).map(p => ({ ...p, type: 'programs' }));
    const latestProjects = projects.slice(0, 3).map(p => ({ ...p, type: 'projects' }));
    const displayItems = [...latestPrograms, ...latestProjects];

    return (
        <section id="programs" className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-4">
                        {t.programs_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.programs_desc}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
                </div>

                <div className="flex flex-wrap justify-center gap-8">
                    {displayItems.length > 0 ? displayItems.map((item, index) => (
                        <div
                            key={item.id || index}
                            className="bg-transparent rounded-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group flex flex-col items-center w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)] max-w-sm overflow-hidden border border-gray-200 dark:border-gray-700"
                            onClick={() => {
                                navigate('/programs', { state: { selectedProgram: item, type: item.type } });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            <div className="w-full h-48 bg-gray-200 dark:bg-gray-600 relative overflow-hidden">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={getLocalizedContent(item.title, language)}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-blue-900/20 dark:text-white/20">
                                        <FaHandsHelping className="text-6xl" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                    <span className="text-white font-semibold">{t.learn_more}</span>
                                </div>
                                {/* Type Badge */}
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 text-xs font-bold px-2 py-1 rounded shadow text-blue-900 dark:text-white">
                                    {item.type === 'programs' ? (t.programs_section_title || "Program") : (t.projects_section_title || "Project")}
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1 w-full text-center">
                                <div className="mb-4 text-blue-900 dark:text-blue-300">
                                    {/* Optional: Icon overlay or category badge could go here */}
                                    {item.location && getLocalizedContent(item.location, language) && (
                                        <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                                            <FaMapMarkerAlt /> {getLocalizedContent(item.location, language)}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-blue-900 dark:text-white line-clamp-1 border-b-2 border-transparent group-hover:border-red-500 transition-colors inline-block mx-auto pb-1">
                                    {getLocalizedContent(item.title, language)}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-6 flex-1 text-sm leading-relaxed">
                                    {getLocalizedContent(item.description, language)}
                                </p>
                                <div className="flex items-center justify-between w-full mt-auto">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 font-medium">
                                            {item.attendees?.filter(a => a.status !== 'rejected').length || 0} {item.type === 'projects' ? t.supporters : t.participants}
                                        </span>
                                        <AttendeesList attendees={item.attendees} />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedProgramId({ id: item.id, type: item.type });
                                        }}
                                        className="inline-flex items-center text-red-500 hover:text-red-600 font-bold uppercase tracking-wide text-sm group-hover:gap-2 transition-all"
                                    >
                                        <span>{t.learn_more}</span>
                                        <FaArrowRight className={`ml-1 ${language === 'ar' ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="col-span-full text-center text-gray-500 text-lg">{t.loading_programs}</p>
                    )}
                </div>

                <div className="text-center mt-12">
                    <Link
                        to="/programs"
                        className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <span>{t.discover_all}</span>
                        <FaArrowRight className={`ml-2 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </Link>
                </div>
            </div>

            <Modal
                isOpen={!!activeItem}
                onClose={() => setSelectedProgramId(null)}
                title={getLocalizedContent(activeItem?.title, language)}
                heroImage={activeItem?.image_url}
            >
                <div className="relative">
                    {/* Hero image is handled by Modal component now */
                        !activeItem?.image_url && (
                            <div className="flex justify-center items-center h-48 bg-blue-50 dark:bg-gray-800 rounded-lg mb-6">
                                <FaHandsHelping className="text-blue-900/40 text-6xl" />
                            </div>
                        )}

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-8">
                            {activeItem?.location && getLocalizedContent(activeItem.location, language) && (
                                <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded w-fit">
                                    <FaMapMarkerAlt /> {getLocalizedContent(activeItem.location, language)}
                                </div>
                            )}
                            {/* Attendees List in Modal */}
                            <div className="flex items-center gap-2 mb-4 bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg w-fit border border-blue-100 dark:border-blue-800">
                                <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                    {activeItem?.attendees?.filter(a => a.status !== 'rejected').length || 0} {activeItem?.type === 'projects' ? t.supporters : t.participants}
                                </span>
                                <AttendeesList attendees={activeItem?.attendees} />
                            </div>

                            {getLocalizedContent(activeItem?.description, language)}
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                        {/* Join/Support Action */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-600">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                                {activeItem?.type === 'projects' ? (t.support_project || "Support Project") : (t.join_program || "Join Program")}
                            </h4>

                            {(user && activeItem?.attendees && activeItem.attendees.some(a => a.email === user.email && a.status !== 'rejected')) ? (
                                <div className="p-4 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-lg flex flex-col items-center gap-3 font-semibold">
                                    <div className="flex items-center gap-2">
                                        <FaCheckCircle className="text-xl" />
                                        {activeItem?.type === 'projects' ? (t.already_supporting || "You are supporting this project.") : (t.already_registered || "You are registered.")}
                                    </div>
                                    <button
                                        onClick={() => handleCancelClick(activeItem.id, activeItem.type || 'program')}
                                        className="text-red-500 hover:text-red-700 underline text-sm font-medium transition-colors"
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
                                            await registerForEvent(activeItem.type || 'program', activeItem.id, formData);
                                            toast.success(activeItem.type === 'projects' ? (t.successfully_supported || "Successfully supported!") : (t.successfully_joined || "Successfully joined!"));
                                            // Keep modal open, data will update via global state
                                            setGuestForm({ name: '', email: '' });
                                        } catch (err) {
                                            toast.error(t.error_occurred || "Error occurred");
                                        }
                                    }}
                                    className="space-y-4"
                                >
                                    {!user && (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t.full_name || "Full Name"}</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:text-white"
                                                    value={guestForm.name}
                                                    onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                                                    placeholder={t.enter_name_placeholder || "Your Name"}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t.email_address || "Email Address"}</label>
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:text-white"
                                                    value={guestForm.email}
                                                    onChange={e => setGuestForm({ ...guestForm, email: e.target.value })}
                                                    placeholder={t.enter_email_placeholder || "Your Email"}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${activeItem?.type === 'projects' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {activeItem?.type === 'projects' ? <FaHandsHelping /> : <FaUserPlus />}
                                        {user
                                            ? (activeItem?.type === 'projects' ? (t.confirm_support || "Confirm Support") : (t.confirm_registration || "Confirm Registration"))
                                            : (activeItem?.type === 'projects' ? (t.support_verb || "Support") : (t.join_verb || "Join"))}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex justify-center gap-4 text-sm text-gray-500">
                            <Link to="/volunteer" className="hover:text-blue-600 hover:underline">{t.volunteer}</Link>
                            <span>•</span>
                            <Link to="/donate" className="hover:text-red-600 hover:underline">{t.donate}</Link>
                        </div>
                    </div>
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

export default Programs;
