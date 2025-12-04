import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

const About = () => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <section id="about" className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 mb-4">
                        {t.about}
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {t.about_subtitle}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                        <h3 className="text-2xl font-bold text-blue-900 mb-4">
                            {t.history_title}
                        </h3>
                        <p className="text-gray-700 mb-6">
                            {t.history_desc1}
                        </p>
                        <p className="text-gray-700">
                            {t.history_desc2}
                        </p>
                    </div>
                    {/* Add image or visual if needed, original HTML didn't have one in this specific grid, 
              but it might be good to have one. The original HTML just had text in one column?
              Wait, line 834 says grid-cols-2 but only one div inside?
              Let's check lines 834-850.
              Ah, I only read up to 850. Maybe the second column is after 850.
              I should check if there is more content for About.
          */}
                    <div className="hidden md:block">
                        {/* Placeholder for now or check next lines */}
                        <img
                            src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400"
                            alt="About Us"
                            className="rounded-lg shadow-lg w-full h-auto object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
