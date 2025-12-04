import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <section id="home" className="bg-gradient-to-br from-[#0D47A1] to-[#1976D2] text-white py-20">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="md:w-1/2 mb-10 md:mb-0"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        {t.hero_title}
                    </h2>
                    <p className="text-xl mb-8">
                        {t.hero_desc}
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:gap-4">
                        <Link to="/volunteer" className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-center transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            {t.join_us}
                        </Link>
                        <Link to="/donate" className="bg-white hover:bg-gray-100 text-blue-900 font-bold py-3 px-6 rounded-lg text-center transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            {t.donate}
                        </Link>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:w-1/2 flex justify-center"
                >
                    <img
                        src="https://images.pexels.com/photos/16515032/pexels-photo-16515032.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350"
                        alt="Volunteers"
                        className="rounded-lg shadow-2xl"
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
