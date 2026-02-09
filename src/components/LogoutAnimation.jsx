import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSignOutAlt } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

const LogoutAnimation = ({ isVisible }) => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-blue-900/90 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm mx-4"
                    >
                        <motion.div
                            animate={{
                                x: [0, 10, -10, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
                            className="text-6xl text-red-500 mb-6"
                        >
                            <FaSignOutAlt />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            {t.logging_out}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            {t.see_you_soon}
                        </p>

                        <motion.div
                            className="mt-6 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden"
                        >
                            <motion.div
                                className="bg-red-500 h-2.5 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LogoutAnimation;
