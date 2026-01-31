import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'ar');
    const t = translations[language];

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        // We'll handle font classes in the component or global CSS based on lang attribute
        if (language !== 'ar') {
            document.body.classList.add('latin-font');
        } else {
            document.body.classList.remove('latin-font');
        }
    }, [language]);

    const changeLanguage = (lang) => {
        setLanguage(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);
