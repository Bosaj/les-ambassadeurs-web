import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaHandsHelping, FaHandHoldingUsd, FaHandshake } from 'react-icons/fa';

const GetInvolved = () => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 mb-4">
                        {t.help_title}
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {t.help_desc}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition">
                        <div className="text-blue-900 mb-4 flex justify-center">
                            <FaHandsHelping className="text-5xl" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-blue-900">
                            {t.volunteer_title}
                        </h3>
                        <p className="text-gray-700 mb-6">
                            {t.volunteer_desc}
                        </p>
                        <a href="#" className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg inline-block transition">
                            {t.register_now}
                        </a>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition">
                        <div className="text-blue-900 mb-4 flex justify-center">
                            <FaHandHoldingUsd className="text-5xl" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-blue-900">
                            {t.donate_money}
                        </h3>
                        <p className="text-gray-700 mb-6">
                            {t.donate_desc}
                        </p>
                        <a href="#" className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg inline-block transition">
                            {t.donate}
                        </a>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition">
                        <div className="text-blue-900 mb-4 flex justify-center">
                            <FaHandshake className="text-5xl" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-blue-900">
                            {t.partner_title}
                        </h3>
                        <p className="text-gray-700 mb-6">
                            {t.partner_desc}
                        </p>
                        <a href="#" className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg inline-block transition">
                            {t.contact_us}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GetInvolved;
