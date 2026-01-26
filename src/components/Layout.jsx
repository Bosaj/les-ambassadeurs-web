import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { Toaster } from 'react-hot-toast';

import { useLanguage } from '../context/LanguageContext';

const Layout = () => {
    const { language } = useLanguage();

    return (
        <div
            className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 flex flex-col ${language === 'ar' ? 'font-arabic' : ''}`}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            <ScrollToTop />
            <Toaster position="top-center" reverseOrder={false} />
        </div>
    );
};

export default Layout;
