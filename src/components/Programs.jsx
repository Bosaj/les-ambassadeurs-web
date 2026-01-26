import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaGraduationCap, FaHandsHelping, FaHeart, FaLeaf, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Modal from './Modal';

const Programs = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const [selectedProgram, setSelectedProgram] = useState(null);

    const programs = [
        {
            icon: <FaGraduationCap className="text-5xl" />,
            title: t.youth_empowerment,
            desc: t.youth_desc,
            details: t.program_details_youth
        },
        {
            icon: <FaHandsHelping className="text-5xl" />,
            title: t.humanitarian_aid,
            desc: t.humanitarian_desc,
            details: t.program_details_humanitarian
        },
        {
            icon: <FaHeart className="text-5xl" />,
            title: t.social_support,
            desc: t.social_desc,
            details: t.program_details_social
        },
        {
            icon: <FaLeaf className="text-5xl" />,
            title: t.environment,
            desc: t.environment_desc,
            details: t.program_details_environment
        }
    ];

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

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {programs.map((program, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center hover:shadow-lg transition cursor-pointer group"
                            onClick={() => setSelectedProgram(program)}
                        >
                            <div className="flex justify-center items-center text-blue-900 dark:text-blue-300 mb-4 transition group-hover:scale-110 group-hover:text-red-500">
                                {program.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-blue-900 dark:text-white">
                                {program.title}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-200">
                                {program.desc}
                            </p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProgram(program);
                                }}
                                className="mt-4 inline-flex items-center text-red-500 hover:text-red-600 font-medium group-hover:underline"
                            >
                                <span>{t.learn_more}</span>
                                <FaArrowRight className={`ml-1 ${language === 'ar' ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    ))}
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
                title={selectedProgram?.title}
            >
                <div className="text-center mb-6">
                    <div className="text-blue-900 text-6xl mb-4 flex justify-center">
                        {selectedProgram?.icon}
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        {selectedProgram?.details}
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
