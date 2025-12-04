import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaHandHoldingHeart, FaHandsHelping, FaEnvelope, FaBars, FaTimes } from 'react-icons/fa';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
    const { language, changeLanguage } = useLanguage();
    const t = translations[language];
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navLinkClass = ({ isActive }) =>
        `text-blue-900 font-medium transition hover:text-red-500 ${isActive ? 'text-red-500 font-bold' : ''}`;

    return (
        <>
            {/* Top Bar */}
            <div className="bg-blue-900 text-white py-2 px-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <Link to="/donate" className="hover:text-red-400 transition flex items-center gap-2">
                            <FaHandHoldingHeart /> <span>{t.donate}</span>
                        </Link>
                        <Link to="/volunteer" className="hover:text-red-400 transition flex items-center gap-2">
                            <FaHandsHelping /> <span>{t.volunteer}</span>
                        </Link>
                        <Link to="/contact" className="hover:text-red-400 transition flex items-center gap-2">
                            <FaEnvelope /> <span>{t.contact}</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
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
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link to="/" className="flex items-center">
                        <img src="/images/ABV.jpg" alt="Logo" className="h-12 mr-3 ml-3" />
                        <h1 className="text-xl font-bold text-blue-900">
                            {t.association_name}
                        </h1>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:block">
                        <ul className="flex items-center gap-8">
                            <li><NavLink to="/" className={navLinkClass} end>{t.home}</NavLink></li>
                            <li><a href="/#about" className="text-blue-900 hover:text-red-500 font-medium transition">{t.about}</a></li>
                            <li><a href="/#programs" className="text-blue-900 hover:text-red-500 font-medium transition">{t.programs}</a></li>
                            <li><a href="/#branches" className="text-blue-900 hover:text-red-500 font-medium transition">{t.branches}</a></li>
                            <li><NavLink to="/news" className={navLinkClass}>{t.news}</NavLink></li>
                            <li><NavLink to="/contact" className={navLinkClass}>{t.contact_us}</NavLink></li>
                        </ul>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-blue-900 text-2xl"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white w-full py-2 px-4 shadow-md border-t">
                        <ul className="flex flex-col gap-4">
                            <li><NavLink to="/" className="block py-2 text-blue-900 hover:text-red-500" onClick={toggleMobileMenu}>{t.home}</NavLink></li>
                            <li><a href="/#about" className="block py-2 text-blue-900 hover:text-red-500" onClick={toggleMobileMenu}>{t.about}</a></li>
                            <li><a href="/#programs" className="block py-2 text-blue-900 hover:text-red-500" onClick={toggleMobileMenu}>{t.programs}</a></li>
                            <li><a href="/#branches" className="block py-2 text-blue-900 hover:text-red-500" onClick={toggleMobileMenu}>{t.branches}</a></li>
                            <li><NavLink to="/news" className="block py-2 text-blue-900 hover:text-red-500" onClick={toggleMobileMenu}>{t.news}</NavLink></li>
                            <li><NavLink to="/contact" className="block py-2 text-blue-900 hover:text-red-500" onClick={toggleMobileMenu}>{t.contact_us}</NavLink></li>
                        </ul>
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;
