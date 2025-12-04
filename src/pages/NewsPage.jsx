import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';

const NewsPage = () => {
    const { language } = useLanguage();
    const t = translations[language];

    // Expanded mock data
    const newsItems = [
        {
            id: 1,
            image: "https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&h=400",
            date: t.news1_date,
            locationKey: "casablanca",
            titleKey: "news1_title",
            descKey: "news1_desc",
            category: "Education"
        },
        {
            id: 2,
            image: "https://images.pexels.com/photos/6994982/pexels-photo-6994982.jpeg?auto=compress&cs=tinysrgb&h=400",
            date: t.news2_date,
            locationKey: "casablanca",
            titleKey: "news2_title",
            descKey: "news2_desc",
            category: "Health"
        },
        {
            id: 3,
            image: "https://images.pexels.com/photos/3846052/pexels-photo-3846052.jpeg?auto=compress&cs=tinysrgb&h=400",
            date: t.news3_date,
            locationKey: "rabat",
            titleKey: "news3_title",
            descKey: "news3_desc",
            category: "Community"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 bg-gray-50 min-h-screen"
        >
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-blue-900 mb-6">{t.news_archive_title}</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {t.news_archive_desc}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {newsItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt="News"
                                    className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    {item.category}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center text-sm text-gray-500 mb-3 gap-4">
                                    <span className="flex items-center gap-1">
                                        <FaCalendarAlt className="text-blue-900" />
                                        {item.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaMapMarkerAlt className="text-red-500" />
                                        {t[item.locationKey] || item.locationKey}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 mb-3 line-clamp-2 group-hover:text-red-500 transition">
                                    {t[item.titleKey]}
                                </h3>
                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {t[item.descKey]}
                                </p>
                                <a href="#" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition">
                                    {t.read_more} <FaArrowRight className={`ml-2 ${language === 'ar' ? 'rotate-180' : ''}`} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default NewsPage;
