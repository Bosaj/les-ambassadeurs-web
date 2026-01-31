import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaHandHoldingHeart, FaHandsHelping, FaEnvelope, FaBars, FaTimes, FaUser, FaSignOutAlt, FaTachometerAlt, FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
    const { language, changeLanguage, t } = useLanguage();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navLinkClass = ({ isActive }) =>
        `text-blue-900 dark:text-gray-200 font-medium transition hover:text-red-500 ${isActive ? 'text-red-500 font-bold dark:text-red-400' : ''}`;

    return (
        <>
            {/* Top Bar */}
            <div className="bg-blue-900 text-white text-sm py-2">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-4">
                        {!user ? (
                            <>
                                <span className="flex items-center gap-2 text-xs sm:text-base"><FaHandHoldingHeart /> <Link to="/donate" className="hover:text-red-400 transition">{t.donate}</Link></span>
                                <span className="flex items-center gap-2 text-xs sm:text-base"><FaHandsHelping /> <Link to="/volunteer" className="hover:text-red-400 transition">{t.volunteer}</Link></span>
                                <span className="flex items-center gap-2 text-xs sm:text-base"><FaUser /> <Link to="/login" className="hover:text-red-400 transition">{t.login_btn || "Login"}</Link></span>
                            </>
                        ) : (
                            <>
                                <span className="flex items-center gap-2 text-xs sm:text-base font-bold text-yellow-300">{t.welcome}, {user.name.split(' ')[0]}</span>
                                <span className="flex items-center gap-2 text-xs sm:text-base"><FaTachometerAlt /> <Link to={user.role === 'admin' ? "/dashboard/admin" : "/dashboard/volunteer"} className="hover:text-red-400 transition">{t.dashboard || "Dashboard"}</Link></span>
                                <button onClick={logout} className="flex items-center gap-2 text-xs sm:text-base hover:text-red-400 transition"><FaSignOutAlt /> {t.logout}</button>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-xs sm:text-base">
                        <button
                            className={`hover:text-red-400 transition ${language === 'ar' ? 'font-bold' : ''}`}
                            onClick={() => changeLanguage('ar')}
                        >
                            العربية
                        </button>
                        <span>|</span>
                        <button
                            className={`hover:text-red-400 transition ${language === 'fr' ? 'font-bold' : ''}`}
                            onClick={() => changeLanguage('fr')}
                        >
                            Français
                        </button>
                        <span>|</span>
                        <button
                            className={`hover:text-red-400 transition ${language === 'en' ? 'font-bold' : ''}`}
                            onClick={() => changeLanguage('en')}
                        >
                            English
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link to="/" className="flex items-center">
                        <img src="/images/new_ABV.jpg" alt="Logo" className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover mr-2 md:mr-3 ml-2 md:ml-3" />
                        <h1 className="text-sm md:text-xl font-bold text-blue-900 dark:text-white leading-tight">
                            {t.association_name}
                        </h1>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:block">
                        <ul className="flex items-center gap-8">
                            <li><NavLink to="/" className={navLinkClass} onClick={handleScrollToTop} end>{t.home}</NavLink></li>
                            <li><a href="/#about" className="text-blue-900 dark:text-gray-200 hover:text-red-500 font-medium transition">{t.about}</a></li>
                            <li><a href="/#programs" className="text-blue-900 dark:text-gray-200 hover:text-red-500 font-medium transition">{t.programs}</a></li>
                            <li><a href="/#branches" className="text-blue-900 dark:text-gray-200 hover:text-red-500 font-medium transition">{t.branches}</a></li>
                            <li><NavLink to="/news" className={navLinkClass}>{t.news}</NavLink></li>
                            <li><a href="/#contact" className="text-blue-900 dark:text-gray-200 hover:text-red-500 font-medium transition">{t.contact_us}</a></li>
                        </ul>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="text-blue-900 dark:text-yellow-400 text-xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? <FaMoon /> : <FaSun />}
                        </button>
                        <button
                            className="md:hidden text-blue-900 dark:text-white text-2xl"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {
                    isMobileMenuOpen && (
                        <div className="md:hidden bg-white dark:bg-gray-800 w-full py-2 px-4 shadow-md border-t dark:border-gray-700">
                            <ul className="flex flex-col gap-4">
                                <li><NavLink to="/" className="block py-2 text-blue-900 hover:text-red-500" onClick={() => { toggleMobileMenu(); handleScrollToTop(); }}>{t.home}</NavLink></li>
                                <li><a href="/#about" className="block py-2 text-blue-900 hover:text-red-500" onClick={toggleMobileMenu}>{t.about}</a></li>
                                <li><a href="/#programs" className="block py-2 text-blue-900 hover:text-red-500" onClick={toggleMobileMenu}>{t.programs}</a></li>
                                <li><a href="/#branches" className="block py-2 text-blue-900 hover:text-red-500" onClick={toggleMobileMenu}>{t.branches}</a></li>
                                <li><NavLink to="/news" className="block py-2 text-blue-900 hover:text-red-500" onClick={toggleMobileMenu}>{t.news}</NavLink></li>
                                <li><a href="/#contact" className="block py-2 text-blue-900 hover:text-red-500" onClick={toggleMobileMenu}>{t.contact_us}</a></li>
                                {!user ? (
                                    <li><Link to="/login" className="block py-2 text-blue-900 hover:text-red-500 font-bold" onClick={toggleMobileMenu}>{t.login_btn || "Login"}</Link></li>
                                ) : (
                                    <>
                                        <li><Link to={user.role === 'admin' ? "/dashboard/admin" : "/dashboard/volunteer"} className="block py-2 text-blue-900 hover:text-red-500 font-bold" onClick={toggleMobileMenu}>{t.dashboard || "Dashboard"}</Link></li>
                                        <li><button onClick={() => { logout(); toggleMobileMenu(); }} className="block py-2 text-red-600 hover:text-red-800 font-bold w-full text-left">{t.logout}</button></li>
                                    </>
                                )}
                            </ul>
                        </div>
                    )
                }
            </header >
        </>
    );
};

export default Header;
