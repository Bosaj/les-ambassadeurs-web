import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaEdit } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import BranchMap from './BranchMap';
import BranchesManagementModal from './admin/BranchesManagementModal';

const Branches = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const [selectedCity, setSelectedCity] = useState('');
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('branches')
                .select('*')
                .order('city', { ascending: true });

            if (error) throw error;
            setBranches(data || []);
        } catch (error) {
            console.error('Error fetching branches:', error);
            // toast.error("Error loading branches"); // Optional: silent fail for public view
        } finally {
            setLoading(false);
        }
    };

    const filteredBranches = selectedCity
        ? branches.filter(branch => branch.city.toLowerCase() === selectedCity.toLowerCase())
        : branches;

    // Get unique cities for filter dropdown
    const uniqueCities = [...new Set(branches.map(b => b.city))];

    return (
        <section id="branches" className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 relative">
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-4">
                        {t.branches_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.branches_desc}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>

                    {isAdmin && (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute top-0 right-0 mt-2 mr-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
                        >
                            <FaEdit />
                            <span>{t.manage_branches || "Manage Branches"}</span>
                        </button>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Map Column */}
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md h-[500px] flex flex-col">
                        <div className="relative bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-grow z-0">
                            {branches.length > 0 ? (
                                <BranchMap
                                    branches={branches}
                                    selectedCity={selectedCity}
                                    onSelectBranch={(branch) => setSelectedCity(branch.city.toLowerCase())}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                    {loading ? t.loading || "Loading map..." : t.no_branches || "No branches configured"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* List Column */}
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md h-[500px] flex flex-col">
                        <h3 className="text-xl font-bold mb-6 text-blue-900 dark:text-white">
                            {t.find_branch}
                        </h3>

                        <div className="mb-6">
                            <label htmlFor="city-search" className="block text-gray-700 dark:text-gray-300 mb-2">
                                {t.select_city}
                            </label>
                            <select
                                id="city-search"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                            >
                                <option value="">{t.all_cities}</option>
                                {uniqueCities.map(city => (
                                    <option key={city} value={city.toLowerCase()}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                            {filteredBranches.length > 0 ? (
                                filteredBranches.map(branch => (
                                    <div
                                        key={branch.id}
                                        className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition cursor-pointer"
                                        onClick={() => setSelectedCity(branch.city.toLowerCase())}
                                    >
                                        <h4 className="font-bold text-blue-900 dark:text-white text-lg">
                                            {branch.name}
                                        </h4>
                                        <div className="mt-2 space-y-2">
                                            <p className="text-gray-600 dark:text-gray-300 text-sm flex items-start gap-2">
                                                <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
                                                <span>{branch.address}</span>
                                            </p>
                                            {branch.phone && (
                                                <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2">
                                                    <FaPhone className="text-blue-500 flex-shrink-0" />
                                                    <span dir="ltr">{branch.phone}</span>
                                                </p>
                                            )}
                                            {branch.email && (
                                                <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2">
                                                    <FaEnvelope className="text-blue-400 flex-shrink-0" />
                                                    <span>{branch.email}</span>
                                                </p>
                                            )}
                                            {branch.google_map_link && (
                                                <a
                                                    href={branch.google_map_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {t.google_map_link || "View on Google Maps"}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    {t.no_items_found || "No branches found"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isAdmin && (
                <BranchesManagementModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    t={t}
                    onUpdate={fetchBranches}
                />
            )}
        </section>
    );
};

export default Branches;
