import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

const Team = () => {
    const { language } = useLanguage();
    const t = translations[language];

    const teamMembers = [
        {
            name: t.team_merouane_name,
            role: t.team_merouane_role,
            image: "/team/merouane_loucif_assocarion_president.jpg"
        },
        {
            name: t.team_asmae_name,
            role: t.team_asmae_role,
            image: "/team/asmae_haddaoui_vice_president.jpg"
        },
        {
            name: t.team_sara_name,
            role: t.team_sara_role,
            image: "/team/sara_assemlali_secretaty_general.jpg"
        },
        {
            name: t.team_meriem_name,
            role: t.team_meriem_role,
            image: "/team/meriem_outfih_deputy_secretary.jpg"
        },
        {
            name: t.team_fatiha_name,
            role: t.team_fatiha_role,
            image: "/team/fatiha_chabab_finacial_manager.jpg"
        },
        {
            name: t.team_aymane_name,
            role: t.team_aymane_role,
            image: "/team/aymane_hamedallah_vice_financial_manager.jpg"
        },
        {
            name: t.team_oussama_name,
            role: t.team_oussama_role,
            image: "/team/oussama_elhadji_coordinator.jpg",
            email: "oussousselhadji@gmail.com",
            linkedin: "https://www.linkedin.com/in/oussama-elhadji/"
        },
        {
            name: t.team_abdelhakim_name,
            role: t.team_abdelhakim_role,
            image: "/team/abdelhakim_azzaoui_community_manager.jpg"
        },
        {
            name: t.team_hanae_name,
            role: t.team_hanae_role,
            image: "/team/hanae_elbergui_social_media_manager.jpeg"
        },
        {
            name: t.team_abderrazzak_name,
            role: t.team_abderrazzak_role,
            image: "/team/abderrazzak_smaili_logistig_manager.jpg"
        },
        {
            name: t.team_anas_name,
            role: t.team_anas_role,
            image: "/team/anas_hamedallah_logistics_manger.jpg"
        },
        {
            name: t.team_khadija_name,
            role: t.team_khadija_role,
            image: "/team/khadija_elmouaden_head_of_organizing_committe.jpeg"
        },
        {
            name: t.team_ayoub_name,
            role: t.team_ayoub_role,
            image: "/team/ayoub_moustafaoui_head_of_design.jpg"
        },
        {
            name: t.team_mohammed_name,
            role: t.team_mohammed_role,
            image: "/team/mohammed_zayri_designer.jpg"
        },
        {
            name: t.team_ayman_photog_name,
            role: t.team_ayman_photog_role,
            image: "/team/ayman_alaoui_photographer.jpg"
        },
        {
            name: t.team_mohamed_mrimi_name,
            role: t.team_mohamed_mrimi_role,
            image: "/team/mohamed_mrimi_photogapher.jpg"
        }
    ];

    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-bold text-blue-900 dark:text-white mb-6 relative inline-block">
                        {t.team_title}
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-red-500 rounded-full"></div>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg mt-4">
                        {t.team_intro_desc}
                    </p>
                </div>

                <div className="team-swiper-container px-4" dir="ltr">
                    <Swiper
                        key={language}
                        effect={'coverflow'}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={'auto'}
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 0,
                            depth: 100,
                            modifier: 2.5,
                            slideShadows: false,
                        }}
                        loop={true}
                        loopedSlides={10} // Increased for smoother infinite loop
                        loopAdditionalSlides={5}
                        autoplay={{
                            delay: 3500,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        modules={[EffectCoverflow, Pagination, Autoplay]}
                        className="pb-16"
                        breakpoints={{
                            320: {
                                slidesPerView: 1,
                                spaceBetween: 20
                            },
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 30
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 40
                            }
                        }}
                    >
                        {teamMembers.map((member, index) => (
                            <SwiperSlide key={index} className="max-w-sm">
                                <div className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-[450px]">
                                    {/* Image Container */}
                                    <div className="h-[300px] w-full relative overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-end justify-center pb-6">
                                            <div className="flex gap-4">
                                                <a href={member.linkedin || "#"} target={member.linkedin ? "_blank" : "_self"} rel="noopener noreferrer" className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:scale-110">
                                                    <FaLinkedin size={20} />
                                                </a>
                                                <a href={member.email ? `mailto:${member.email}` : "#"} className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white hover:text-red-500 transition-all duration-300 transform hover:scale-110">
                                                    <FaEnvelope size={20} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Container */}
                                    <div className="relative p-6 pt-8 text-center bg-white dark:bg-gray-800 transition-colors duration-300">
                                        {/* Decorative Element */}
                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-900 dark:bg-red-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 z-30 shadow-lg">
                                            <div className="w-3 h-3 bg-white rounded-full"></div>
                                        </div>

                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                            {member.name}
                                        </h4>
                                        <p className="text-blue-600 dark:text-blue-400 font-medium text-sm uppercase tracking-wider line-clamp-2 min-h-[40px] flex items-center justify-center">
                                            {member.role}
                                        </p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            <style jsx global>{`
                .swiper-pagination-bullet {
                    background-color: #CBD5E1;
                    opacity: 1;
                    width: 10px;
                    height: 10px;
                    transition: all 0.3s ease;
                }
                .swiper-pagination-bullet-active {
                    background-color: #1E3A8A; /* blue-900 */
                    width: 30px;
                    border-radius: 5px;
                }
                .dark .swiper-pagination-bullet-active {
                    background-color: #EF4444; /* red-500 */
                }
            `}</style>
        </section>
    );
};

export default Team;
