import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { translations } from '../translations';
import { FaGraduationCap, FaHandsHelping, FaHeart, FaLeaf, FaArrowRight } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Modal from './Modal';

const Programs = () => {
    const { language } = useLanguage();
    const { programs, getLocalizedContent } = useData(); // Fetch dynamic programs
    const t = translations[language];
    const navigate = useNavigate();
    const [selectedProgram, setSelectedProgram] = useState(null);

    // Dynamic programs from DB
    const displayPrograms = programs.slice(0, 4); // Limit to 4 for home page?

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
                    {displayPrograms.length > 0 ? displayPrograms.map((program, index) => (
                        <div
                            key={program.id || index}
                            className="bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group flex flex-col items-center w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)] max-w-sm overflow-hidden"
                            onClick={() => navigate('/programs', { state: { selectedProgram: program } })}
                        >
                            <div className="w-full h-48 bg-gray-200 dark:bg-gray-600 relative overflow-hidden">
                                {program.image_url ? (
                                    <img
                                        src={program.image_url}
                                        alt={getLocalizedContent(program.title, language)}
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
                            </div>

                            <div className="p-6 flex flex-col flex-1 w-full text-center">
                                <div className="mb-4 text-blue-900 dark:text-blue-300">
                                    {/* Optional: Icon overlay or category badge could go here */}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-blue-900 dark:text-white line-clamp-1 border-b-2 border-transparent group-hover:border-red-500 transition-colors inline-block mx-auto pb-1">
                                    {getLocalizedContent(program.title, language)}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-6 flex-1 text-sm leading-relaxed">
                                    {getLocalizedContent(program.description, language)}
                                </p>
                                <button
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
                    <Link to="/programs" className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition">
                        <span>{t.discover_all}</span>
                        <FaArrowRight className={`ml-2 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </Link>
                </div>
            </div>

            <Modal
                isOpen={!!selectedProgram}
                onClose={() => setSelectedProgram(null)}
                title={getLocalizedContent(selectedProgram?.title, language)}
            >
                <div className="text-center mb-6">
                    {selectedProgram?.image_url ? (
                        <img
                            src={selectedProgram.image_url}
                            alt={getLocalizedContent(selectedProgram.title, language)}
                            className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                    ) : (
                        <div className="text-blue-900 text-6xl mb-4 flex justify-center">
                            <FaHandsHelping />
                        </div>
                    )}
                    <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                        {getLocalizedContent(selectedProgram?.description, language)}
                    </p>
                </div>
                <div className="flex justify-center">
                    <Link
                        to="/donate"
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                        onClick={() => setSelectedProgram(null)}
                    >
                        {t.donate}
                    </Link>
                </div>
            </Modal>
        </section>
    );
};

export default Programs;
