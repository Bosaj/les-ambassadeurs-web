import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaHandHoldingHeart, FaHandsHelping, FaEnvelope, FaBars, FaTimes, FaUser, FaSignOutAlt, FaTachometerAlt, FaMoon, FaSun, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
    const { language, changeLanguage, t } = useLanguage();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [programsDropdownOpen, setProgramsDropdownOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navLinkClass = ({ isActive }) =>
        `text-blue-900 dark:text-gray-200 font-medium transition hover:text-red-500 ${isActive ? 'text-red-500 font-bold dark:text-red-400' : ''}`;

    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (e, sectionId) => {
        e.preventDefault();
        if (location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Fallback for strict strict mode or if element not yet rendered
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            navigate('/', { state: { scrollTo: sectionId } });
        }
    };

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
                                <span className="flex items-center gap-2 text-xs sm:text-base"><FaUser /> <Link to="/login" className="hover:text-red-400 transition">{t.login_btn}</Link></span>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-white/50" />
                                    ) : (
                                        <FaUser />
                                    )}
                                    <span className="text-xs sm:text-base font-bold text-yellow-300">
                                        {t.welcome}, {user.username || user.full_name?.split(' ')[0] || user.name?.split(' ')[0] || user.email?.split('@')[0]}
                                    </span>
                                </div>
                                <span className="flex items-center gap-2 text-xs sm:text-base"><Link to="/profile" className="hover:text-red-400 transition">{t.profile_title}</Link></span>
                                {user.role === 'volunteer' && user.membership_status !== 'active' && (
                                    <span className="flex items-center gap-2 text-xs sm:text-base text-yellow-500 font-bold"><Link to="/membership" className="hover:text-yellow-300 transition glow-sm">{t.become_member}</Link></span>
                                )}
                                <span className="flex items-center gap-2 text-xs sm:text-base"><FaTachometerAlt /> <Link to={user.role === 'admin' ? "/dashboard/admin" : "/dashboard/volunteer"} className="hover:text-red-400 transition">{t.dashboard}</Link></span>
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
            </div >

            {/* Main Header */}
            < header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50" >
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
                            <li><button onClick={(e) => handleNavigation(e, 'hero')} className="text-blue-900 dark:text-gray-200 hover:text-red-500 font-medium transition cursor-pointer">{t.home}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'about')} className="text-blue-900 dark:text-gray-200 hover:text-red-500 font-medium transition cursor-pointer">{t.about}</button></li>

                            {/* Programs Dropdown */}
                            <li className="relative group"
                                onMouseEnter={() => setProgramsDropdownOpen(true)}
                                onMouseLeave={() => setProgramsDropdownOpen(false)}
                            >
                                <button
                                    className="text-blue-900 dark:text-gray-200 hover:text-red-500 font-medium transition cursor-pointer flex items-center gap-1"
                                    onClick={(e) => {
                                        // Optional: Click main link to go to page or section? 
                                        // Let's make it toggle dropdown on click if not hovering (touch devices) or just go to Section
                                        handleNavigation(e, 'programs');
                                    }}
                                >
                                    {t.programs} <FaChevronDown className="text-xs" />
                                </button>

                                {programsDropdownOpen && (
                                    <div className="absolute top-full start-0 pt-2 w-48 animate-fade-in z-50">
                                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden py-1">
                                            <button
                                                onClick={(e) => {
                                                    handleNavigation(e, 'programs');
                                                    setProgramsDropdownOpen(false);
                                                }}
                                                className="block w-full text-start px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-900 dark:hover:text-white transition"
                                            >
                                                {t.featured_programs}
                                            </button>
                                            <NavLink
                                                to="/programs"
                                                className="block w-full text-start px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-900 dark:hover:text-white transition"
                                                onClick={() => {
                                                    setProgramsDropdownOpen(false);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                            >
                                                {t.all_programs}
                                            </NavLink>
                                        </div>
                                    </div>
                                )}
                            </li>

                            <li><button onClick={(e) => handleNavigation(e, 'branches')} className="text-blue-900 dark:text-gray-200 hover:text-red-500 font-medium transition cursor-pointer">{t.branches}</button></li>
                            <li><NavLink to="/news" className={navLinkClass} onClick={handleScrollToTop}>{t.news}</NavLink></li>
                            <li><button onClick={(e) => handleNavigation(e, 'contact')} className="text-blue-900 dark:text-gray-200 hover:text-red-500 font-medium transition cursor-pointer">{t.contact_us}</button></li>
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
                                <li><button className="block py-2 text-blue-900 text-start hover:text-red-500" onClick={(e) => { toggleMobileMenu(); handleNavigation(e, 'hero'); }}>{t.home}</button></li>
                                <li><button className="block py-2 text-blue-900 text-start hover:text-red-500" onClick={(e) => { toggleMobileMenu(); handleNavigation(e, 'about'); }}>{t.about}</button></li>

                                {/* Mobile Programs Submenu */}
                                <li>
                                    <div className="flex flex-col gap-2">
                                        <button className="block py-2 text-blue-900 text-start hover:text-red-500 font-medium" onClick={(e) => { toggleMobileMenu(); handleNavigation(e, 'programs'); }}>
                                            {t.programs}
                                        </button>
                                        <div className="ps-4 border-s-2 border-gray-100 flex flex-col gap-2">
                                            <button
                                                className="block py-1 text-sm text-gray-500 hover:text-blue-900 text-start"
                                                onClick={(e) => { toggleMobileMenu(); handleNavigation(e, 'programs'); }}
                                            >
                                                {t.featured_programs}
                                            </button>
                                            <NavLink
                                                to="/programs"
                                                className="block py-1 text-sm text-gray-500 hover:text-blue-900"
                                                onClick={() => {
                                                    toggleMobileMenu();
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                            >
                                                {t.all_programs}
                                            </NavLink>
                                        </div>
                                    </div>
                                </li>

                                <li><button className="block py-2 text-blue-900 text-start hover:text-red-500" onClick={(e) => { toggleMobileMenu(); handleNavigation(e, 'branches'); }}>{t.branches}</button></li>
                                <li><NavLink to="/news" className="block py-2 text-blue-900 hover:text-red-500" onClick={toggleMobileMenu}>{t.news}</NavLink></li>
                                <li><button className="block py-2 text-blue-900 text-start hover:text-red-500" onClick={(e) => { toggleMobileMenu(); handleNavigation(e, 'contact'); }}>{t.contact_us}</button></li>
                                {!user ? (
                                    <li><Link to="/login" className="block py-2 text-blue-900 hover:text-red-500 font-bold" onClick={toggleMobileMenu}>{t.login_btn}</Link></li>
                                ) : (
                                    <>
                                        <li><Link to={user.role === 'admin' ? "/dashboard/admin" : "/dashboard/volunteer"} className="block py-2 text-blue-900 hover:text-red-500 font-bold" onClick={toggleMobileMenu}>{t.dashboard}</Link></li>
                                        <li><button onClick={() => { logout(); toggleMobileMenu(); }} className="block py-2 text-red-600 hover:text-red-800 font-bold w-full text-start">{t.logout}</button></li>
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
