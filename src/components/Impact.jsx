import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaMapMarkerAlt, FaUsers, FaHandHoldingHeart, FaCalendarCheck } from 'react-icons/fa';

const Impact = () => {
    const { language } = useLanguage();
    const t = translations[language];

    const stats = [
        {
            icon: <FaMapMarkerAlt className="text-4xl" />,
            number: "53",
            text: t.branches_count
        },
        {
            icon: <FaUsers className="text-4xl" />,
            number: "12,500+",
            text: t.volunteers_count
        },
        {
            icon: <FaHandHoldingHeart className="text-4xl" />,
            number: "45,000+",
            text: t.beneficiaries_count
        },
        {
            icon: <FaCalendarCheck className="text-4xl" />,
            number: "300+",
            text: t.events_count
        }
    ];

    return (
        <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-gray-100 mb-4">
                        {t.impact_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.impact_desc}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md text-center transition hover:-translate-y-1 hover:shadow-xl">
                            <div className="text-blue-900 dark:text-blue-400 mb-4 flex justify-center">
                                {stat.icon}
                            </div>
                            <h3 className="text-4xl font-bold mb-2 text-blue-900 dark:text-white">
                                {stat.number}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 font-medium">
                                {stat.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Impact;
