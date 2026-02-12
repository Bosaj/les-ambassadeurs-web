import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const ReportProblem = () => {
    const { language, t } = useLanguage();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        email: user ? user.email : '',
    });

    const isRTL = language === 'ar';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error: insertError } = await supabase
                .from('problem_reports')
                .insert([
                    {
                        user_id: user ? user.id : null,
                        email: formData.email,
                        subject: formData.subject,
                        description: formData.description,
                        status: 'open'
                    }
                ]);

            if (insertError) throw insertError;

            setSuccess(true);
            setFormData({
                subject: '',
                description: '',
                email: user ? user.email : '',
            });
        } catch (err) {
            console.error('Error reporting problem:', err);
            setError(t.report_error || "Failed to submit report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-2xl mx-auto">
                <nav className="flex mb-8 text-sm text-gray-500 dark:text-gray-400">
                    <Link to="/" className="hover:text-amber-600 transition-colors">{t.home}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 dark:text-white font-medium">{t.report_problem}</span>
                </nav>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10 overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4">
                            <FaExclamationTriangle className="text-3xl" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {t.report_problem_title || "Report a Problem"}
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            {t.report_problem_desc || "We're sorry you're experiencing an issue. Please let us know so we can fix it."}
                        </p>
                    </div>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center"
                        >
                            <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
                                {t.report_success_title || "Report Submitted"}
                            </h3>
                            <p className="text-green-700 dark:text-green-300 mb-4">
                                {t.report_success_message || "Thank you for your feedback. We will look into this issue shortly."}
                            </p>
                            <button
                                onClick={() => setSuccess(false)}
                                className="text-green-600 dark:text-green-400 font-semibold hover:underline"
                            >
                                {t.report_another || "Report another issue"}
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t.email_label || "Email Address"}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                    placeholder={t.email_placeholder || "your@email.com"}
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t.report_subject || "Subject"}
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                >
                                    <option value="" disabled>{t.select_subject || "Select a subject"}</option>
                                    <option value="bug">{t.report_bug || "Bug / Error"}</option>
                                    <option value="content">{t.report_content || "Content Issue"}</option>
                                    <option value="translation">{t.report_translation || "Translation Error"}</option>
                                    <option value="feature">{t.report_feature || "Feature Request"}</option>
                                    <option value="other">{t.other_subject || "Other"}</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t.report_description || "Description"}
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                                    placeholder={t.report_placeholder || "Please describe the issue in detail..."}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                                {loading ? (t.submitting || "Submitting...") : (t.submit_report || "Submit Report")}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ReportProblem;
