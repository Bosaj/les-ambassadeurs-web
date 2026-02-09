import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaCalendarAlt, FaUserPlus, FaCheckCircle, FaTimes, FaHandsHelping, FaThumbtack, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import AttendeesList from '../components/AttendeesList';

const ProgramsPage = () => {
    const { programs, projects, registerForEvent, getLocalizedContent, cancelRegistration } = useData();
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const location = useLocation();

    // Generic selection state
    const [selectedItemId, setSelectedItemId] = useState(null); // stores { id, type } or null (or just the object if passed from nav, but we should standardize)
    // Actually, to align with the pattern, let's just store the ID and Type if mostly possible, 
    // BUT we need to handle the initial navigation state which passes the full object. 
    // Better strategy: Store the 'ID' and 'Type' in state, and look it up. 
    // If navigation passes an item, we extract ID and Type from it.

    const [modalState, setModalState] = useState({ id: null, type: 'programs' });

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null });

    useEffect(() => {
        if (location.state?.selectedProgram) {
            setModalState({
                id: location.state.selectedProgram.id,
                type: location.state.type || 'programs'
            });
        }
    }, [location.state]);

    // Derive the selected item from the global data to ensure it is always fresh (live attendees count, status)
    const selectedItem = modalState.id
        ? (modalState.type === 'projects'
            ? projects.find(p => p.id === modalState.id)
            : programs.find(p => p.id === modalState.id))
        : null;

    // Use selectedType for consistency in the UI
    const selectedType = modalState.type;


    const handleJoinClick = (item, type) => {
        if (user) {
            // Check if user is already registered AND not rejected
            if (item.attendees && item.attendees.some(a => a.email === user.email && a.status !== 'rejected')) {
                toast.error(type === 'projects' ? t.already_supporting : t.already_registered);
                return;
            }
            // For logged in user, just register immediately
            registerForEvent(type, item.id, { name: user.full_name || user.user_metadata?.full_name || user.email, email: user.email });
            toast.success(type === 'projects' ? t.successfully_supported : t.successfully_joined);
            // If they clicked join from the card, we don't open the modal usually (based on previous code logic), 
            // but if they are in the modal code below, it handles it. 
            // The previous code had `handleJoinClick` doing TWO things: registering if logged in, OR opening modal if not.
            // Let's keep that logic but use `setModalState` instead of `setSelectedItem`.
        } else {
            setModalState({ id: item.id, type });
        }
    };

    const handleCancelClick = (item, type) => {
        setConfirmModal({ isOpen: true, data: { item, type } });
    };

    const performCancelRegistration = async () => {
        const { item, type } = confirmModal.data;
        const toastId = toast.loading(t.cancelling || "Cancelling...");
        try {
            await cancelRegistration(type, item.id, user.email);
            toast.success(t.registration_cancelled || "Cancelled successfully", { id: toastId });
            // Don't close modal, let it update
        } catch (error) {
            console.error(error);
            toast.error(t.error_occurred || "Error occurred", { id: toastId });
        } finally {
            setConfirmModal({ isOpen: false, data: null });
        }
    };



    const renderCard = (item, type) => {
        const isJoined = user && item.attendees && item.attendees.some(a => a.email === user.email && a.status !== 'rejected');
        const isProject = type === 'projects';

        return (
            <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => setModalState({ id: item.id, type })}
            >
                <img
                    src={item.image_url || "https://via.placeholder.com/400"}
                    alt={getLocalizedContent(item.title, language)}
                    className="h-64 md:h-auto md:w-1/3 object-cover"
                />
                <div className="p-8 flex flex-col justify-center flex-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2 justify-between">
                        <div className="flex items-center">
                            <FaCalendarAlt className="mr-2" /> {item.date ? new Date(item.date).toLocaleDateString() : t.ongoing}
                            {item.location && getLocalizedContent(item.location, language) && (
                                <span className="flex items-center ml-4">
                                    <FaMapMarkerAlt className="mr-1" /> {getLocalizedContent(item.location, language)}
                                </span>
                            )}
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
                        <div className="flex items-center gap-2">
                            <span className="text-blue-900 dark:text-blue-300 font-semibold">
                                {item.attendees ? item.attendees.filter(a => a.status !== 'rejected').length : 0} {isProject ? t.supporters : t.participants}
                            </span>
                            <AttendeesList attendees={item.attendees} />
                        </div>
                        {isJoined ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent opening modal
                                    handleCancelClick(item, type);
                                }}
                                className="flex items-center text-green-600 dark:text-green-400 font-bold gap-2 border px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all group z-10"
                                title={t.cancel_registration || "Click to cancel"}
                            >
                                <span className="group-hover:hidden flex items-center gap-2"><FaCheckCircle /> {isProject ? t.supported : t.joined}</span>
                                <span className="hidden group-hover:flex items-center gap-2"><FaTimes /> {t.cancel_registration || "Cancel"}</span>
                            </button>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent opening modal (or maybe let it open?)
                                    // Actually, let's open the modal for consistency if they click the button, 
                                    // OR register immediately if logged in. The logic in handleJoinClick handles this.
                                    handleJoinClick(item, type);
                                }}
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
            <Modal
                isOpen={!!selectedItem}
                onClose={() => setModalState({ id: null, type: 'programs' })}
                title={`${selectedType === 'projects' ? t.support_verb : t.join_verb} ${getLocalizedContent(selectedItem?.title, language)}`}
                heroImage={selectedItem?.image_url}
            >
                {/* Modal Content - mostly same but ensuring it uses selectedItem derived from state */}
                {selectedItem && (
                    <div className="space-y-6">
                        {/* Display Description in Modal too, good for context */}
                        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                            <p>{getLocalizedContent(selectedItem.description, language)}</p>
                        </div>

                        {/* Date and Location */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            {selectedItem?.date && (
                                <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                    <FaCalendarAlt /> {new Date(selectedItem.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : (language === 'ar' ? 'ar-MA' : 'en-US'), { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            )}
                            {selectedItem?.location && getLocalizedContent(selectedItem.location, language) && (
                                <div className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                    <FaMapMarkerAlt /> {getLocalizedContent(selectedItem.location, language)}
                                </div>
                            )}
                        </div>

                        {!user ? (
                            <div className="text-center py-6 border-t dark:border-gray-700 pt-8">
                                <div className="mb-4 text-blue-900 dark:text-blue-300 text-5xl flex justify-center opacity-80">
                                    <FaUserPlus />
                                </div>
                                <h5 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{t.login_prompt_title}</h5>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-sm mx-auto">{t.login_prompt_desc}</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link to="/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                        {t.login_btn}
                                    </Link>
                                    <Link to="/register-volunteer" className="px-8 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold transition-all border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md">
                                        {t.sign_up_btn || "Sign Up"}
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-6 pt-4 border-t dark:border-gray-700">
                                {(selectedItem.attendees && selectedItem.attendees.some(a => a.email === user.email && a.status !== 'rejected')) ? (
                                    <div className="p-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl flex flex-col items-center gap-3">
                                        <FaCheckCircle className="text-5xl" />
                                        <span className="text-lg font-bold">
                                            {selectedType === 'projects' ? (t.already_supporting || "You are supporting this project") : (t.already_registered || "You are registered")}
                                        </span>
                                        <button
                                            onClick={() => handleCancelClick(selectedItem, selectedType)}
                                            className="mt-2 text-red-500 hover:text-red-700 underline text-sm font-medium transition-colors"
                                        >
                                            {t.cancel_registration || "Cancel Registration"}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {selectedType === 'projects'
                                                ? (t.confirm_support_text || "Click below to support this project as")
                                                : (t.confirm_join_text || "Click below to store your registration as")}
                                            <span className="block font-bold text-gray-900 dark:text-white mt-1 text-lg">{user.full_name || user.email}</span>
                                        </p>
                                        <button
                                            onClick={() => handleJoinClick(selectedItem, selectedType)}
                                            className={`w-full ${selectedType === 'projects' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-900 hover:bg-blue-800'} text-white py-4 rounded-xl font-bold transition shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-lg`}
                                        >
                                            {selectedType === 'projects' ? <FaHandsHelping className="text-2xl" /> : <FaUserPlus className="text-2xl" />}
                                            {selectedType === 'projects' ? t.confirm_support : t.confirm_registration}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
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
        </div>
    );
};

export default ProgramsPage;
