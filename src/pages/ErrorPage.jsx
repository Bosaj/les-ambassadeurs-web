import React from 'react';
import { translations } from '../translations';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaEnvelope, FaCode } from 'react-icons/fa';

const ErrorPage = ({ error, resetErrorBoundary, is404 = false }) => {
    // Safe language detection without hooks (to prevent crashes outside Provider)
    const getLanguage = () => {
        try {
            return localStorage.getItem('language') || 'en';
        } catch {
            return 'en';
        }
    };

    const language = getLanguage();
    const t = translations[language] || translations['en'];

    // Default translations if keys missing (or if fallback used above with limited keys)
    const title = is404 ? t.page_not_found : t.error_title;
    const desc = is404 ? t.page_not_found_desc : t.error_desc;

    const isRtl = language === 'ar';

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-2xl w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12 text-center animate-fade-in relative overflow-hidden">
                {/* Background decorative blob */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Logo */}
                <div className="mb-6 flex justify-center relative z-10">
                    <div className="p-1 bg-white dark:bg-gray-700 rounded-full shadow-lg">
                        <img
                            src="/images/new_ABV.jpg"
                            alt="Logo"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    </div>
                </div>

                {/* Icon & Title */}
                <div className="mb-6 relative z-10">
                    {!is404 && <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4 opacity-80" />}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        {title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        {desc}
                    </p>
                    {error && !is404 && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left text-sm font-mono text-red-600 dark:text-red-300 overflow-auto max-h-32 mx-auto max-w-lg border border-red-100 dark:border-red-900/30">
                            {error.toString()}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 relative z-10">
                    <a
                        href="/"
                        className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-medium transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        {t.home}
                    </a>
                    {!is404 && resetErrorBoundary && (
                        <button
                            onClick={resetErrorBoundary}
                            className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl font-medium transition shadow hover:shadow-md"
                        >
                            {t.try_again}
                        </button>
                    )}
                </div>

                {/* Contact Info */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 relative z-10">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                        {t.contact_support}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition">
                            <div className="bg-blue-200 dark:bg-blue-800 p-2 rounded-full text-blue-800 dark:text-blue-200">
                                <FaEnvelope />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-700 dark:text-gray-200">{t.support_label}</p>
                                <a href="mailto:asosoufaraelkhir48@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                                    asosoufaraelkhir48@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 transition">
                            <div className="bg-green-200 dark:bg-green-800 p-2 rounded-full text-green-800 dark:text-green-200">
                                <FaCode />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-700 dark:text-gray-200">{t.developer_label}</p>
                                <a href="https://www.linkedin.com/in/oussama-elhadji" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                    Oussama ELHADJI
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;