import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaHandPaper } from 'react-icons/fa';

const Volunteer = () => {
    const { language } = useLanguage();
    const t = translations[language];
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
            toast.success(t.volunteer_success || "Thank you for volunteering! We will contact you soon.");
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
            className="py-12 md:py-20 bg-gray-50 min-h-screen"
        >
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-blue-900 p-6 md:p-10 text-center text-white">
                        <FaHandPaper className="text-5xl mx-auto mb-4" />
                        <h1 className="text-4xl font-bold mb-4">{t.volunteer_title || "Join Our Family"}</h1>
                        <p className="text-blue-100 text-lg">
                            {t.volunteer_subtitle || "Become a volunteer and help us create positive change in our community."}
                        </p>
                    </div>

                    <div className="p-6 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">{t.full_name || "Full Name"}</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">{t.email || "Email"}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">{t.phone || "Phone Number"}</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">{t.city || "City"}</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">{t.skills_expertise}</label>
                                <textarea
                                    name="skills"
                                    rows="3"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder={t.skills_placeholder}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">{t.why_volunteer}</label>
                                <textarea
                                    name="motivation"
                                    rows="4"
                                    required
                                    value={formData.motivation}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
