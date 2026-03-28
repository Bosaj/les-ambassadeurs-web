import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../hooks/useData';
import { motion } from 'framer-motion';
import { FaArrowRight, FaImages } from 'react-icons/fa';

// Inject keyframes once into the document head
const KEYFRAMES_ID = 'gallery-marquee-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(KEYFRAMES_ID)) {
    const style = document.createElement('style');
    style.id = KEYFRAMES_ID;
    style.textContent = `
        @keyframes marquee-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .gallery-marquee-track {
            animation: marquee-scroll 28s linear infinite;
        }
        .gallery-marquee-track:hover {
            animation-play-state: paused;
        }
    `;
    document.head.appendChild(style);
}

// Fallback placeholder images for when gallery is empty
const PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80',
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&q=80',
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&q=80',
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&q=80',
    'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&q=80',
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&q=80',
    'https://images.unsplash.com/photo-1460518451285-97b6aa326961?w=400&q=80',
];

const GalleryPreview = () => {
    const { t, language } = useLanguage();
    const { galleryImages, fetchGalleryImages } = useData();

    useEffect(() => {
        fetchGalleryImages();
    }, [fetchGalleryImages]);

    // Determine images to display: real gallery or placeholders
    const displayImages = galleryImages.length > 0
        ? galleryImages.slice(0, 20).map(img => ({
            id: img.id,
            url: img.image_url,
            caption: img.caption ? (img.caption[language] || img.caption.en || '') : ''
        }))
        : PLACEHOLDER_IMAGES.map((url, i) => ({ id: i, url, caption: '' }));

    // Duplicate for seamless infinite loop (CSS animation goes from 0 to -50%)
    const allImages = [...displayImages, ...displayImages];

    return (
        <section className="py-20 bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-300" id="gallery">
            {/* Header text — RTL for Arabic */}
            <div className="container mx-auto px-4 mb-12" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-5 border border-blue-100 dark:border-blue-800">
                        <FaImages />
                        {t.gallery_page_title || 'Gallery'}
                    </span>

                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
                        {t.gallery_preview_title}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                        {t.gallery_preview_subtitle}
                    </p>
                </motion.div>
            </div>

            {/* Scrolling marquee — always LTR so CSS translateX(-50%) loops correctly */}
            <div className="relative w-full mb-12 overflow-hidden" dir="ltr">
                {/* Fade edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />

                {/* Track: width must be auto so CSS knows its own pixel width for the -50% offset */}
                <div
                    className="gallery-marquee-track flex gap-4"
                    style={{ width: 'max-content' }}
                >
                    {allImages.map((img, idx) => (
                        <Link
                            to="/gallery"
                            key={`${img.id}-${idx}`}
                            className="relative flex-shrink-0 w-56 h-40 md:w-72 md:h-52 rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
                        >
                            <img
                                src={img.url}
                                alt={img.caption || 'Gallery'}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                                onError={e => { e.target.src = 'https://placehold.co/300x200?text=Photo'; }}
                            />
                            {/* Hover tint */}
                            <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/30 transition-colors duration-300" />
                            {img.caption && (
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white text-xs font-medium line-clamp-1">{img.caption}</p>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <Link
                        to="/gallery"
                        className="inline-flex items-center gap-3 bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-900/40 hover:-translate-y-1 transition-all duration-300 group text-base"
                    >
                        <FaImages className="text-lg group-hover:scale-110 transition-transform" />
                        {t.view_gallery}
                        <FaArrowRight className={`text-sm transition-transform group-hover:translate-x-1 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default GalleryPreview;
