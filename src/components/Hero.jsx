import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Poster-style hero matching the 2026 Instagram identity: navy grid paper,
// torn white paper title, red accents, taped polaroid photo.
const Hero = () => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <section id="home" className="relative overflow-hidden bg-brand-grid text-white py-12 md:py-20">
            {/* Red dotted band, like the posters' bottom half */}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-brand-dots opacity-90 [clip-path:polygon(0_18%,8%_10%,17%_16%,26%_8%,36%_14%,47%_6%,58%_13%,69%_7%,80%_15%,90%_9%,100%_14%,100%_100%,0_100%)]" />

            <div className="container mx-auto px-4 relative flex flex-col md:flex-row items-center gap-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="md:w-1/2 w-full"
                >
                    <div className="paper-torn px-6 py-8 md:px-10 md:py-10 -rotate-1">
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight text-[var(--brand-navy)]">
                            {t.hero_title}
                        </h2>
                        <p className="mt-4 text-base md:text-lg text-gray-700 font-medium">
                            {t.hero_desc}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link to="/volunteer" className="btn-brand py-3 px-7 text-center text-lg">
                            {t.join_us}
                        </Link>
                        <Link to="/donate" className="btn-brand-light py-3 px-7 text-center text-lg">
                            {t.donate}
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="md:w-1/2 w-full flex justify-center"
                >
                    <figure className="brand-tape bg-white p-3 pb-10 rotate-2 shadow-2xl max-w-md w-full">
                        <img
                            src="/images/hero.jpg"
                            alt={t.hero_title}
                            className="w-full aspect-[3/2] object-cover"
                            fetchpriority="high"
                        />
                    </figure>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
