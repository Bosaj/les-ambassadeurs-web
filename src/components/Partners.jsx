import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

const Partners = () => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 mb-4">
                        {t.partners_title}
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {t.partners_desc}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10">
                    <div className="bg-white p-8 rounded-lg shadow-sm flex items-center justify-center h-28 hover:shadow-md transition">
                        <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/atlassian.svg" alt="Atlassian" className="max-h-12 opacity-70 hover:opacity-100 transition" />
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-sm flex items-center justify-center h-28 hover:shadow-md transition">
                        <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ntt.svg" alt="NTT" className="max-h-12 opacity-70 hover:opacity-100 transition" />
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-sm flex items-center justify-center h-28 hover:shadow-md transition">
                        <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg" alt="Facebook" className="max-h-12 opacity-70 hover:opacity-100 transition" />
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-sm flex items-center justify-center h-28 hover:shadow-md transition">
                        <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg" alt="Twitter" className="max-h-12 opacity-70 hover:opacity-100 transition" />
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-sm flex items-center justify-center h-28 hover:shadow-md transition">
                        <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg" alt="LinkedIn" className="max-h-12 opacity-70 hover:opacity-100 transition" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Partners;
