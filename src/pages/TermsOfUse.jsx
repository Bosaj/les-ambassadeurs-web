import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const TermsOfUse = () => {
    const { language, t } = useLanguage();
    const isRTL = language === 'ar';

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                <nav className="flex mb-8 text-sm text-gray-500 dark:text-gray-400">
                    <Link to="/" className="hover:text-amber-600 transition-colors">{t.home}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 dark:text-white font-medium">{t.terms_of_use}</span>
                </nav>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12 overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            {t.terms_title || "Terms of Use"}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {t.last_updated || "Last Updated"}: {new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {t.terms_intro_title || "1. Acceptance of Terms"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t.terms_intro_text || "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {t.terms_usage_title || "2. Use License"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {t.terms_usage_text || "Permission is granted to temporarily download one copy of the materials (information or software) on Ambassadors of Good Association's website for personal, non-commercial transitory viewing only."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {t.terms_disclaimer_title || "3. Disclaimer"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {t.terms_disclaimer_text || "The materials on Ambassadors of Good Association's website are provided on an 'as is' basis. Ambassadors of Good Association makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {t.terms_governing_title || "4. Governing Law"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {t.terms_governing_text || "These terms and conditions are governed by and construed in accordance with the laws of Morocco and you irrevocably submit to the exclusive jurisdiction of the courts in that location."}
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsOfUse;
