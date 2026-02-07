import React from 'react';
import { FaExclamationTriangle, FaTimes, FaCheck } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isDangerous = false }) => {
    const { language } = useLanguage();
    const t = translations[language];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-scaleIn border border-gray-100 dark:border-gray-700">
                <div className="p-6 text-center">
                    <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 ${isDangerous ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>
                        <FaExclamationTriangle className="text-3xl" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        {message}
                    </p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                        >
                            {t.cancel || "Cancel"}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-lg transition-transform transform active:scale-95 flex items-center gap-2 ${isDangerous
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}`}
                        >
                            {isDangerous ? <FaTimes /> : <FaCheck />}
                            {t.confirm || "Confirm"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
