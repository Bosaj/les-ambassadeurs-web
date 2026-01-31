import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
// removed import { translations } from '../translations';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaHandPaper } from 'react-icons/fa';

const Volunteer = () => {
    const { language, t } = useLanguage();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        skills: '',
        motivation: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            toast.success(t.volunteer_success);
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                city: '',
                skills: '',
                motivation: ''
            });
        }, 1000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300"
        >
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
                    <div className="bg-blue-900 dark:bg-gray-700 p-6 md:p-10 text-center text-white">
                        <FaHandPaper className="text-5xl mx-auto mb-4" />
                        <h1 className="text-4xl font-bold mb-4">{t.volunteer_title}</h1>
                        <p className="text-blue-100 dark:text-gray-300 text-lg">
                            {t.volunteer_subtitle}
                        </p>
                    </div>

                    <div className="p-6 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t.full_name}</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t.email}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t.phone}</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t.city}</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t.skills_expertise}</label>
                                <textarea
                                    name="skills"
                                    rows="3"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                                    placeholder={t.skills_placeholder}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t.why_volunteer}</label>
                                <textarea
                                    name="motivation"
                                    rows="4"
                                    required
                                    value={formData.motivation}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-500 text-white font-bold py-4 rounded-lg hover:bg-red-600 transition shadow-md text-lg"
                            >
                                {t.submit_application}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Volunteer;
