import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    const { language, t } = useLanguage();

    const isRTL = language === 'ar';

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                <nav className="flex mb-8 text-sm text-gray-500 dark:text-gray-400">
                    <Link to="/" className="hover:text-amber-600 transition-colors">{t.home}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 dark:text-white font-medium">{t.privacy_policy}</span>
                </nav>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12 overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            {t.privacy_policy_title || "Privacy Policy"}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {t.last_updated || "Last Updated"}: {new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {t.privacy_intro_title || "1. Introduction"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t.privacy_intro_text || "Welcome to the Ambassadors of Good Association for Development and Social Work ("}
                                <span className="font-semibold text-amber-600">{t.association_name}</span>
                                {t.privacy_intro_text_2 || "). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {t.privacy_collection_title || "2. Data We Collect"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {t.privacy_collection_text || "We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:"}
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 marker:text-amber-500">
                                <li><strong>{t.privacy_identity_data || "Identity Data"}:</strong> {t.privacy_identity_desc || "includes first name, last name, username or similar identifier."}</li>
                                <li><strong>{t.privacy_contact_data || "Contact Data"}:</strong> {t.privacy_contact_desc || "includes email address and telephone numbers."}</li>
                                <li><strong>{t.privacy_technical_data || "Technical Data"}:</strong> {t.privacy_technical_desc || "includes internet protocol (IP) address, your login data, browser type and version."}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {t.privacy_usage_title || "3. How We Use Your Data"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {t.privacy_usage_text || "We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:"}
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 marker:text-amber-500">
                                <li>{t.privacy_usage_1 || "To register you as a new member or volunteer."}</li>
                                <li>{t.privacy_usage_2 || "To manage our relationship with you including notifying you about changes to our terms or privacy policy."}</li>
                                <li>{t.privacy_usage_3 || "To administer and protect our business and this website."}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {t.privacy_contact_us_title || "4. Contact Us"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {t.privacy_contact_us_text || "If you have any questions about this privacy policy or our privacy practices, please contact us at:"}
                            </p>
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                <p className="font-semibold text-gray-900 dark:text-white">Email: <a href="mailto:asosoufaraelkhir48@gmail.com" className="text-amber-600 hover:text-amber-500">asosoufaraelkhir48@gmail.com</a></p>
                                <p className="font-semibold text-gray-900 dark:text-white mt-1">{t.phone_number}: <span className="text-gray-700 dark:text-gray-300" dir="ltr">+212 600 000 000</span></p>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
