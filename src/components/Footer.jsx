import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
// removed import { translations } from '../translations';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Footer = () => {
    const { language, t } = useLanguage();

    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (e, sectionId) => {
        e.preventDefault();
        if (location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/', { state: { scrollTo: sectionId } });
        }
    };

    return (
        <footer className="bg-gray-900 dark:bg-black text-white pt-12 pb-6 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            {t.association_name}
                        </h3>
                        <p className="text-gray-400 mb-4">
                            {t.footer_about_desc}
                        </p>
                        <div className="flex flex-row items-center gap-4">
                            <a href="https://www.facebook.com/jamiyat.safarat.khair.oujda" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition p-1">
                                <FaFacebookF className="text-2xl" />
                            </a>
                            <a href="https://x.com/associationabv" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6 fill-current">
                                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                                </svg>
                            </a>
                            <a href="https://www.instagram.com/goodness_ambassadors_oujda" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition p-1">
                                <FaInstagram className="text-2xl" />
                            </a>
                            <a href="https://www.linkedin.com/company/jamiyat-safarat-khair-oujda/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition p-1">
                                <FaLinkedinIn className="text-2xl" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            {t.quick_links}
                        </h3>
                        <ul className="space-y-2">
                            <li><button onClick={(e) => handleNavigation(e, 'hero')} className="text-gray-400 hover:text-white transition text-left">{t.home}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'about')} className="text-gray-400 hover:text-white transition text-left">{t.about}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'programs')} className="text-gray-400 hover:text-white transition text-left">{t.programs}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'branches')} className="text-gray-400 hover:text-white transition text-left">{t.branches}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'news')} className="text-gray-400 hover:text-white transition text-left">{t.news}</button></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            {t.help_title}
                        </h3>
                        <ul className="space-y-2">
                            <li><Link to="/volunteer" className="text-gray-400 hover:text-white transition">{t.volunteer}</Link></li>
                            <li><Link to="/donate" className="text-gray-400 hover:text-white transition">{t.donate_money}</Link></li>
                            <li><Link to="/donate" className="text-gray-400 hover:text-white transition">{t.in_kind_donation}</Link></li>
                            <li><a href="mailto:asosoufaraelkhir48@gmail.com" className="text-gray-400 hover:text-white transition">{t.partner_title}</a></li>
                            <li><Link to="/news" className="text-gray-400 hover:text-white transition">{t.raise_awareness}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            {t.contact_us}
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-2">
                                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                                <span className="text-gray-400">{t.address}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FaPhone className="text-gray-400" />
                                <span className="text-gray-400" dir="ltr">{t.phone_number}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FaEnvelope className="text-gray-400" />
                                <span className="text-gray-400">asosoufaraelkhir48@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm text-center">
                        {t.copyright} Website by <a href="https://www.linkedin.com/in/oussama-elhadji" className="underline" target="_blank" rel="noopener noreferrer">Oussama ELHADJI</a>
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-white text-sm transition">{t.privacy_policy}</a>
                        <a href="#" className="text-gray-400 hover:text-white text-sm transition">{t.terms_of_use}</a>
                        <a href="#" className="text-gray-400 hover:text-white text-sm transition">{t.report_problem}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
