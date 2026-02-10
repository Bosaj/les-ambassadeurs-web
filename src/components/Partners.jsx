import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { translations } from '../translations';

const Partners = () => {
    const { language } = useLanguage();
    const { partners } = useData();
    const t = translations[language];

    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-gray-100 mb-4">
                        {t.partners_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.partners_desc}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10">
                    {partners && partners.length > 0 ? (
                        partners.map((partner) => (
                            <a
                                key={partner.id}
                                href={partner.website_url || '#'}
                                target={partner.website_url ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-sm flex items-center justify-center h-28 hover:shadow-md transition group"
                                title={partner.name}
                            >
                                <img
                                    src={partner.image_url}
                                    alt={partner.name}
                                    className="max-h-12 opacity-70 group-hover:opacity-100 transition object-contain"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/150?text=" + partner.name.charAt(0);
                                    }}
                                />
                            </a>
                        ))
                    ) : (
                        // Fallback/Static partners if no data or while loading (optional, or just show message)
                        <div className="col-span-full text-center text-gray-500 py-10">
                            {t.no_partners || "No partners added yet."}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Partners;
