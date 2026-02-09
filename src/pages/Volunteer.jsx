import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGoogle, FaHandPaper, FaArrowRight } from 'react-icons/fa';

const Volunteer = () => {
    const { t } = useLanguage();
    const { loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard/volunteer');
        }
    }, [user, navigate]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4 flex flex-col items-center justify-center transition-colors duration-300"
        >
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden text-center">
                <div className="bg-blue-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <FaHandPaper className="text-5xl mx-auto mb-4 relative z-10 animate-bounce-slow" />
                    <h1 className="text-3xl font-bold relative z-10">{t.volunteer_title}</h1>
                    <p className="text-blue-200 mt-2 relative z-10">
                        {t.volunteer_subtitle}
                    </p>
                </div>

                <div className="p-8">
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                        {t.volunteer_signin_desc}
                    </p>

                    <button
                        onClick={loginWithGoogle}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm hover:shadow-md group"
                    >
                        <FaGoogle className="text-red-500 group-hover:scale-110 transition-transform" />
                        <span>{t.signin_google}</span>
                    </button>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-400">
                            {t.volunteer_terms}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Volunteer;
