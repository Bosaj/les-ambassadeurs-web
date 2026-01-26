import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Modal from './Modal';

const News = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const [selectedNews, setSelectedNews] = useState(null);

    const newsItems = [
        {
            image: "https://images.pexels.com/photos/618848/pexels-photo-618848.jpeg?auto=compress&cs=tinysrgb&h=250",
            date: t.news1_date,
            location: t.oujda,
            title: t.news1_title,
            desc: t.news1_desc,
            content: t.news_content_1
        },
        {
            image: "https://images.pexels.com/photos/5904935/pexels-photo-5904935.jpeg?auto=compress&cs=tinysrgb&h=250",
            date: t.news2_date,
            location: t.casablanca,
            title: t.news2_title,
            desc: t.news2_desc,
            content: t.news_content_2
        },
        {
            image: "https://images.pexels.com/photos/5904935/pexels-photo-5904935.jpeg?auto=compress&cs=tinysrgb&h=250",
            date: t.news3_date,
            location: t.rabat,
            title: t.news3_title,
            desc: t.news3_desc,
            content: t.news_content_3
        }
    ];

    return (
        <section id="news" className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-gray-100 mb-4">
                        {t.news_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.news_desc}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {newsItems.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition group cursor-pointer"
                            onClick={() => setSelectedNews(item)}
                        >
                            <img
                                src={item.image}
                                alt="News"
                                className="w-full h-48 object-cover transition group-hover:scale-105"
                            />
                            <div className="p-6">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <span className="flex items-center gap-1">
                                        <FaCalendarAlt /> <span>{item.date}</span>
                                    </span>
                                    <span className="mx-2">|</span>
                                    <span className="flex items-center gap-1">
                                        <FaMapMarkerAlt /> <span>{item.location}</span>
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-white mb-3 line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                                    {item.desc}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNews(item);
                                    }}
                                    className="inline-flex items-center text-red-500 hover:text-red-600 font-medium hover:underline"
                                >
                                    <span>{t.read_more}</span>
                                    <FaArrowRight className={`ml-1 ${language === 'ar' ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link to="/news" className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition">
                        <span>{t.view_all_news}</span>
                        <FaArrowRight className={`ml-2 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </Link>
                </div>
            </div>

            <Modal
                isOpen={!!selectedNews}
                onClose={() => setSelectedNews(null)}
                title={selectedNews?.title}
            >
                <img
                    src={selectedNews?.image}
                    alt={selectedNews?.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <div className="flex items-center text-sm text-gray-500 mb-4 gap-4">
                    <span className="flex items-center gap-1">
                        <FaCalendarAlt /> <span>{selectedNews?.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <FaMapMarkerAlt /> <span>{selectedNews?.location}</span>
                    </span>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedNews?.content}
                </p>
            </Modal>
        </section>
    );
};

export default News;
