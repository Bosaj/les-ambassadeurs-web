import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../hooks/useData';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExpand, FaSearch, FaImages } from 'react-icons/fa';

const FILTERS = ['all', 'event', 'project', 'program', 'general'];

const GalleryPage = () => {
    const { t, language } = useLanguage();
    const { galleryImages, fetchGalleryImages } = useData();
    const [activeFilter, setActiveFilter] = useState('all');
    const [lightboxImg, setLightboxImg] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            await fetchGalleryImages();
            setIsLoading(false);
        };
        load();
    }, [fetchGalleryImages]);

    // Close lightbox on Escape
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') setLightboxImg(null); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const getCaption = (img) => {
        if (!img.caption) return '';
        if (typeof img.caption === 'string') return img.caption;
        return img.caption[language] || img.caption.en || img.caption.fr || img.caption.ar || '';
    };

    const filtered = galleryImages.filter(img => {
        const matchesFilter = activeFilter === 'all' || img.related_type === activeFilter;
        const caption = getCaption(img).toLowerCase();
        const matchesSearch = !searchTerm || caption.includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const filterLabels = {
        all: t.gallery_filter_all,
        event: t.gallery_filter_events,
        project: t.gallery_filter_projects,
        program: t.gallery_filter_programs,
        general: t.gallery_filter_general,
    };

    const typeColors = {
        event: 'bg-blue-500',
        project: 'bg-emerald-500',
        program: 'bg-purple-500',
        general: 'bg-orange-500',
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Hero Header */}
            <div className="relative bg-blue-900 dark:bg-gray-800 overflow-hidden py-24 px-4">
                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
                <div className="relative container mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-white/20">
                            <FaImages className="text-yellow-400" />
                            {t.gallery_page_title}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {t.gallery_page_title}
                        </h1>
                        <p className="text-blue-200 text-lg max-w-2xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {t.gallery_page_subtitle}
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Search + Filters */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {/* Search */}
                    <div className="relative w-full md:max-w-xs flex-shrink-0">
                        <FaSearch className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder={t.search_placeholder || 'Search...'}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    {/* Filter pills */}
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                                    activeFilter === f
                                        ? 'bg-blue-900 text-white border-blue-900 shadow-lg shadow-blue-900/30 scale-105'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400'
                                }`}
                            >
                                {filterLabels[f]}
                            </button>
                        ))}
                    </div>
                    <span className="ms-auto text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap hidden md:block">
                        {filtered.length} {t.gallery_filter_all || 'photos'}
                    </span>
                </div>

                {/* Gallery Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 text-gray-500 dark:text-gray-400"
                    >
                        <FaImages className="text-6xl mx-auto mb-4 opacity-30" />
                        <p className="text-xl font-medium">{t.no_gallery_images}</p>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
                    >
                        <AnimatePresence>
                            {filtered.map((img, index) => (
                                <motion.div
                                    key={img.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.03 }}
                                    className="break-inside-avoid mb-4 group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl cursor-pointer transition-all duration-300"
                                    onClick={() => setLightboxImg(img)}
                                >
                                    <img
                                        src={img.image_url}
                                        alt={getCaption(img) || 'Gallery image'}
                                        className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                        onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=Image'; }}
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                        {getCaption(img) && (
                                            <p className="text-white text-sm font-medium leading-snug line-clamp-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                                {getCaption(img)}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            {img.related_type && img.related_type !== 'general' && (
                                                <span className={`text-xs text-white px-2 py-0.5 rounded-full font-medium ${typeColors[img.related_type] || 'bg-gray-500'}`}>
                                                    {filterLabels[img.related_type]}
                                                </span>
                                            )}
                                            <FaExpand className="text-white/80 ms-auto text-sm" />
                                        </div>
                                    </div>
                                    {/* Featured badge */}
                                    {img.is_featured && (
                                        <div className="absolute top-2 start-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                                            ★ {t.featured_image || 'Featured'}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setLightboxImg(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="relative max-w-5xl w-full max-h-[90vh] mx-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <img
                                src={lightboxImg.image_url}
                                alt={getCaption(lightboxImg)}
                                className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                                onError={e => { e.target.src = 'https://via.placeholder.com/800x600?text=Image'; }}
                            />
                            {getCaption(lightboxImg) && (
                                <div className="mt-4 text-center">
                                    <p className="text-white text-base font-medium" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                        {getCaption(lightboxImg)}
                                    </p>
                                    {lightboxImg.related_type && lightboxImg.related_type !== 'general' && (
                                        <span className={`inline-block mt-1 text-xs text-white px-2 py-0.5 rounded-full font-medium ${typeColors[lightboxImg.related_type] || 'bg-gray-500'}`}>
                                            {filterLabels[lightboxImg.related_type]}
                                        </span>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={() => setLightboxImg(null)}
                                className="absolute -top-4 -right-4 bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition"
                            >
                                <FaTimes />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GalleryPage;
