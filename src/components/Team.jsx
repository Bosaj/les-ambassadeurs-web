import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaLinkedin, FaTwitter } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const Team = () => {
    const { language } = useLanguage();
    const t = translations[language];

    const teamMembers = [
        {
            name: language === 'ar' ? "أحمد الزبيري" : "Ahmed Zbiri",
            role: t.founder_role,
            image: "https://randomuser.me/api/portraits/men/54.jpg"
        },
        {
            name: language === 'ar' ? "فاطمة العلوي" : "Fatima Alaoui",
            role: t.vice_president_role,
            image: "https://randomuser.me/api/portraits/women/12.jpg"
        },
        {
            name: language === 'ar' ? "عمر المرابطي" : "Omar Marabti",
            role: t.treasurer_role,
            image: "https://randomuser.me/api/portraits/men/83.jpg"
        },
        {
            name: language === 'ar' ? "ليلى الشرقاوي" : "Layla Charqawi",
            role: t.programs_manager_role,
            image: "https://randomuser.me/api/portraits/women/47.jpg"
        },
        {
            name: language === 'ar' ? "كريم بناني" : "Karim Bennani",
            role: "Marketing Manager",
            image: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            name: language === 'ar' ? "سارة المنصوري" : "Sara El Mansouri",
            role: "Volunteer Coordinator",
            image: "https://randomuser.me/api/portraits/women/65.jpg"
        }
    ];

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h3 className="text-2xl font-bold text-blue-900 mb-8">
                        {t.team_title}
                    </h3>

                    <Swiper
                        modules={[Autoplay, Pagination]}
                        spaceBetween={30}
                        slidesPerView={1}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                            },
                            1024: {
                                slidesPerView: 4,
                            },
                        }}
                        className="pb-12"
                    >
                        {teamMembers.map((member, index) => (
                            <SwiperSlide key={index}>
                                <div className="bg-white rounded-lg shadow-md overflow-hidden text-center pb-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-64 object-cover"
                                    />
                                    <h4 className="font-bold text-blue-900 mt-4 text-lg">
                                        {member.name}
                                    </h4>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {member.role}
                                    </p>
                                    <div className="flex justify-center gap-3">
                                        <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors"><FaLinkedin size={20} /></a>
                                        <a href="#" className="text-blue-400 hover:text-blue-600 transition-colors"><FaTwitter size={20} /></a>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default Team;
