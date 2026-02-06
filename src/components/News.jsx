import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { translations } from '../translations';
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight, FaThumbtack } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Modal from './Modal';

const News = () => {
    const { language } = useLanguage();
    const { news, events, getLocalizedContent } = useData();
    const t = translations[language];
    const [selectedNews, setSelectedNews] = useState(null);

    // Combine News and Events for the "Latest News & Events" section
    // Sort by date descending
    const allItems = [
        ...(news || []).map(n => ({ ...n, type: 'news', displayCategory: 'News' })),
        ...(events || []).map(e => ({ ...e, type: 'event', displayCategory: e.category || 'Event' }))
    ].sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
    const displayItems = allItems.slice(0, 3);

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
                    {displayItems.length > 0 ? displayItems.map((item, index) => (
                        <div
                            key={item.id || index}
                            className="bg-transparent rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition group cursor-pointer"
                            onClick={() => setSelectedNews(item)}
                        >
                            <div className="relative">
                                <img
                                    src={item.image_url || "https://via.placeholder.com/300"}
                                    alt={getLocalizedContent(item.title, language)}
                                    className="w-full h-48 object-cover transition group-hover:scale-105"
                                />
                                <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider ${item.type === 'news' ? 'bg-red-500 text-white' :
                                    item.category === 'program' ? 'bg-purple-500 text-white' :
                                        item.category === 'project' ? 'bg-amber-500 text-white' :
                                            'bg-blue-500 text-white'
                                    }`}>
                                    {item.displayCategory}
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <span className="flex items-center gap-1">
                                        <FaCalendarAlt /> <span>{new Date(item.date).toLocaleDateString()}</span>
                                    </span>
                                    {item.location && (
                                        <span className="flex items-center gap-1 ml-3">
                                            <FaMapMarkerAlt /> <span>{getLocalizedContent(item.location, language)}</span>
                                        </span>
                                    )}
                                    {item.is_pinned && <span className="flex items-center gap-1 text-blue-600 ml-auto"><FaThumbtack /> {t.pin_item || "Pinned"}</span>}
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-white mb-3 line-clamp-2">
                                    {getLocalizedContent(item.title, language)}
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                                    {getLocalizedContent(item.description, language)}
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
                    )) : (
                        <p className="col-span-full text-center text-gray-500">{t.loading_events}</p>
                    )}
                </div>

                <div className="text-center mt-12">
                    <Link
                        to="/news"
                        className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <span>{t.view_all_news}</span>
                        <FaArrowRight className={`ml-2 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </Link>
                </div>
            </div>

            <Modal
                isOpen={!!selectedNews}
                onClose={() => setSelectedNews(null)}
                title={getLocalizedContent(selectedNews?.title, language)}
                heroImage={selectedNews?.image_url || selectedNews?.image}
            >
                <div className="relative">
                    <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                        <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                            <FaCalendarAlt />
                            <span>{selectedNews?.date ? new Date(selectedNews.date).toLocaleDateString() : ''}</span>
                        </span>
                        {selectedNews?.location && getLocalizedContent(selectedNews.location, language) && (
                            <span className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full border border-red-100 dark:border-red-800">
                                <FaMapMarkerAlt />
                                <span>{getLocalizedContent(selectedNews.location, language)}</span>
                            </span>
                        )}
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {getLocalizedContent(selectedNews?.description, language)}
                        </p>
                    </div>

                    {/* Optional: Add call to action if it's an event */}
                    {selectedNews?.type === 'event' && (
                        <div className="flex justify-end mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <Link
                                to="/contact" // Or registration link
                                className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition"
                                onClick={() => setSelectedNews(null)}
                            >
                                {t.join_event || "Join Event"}
                            </Link>
                        </div>
                    )}
                </div>
            </Modal>
        </section>
    );
};

export default News;
