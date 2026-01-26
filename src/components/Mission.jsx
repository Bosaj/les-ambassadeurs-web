import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaBullseye, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Mission = () => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-gray-100 mb-4">
                        {t.mission_vision_title}
                    </h2>
                    <div className="w-24 h-1 bg-red-500 mx-auto"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md hover:shadow-lg transition cursor-default"
                    >
                        <div className="text-blue-900 dark:text-blue-400 mb-4 text-4xl">
                            <FaBullseye />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-blue-900 dark:text-white">
                            {t.our_mission}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            {t.mission_desc}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md hover:shadow-lg transition cursor-default"
                    >
                        <div className="text-blue-900 dark:text-blue-400 mb-4 text-4xl">
                            <FaEye />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-blue-900 dark:text-white">
                            {t.our_vision}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            {t.vision_desc}
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Mission;
