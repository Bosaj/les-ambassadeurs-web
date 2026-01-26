import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import toast from 'react-hot-toast';

const Newsletter = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

        if (!email) {
            toast.error(t.empty_email);
            return;
        }
        if (!emailRegex.test(email)) {
            toast.error(t.invalid_email_newsletter);
            return;
        }

        toast.success(t.success_subscribe);
        setEmail('');
    };

    return (
        <section className="py-16 bg-blue-900 dark:bg-gray-900 text-white transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {t.newsletter_title}
                    </h2>
                    <p className="text-xl mb-8">
                        {t.newsletter_desc}
                    </p>

                    <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex flex-col sm:flex-row gap-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-grow p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                            placeholder={t.subscribe_placeholder}
                        />
                        <button
                            type="submit"
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition"
                        >
                            {t.subscribe_btn}
                        </button>
                    </form>

                    <p className="text-sm mt-4 text-blue-200">
                        {t.privacy_policy_text}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
