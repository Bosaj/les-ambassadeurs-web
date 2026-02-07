import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { translations } from '../translations';
import { FaGraduationCap, FaHandsHelping, FaHeart, FaLeaf, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Modal from './Modal';

const Programs = () => {
    const { language } = useLanguage();
    const { programs, projects, getLocalizedContent } = useData(); // Fetch dynamic programs & projects
    const t = translations[language];
    const navigate = useNavigate();
    const [selectedProgram, setSelectedProgram] = useState(null);

    // Dynamic programs & projects from DB (3 of each as requested)
    const latestPrograms = programs.slice(0, 3).map(p => ({ ...p, type: 'programs' }));
    const latestProjects = projects.slice(0, 3).map(p => ({ ...p, type: 'projects' }));
    const displayItems = [...latestPrograms, ...latestProjects];

    return (
        <section id="programs" className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-4">
                        {t.programs_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.programs_desc}
                    </p>
                    <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
                </div>

                <div className="flex flex-wrap justify-center gap-8">
                    {displayItems.length > 0 ? displayItems.map((item, index) => (
                        <div
                            key={item.id || index}
                            className="bg-transparent rounded-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group flex flex-col items-center w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)] max-w-sm overflow-hidden border border-gray-200 dark:border-gray-700"
                            onClick={() => {
                                navigate('/programs', { state: { selectedProgram: item, type: item.type } });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            <div className="w-full h-48 bg-gray-200 dark:bg-gray-600 relative overflow-hidden">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={getLocalizedContent(item.title, language)}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-blue-900/20 dark:text-white/20">
                                        <FaHandsHelping className="text-6xl" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                    <span className="text-white font-semibold">{t.learn_more}</span>
                                </div>
                                {/* Type Badge */}
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 text-xs font-bold px-2 py-1 rounded shadow text-blue-900 dark:text-white">
                                    {item.type === 'programs' ? (t.programs_section_title || "Program") : (t.projects_section_title || "Project")}
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1 w-full text-center">
                                <div className="mb-4 text-blue-900 dark:text-blue-300">
                                    {/* Optional: Icon overlay or category badge could go here */}
                                    {item.location && getLocalizedContent(item.location, language) && (
                                        <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                                            <FaMapMarkerAlt /> {getLocalizedContent(item.location, language)}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-blue-900 dark:text-white line-clamp-1 border-b-2 border-transparent group-hover:border-red-500 transition-colors inline-block mx-auto pb-1">
                                    {getLocalizedContent(item.title, language)}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-6 flex-1 text-sm leading-relaxed">
                                    {getLocalizedContent(item.description, language)}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProgram(item);
                                    }}
                                    className="mt-auto inline-flex items-center text-red-500 hover:text-red-600 font-bold uppercase tracking-wide text-sm group-hover:gap-2 transition-all"
                                >
                                    <span>{t.learn_more}</span>
                                    <FaArrowRight className={`ml-1 ${language === 'ar' ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <p className="col-span-full text-center text-gray-500 text-lg">{t.loading_programs}</p>
                    )}
                </div>

                <div className="text-center mt-12">
                    <Link
                        to="/programs"
                        className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <span>{t.discover_all}</span>
                        <FaArrowRight className={`ml-2 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </Link>
                </div>
            </div>

            <Modal
                isOpen={!!selectedProgram}
                onClose={() => setSelectedProgram(null)}
                title={getLocalizedContent(selectedProgram?.title, language)}
                heroImage={selectedProgram?.image_url}
            >
                <div className="relative">
                    {/* Hero image is handled by Modal component now */
                        !selectedProgram?.image_url && (
                            <div className="flex justify-center items-center h-48 bg-blue-50 dark:bg-gray-800 rounded-lg mb-6">
                                <FaHandsHelping className="text-blue-900/40 text-6xl" />
                            </div>
                        )}

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-8">
                            {selectedProgram?.location && getLocalizedContent(selectedProgram.location, language) && (
                                <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded w-fit">
                                    <FaMapMarkerAlt /> {getLocalizedContent(selectedProgram.location, language)}
                                </div>
                            )}
                            {getLocalizedContent(selectedProgram?.description, language)}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-end mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <Link
                            to="/volunteer"
                            className="px-6 py-2.5 rounded-full border-2 border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition text-center"
                            onClick={() => setSelectedProgram(null)}
                        >
                            {t.volunteer}
                        </Link>
                        <Link
                            to="/donate"
                            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all text-center"
                            onClick={() => setSelectedProgram(null)}
                        >
                            {t.donate}
                        </Link>
                    </div>
                </div>
            </Modal>
        </section>
    );
};

export default Programs;
