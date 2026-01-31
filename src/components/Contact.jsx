import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
// removed import { translations } from '../translations';
import { FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Contact = () => {
    const { language, t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, email, subject, message } = formData;
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

        if (!name || !email || !subject || !message) {
            toast.error(t.incomplete_message);
            return;
        }
        if (!emailRegex.test(email)) {
            toast.error(t.invalid_email);
            return;
        }

        toast.success(t.success_message);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    return (
        <section id="contact" className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-gray-100 mb-4">
                        {t.contact_us}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.contact_desc}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
                </div>

                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-white mb-6">
                        {t.send_message}
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2">
                                    {t.full_name}
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={t.full_name}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">
                                    {t.email_address}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={t.email_address}
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 mb-2">
                                {t.subject}
                            </label>
                            <select
                                id="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">{t.select_subject}</option>
                                <option value="volunteer">{t.volunteer_subject}</option>
                                <option value="donation">{t.donation_subject}</option>
                                <option value="partnership">{t.partnership_subject}</option>
                                <option value="media">{t.media_subject}</option>
                                <option value="other">{t.other_subject}</option>
                            </select>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 mb-2">
                                {t.message}
                            </label>
                            <textarea
                                id="message"
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={t.message}
                            ></textarea>
                        </div>

                        <div className="text-center">
                            <button
                                type="submit"
                                className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition"
                            >
                                <span>{t.send_btn}</span>
                                <FaPaperPlane className={`ml-2 ${language === 'ar' ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
