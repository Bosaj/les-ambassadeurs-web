import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 transition-all duration-300 flex flex-col">
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
