import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaHandsHelping, FaHeart, FaLeaf, FaArrowRight, FaLaptop, FaMedkit, FaUsers } from 'react-icons/fa';

const ProgramsPage = () => {
    const { language } = useLanguage();
    const t = translations[language];

    // Expanded programs list
    // Expanded programs list
    const allPrograms = [
        {
            icon: <FaGraduationCap className="text-5xl" />,
            title: t.youth_empowerment,
            desc: t.youth_desc,
            details: t.program_details_youth,
            image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
            icon: <FaHandsHelping className="text-5xl" />,
            title: t.humanitarian_aid,
            desc: t.humanitarian_desc,
            details: t.program_details_humanitarian,
            image: "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
            icon: <FaHeart className="text-5xl" />,
            title: t.social_support,
            desc: t.social_desc,
            details: t.program_details_social,
            image: "https://images.pexels.com/photos/7345449/pexels-photo-7345449.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
            icon: <FaLeaf className="text-5xl" />,
            title: t.environment,
            desc: t.environment_desc,
            details: t.program_details_environment,
            image: "https://images.pexels.com/photos/7656721/pexels-photo-7656721.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
            icon: <FaLaptop className="text-5xl" />,
            title: t.digital_literacy,
            desc: t.digital_desc,
            details: t.program_details_digital,
            image: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
            icon: <FaMedkit className="text-5xl" />,
            title: t.health_caravans,
            desc: t.health_desc,
            details: t.program_details_health,
            image: "https://images.pexels.com/photos/6129437/pexels-photo-6129437.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
            icon: <FaUsers className="text-5xl" />,
            title: t.womens_cooperative,
            desc: t.women_desc,
            details: t.program_details_women,
            image: "https://images.pexels.com/photos/4559592/pexels-photo-4559592.jpeg?auto=compress&cs=tinysrgb&w=800"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 bg-gray-50 min-h-screen"
        >
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-blue-900 mb-6">{t.programs_title}</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {t.programs_desc}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allPrograms.map((program, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition group border-t-4 border-blue-900 hover:border-red-500"
                        >
                            <div className="relative h-48 mb-6 overflow-hidden rounded-lg">
                                <img
                                    src={program.image}
                                    alt={program.title}
                                    className="w-full h-full object-cover transition group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                                <div className="absolute bottom-[-20px] right-4 bg-white p-3 rounded-full shadow-lg text-blue-900 group-hover:text-red-500 transition">
                                    {program.icon}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-blue-900 text-center">
                                {program.title}
                            </h3>
                            <p className="text-gray-700 mb-4 text-center font-medium">
                                {program.desc}
                            </p>
                            <p className="text-gray-600 text-sm leading-relaxed text-center">
                                {program.details}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ProgramsPage;
