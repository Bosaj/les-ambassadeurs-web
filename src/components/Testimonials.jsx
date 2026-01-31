import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaStar } from 'react-icons/fa';
import { useData } from '../context/DataContext';

const Testimonials = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const { testimonials, getLocalizedContent } = useData();

    return (
        <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-gray-100 mb-4">
                        {t.testimonials_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.testimonials_desc}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.filter(item => item.is_approved).map((item, index) => (
                        <div key={item.id || index} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md hover:shadow-lg transition">
                            <div className="flex mb-4 text-yellow-400 gap-1">
                                {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                            </div>
                            <p className="text-gray-700 dark:text-gray-200 italic mb-6">
                                "{getLocalizedContent(item.content, language)}"
                            </p>
                            <div className="flex items-center gap-4">
                                <img
                                    src={item.image_url || "https://via.placeholder.com/150"}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-bold text-blue-900 dark:text-white">
                                        {item.name}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {getLocalizedContent(item.role, language)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
