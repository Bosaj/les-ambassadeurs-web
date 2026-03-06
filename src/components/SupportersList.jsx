import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaUserCircle } from 'react-icons/fa';

const SupportersList = ({ supporters, max = 3, size = "w-8 h-8" }) => {
    const { language } = useLanguage();

    if (!supporters || supporters.length === 0) return null;

    const displayedSupporters = supporters.slice(0, max);
    const additionalCount = supporters.length - max;

    const getInitials = (name) => {
        if (!name || name === 'Anonymous') return '?';
        const parts = name.split(' ').filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name[0].toUpperCase();
    };

    return (
        <div className="flex items-center -space-x-2">
            {displayedSupporters.map((supporter, index) => {
                const isAnonymous = supporter.is_anonymous || supporter.donor_name === 'Anonymous';
                const displayName = isAnonymous ? (language === 'ar' ? 'مجهول' : 'Anonymous') : supporter.donor_name;

                return (
                    <div key={supporter.id || index} className="relative group z-10 hover:z-20 transition-all duration-200 hover:scale-110">
                        {isAnonymous ? (
                            <div className={`${size} rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center shadow-sm`}>
                                <FaUserCircle className="text-gray-500 dark:text-gray-400 w-full h-full p-1 opacity-70" />
                            </div>
                        ) : (
                            <div className={`${size} rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs text-white font-bold uppercase shadow-sm`} title={displayName}>
                                {getInitials(displayName)}
                            </div>
                        )}

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            {displayName}
                        </div>
                    </div>
                );
            })}

            {additionalCount > 0 && (
                <div className={`relative z-10 ${size} rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm`} title={`${additionalCount} more`}>
                    +{additionalCount}
                </div>
            )}
        </div>
    );
};

export default SupportersList;
