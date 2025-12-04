import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Branches = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const [selectedCity, setSelectedCity] = useState('');

    const branchesData = [
        {
            id: 'casablanca',
            cityKey: 'casablanca',
            address: '123 Mohammed VI Street', // Address might need translation logic if strict
            phone: '0522-123456',
            email: 'casablanca@safara.org',
            coordinates: { top: '30%', left: '20%' }
        },
        {
            id: 'rabat',
            cityKey: 'rabat',
            address: '45 Hassan II Street',
            phone: '0537-654321',
            email: 'rabat@safara.org',
            coordinates: { top: '25%', left: '25%' }
        },
        {
            id: 'oujda',
            cityKey: 'oujda',
            address: '8 Allal El Fassi Street',
            phone: '0536-789123',
            email: 'oujda@safara.org',
            coordinates: { top: '35%', left: '40%' }
        },
        {
            id: 'marrakech',
            cityKey: 'marrakech',
            address: '22 Mohammed V Street',
            phone: '0524-456789',
            email: 'marrakech@safara.org',
            coordinates: { top: '60%', left: '30%' }
        },
        {
            id: 'essaouira',
            cityKey: 'essaouira',
            address: '10 Beach Avenue',
            phone: '0524-112233',
            email: 'essaouira@safara.org',
            coordinates: { top: '50%', left: '15%' }
        }
    ];

    const filteredBranches = selectedCity
        ? branchesData.filter(branch => branch.id === selectedCity)
        : branchesData;

    return (
        <section id="branches" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 mb-4">
                        {t.branches_title}
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {t.branches_desc}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="relative bg-gray-200 rounded-lg overflow-hidden h-[400px]">
                            <iframe
                                title="Map of Morocco"
                                src="https://maps.google.com/maps?q=Morocco&t=&z=5&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                aria-hidden="false"
                                tabIndex="0"
                            ></iframe>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-6 text-blue-900">
                            {t.find_branch}
                        </h3>

                        <div className="mb-6">
                            <label htmlFor="city-search" className="block text-gray-700 mb-2">
                                {t.select_city}
                            </label>
                            <select
                                id="city-search"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                            >
                                <option value="">{t.all_cities}</option>
                                <option value="casablanca">{t.casablanca}</option>
                                <option value="rabat">{t.rabat}</option>
                                <option value="oujda">{t.oujda}</option>
                                <option value="marrakech">{t.marrakech}</option>
                                <option value="essaouira">{t.essaouira}</option>
                                <option value="fes">{t.fes}</option>
                                <option value="tangier">{t.tangier}</option>
                                <option value="agadir">{t.agadir}</option>
                            </select>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {filteredBranches.map(branch => (
                                <div key={branch.id} className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition cursor-pointer">
                                    <h4 className="font-bold text-blue-900">
                                        {t[branch.cityKey]}
                                    </h4>
                                    <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-red-500" />
                                        <span>{branch.address}</span>
                                    </p>
                                    <p className="text-gray-600 text-sm flex items-center gap-2">
                                        <FaPhone className="text-blue-500" />
                                        <span dir="ltr">{branch.phone}</span>
                                    </p>
                                    <p className="text-gray-600 text-sm flex items-center gap-2">
                                        <FaEnvelope className="text-blue-400" />
                                        <span>{branch.email}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Branches;
