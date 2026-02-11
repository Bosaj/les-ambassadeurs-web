import React from 'react';
import { FaAward, FaHandHoldingHeart, FaUsers, FaStar, FaMedal } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const BADGE_CONFIG = {
    active_member: {
        icon: FaStar,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    donor: {
        icon: FaHandHoldingHeart,
        color: 'text-pink-500',
        bgColor: 'bg-pink-100 dark:bg-pink-900/30',
        borderColor: 'border-pink-200 dark:border-pink-800'
    },
    participant: {
        icon: FaUsers,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-blue-200 dark:border-blue-800'
    },
    veteran: {
        icon: FaMedal,
        color: 'text-purple-500',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        borderColor: 'border-purple-200 dark:border-purple-800'
    },
    default: {
        icon: FaAward,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        borderColor: 'border-gray-200 dark:border-gray-700'
    }
};

const BadgeDisplay = ({ badges = [] }) => {
    const { t } = useLanguage();

    if (!badges || badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-3">
            {badges.map((badge, index) => {
                const config = BADGE_CONFIG[badge.id] || BADGE_CONFIG.default;
                const Icon = config.icon;

                return (
                    <div
                        key={`${badge.id}-${index}`}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.borderColor} transition-transform hover:scale-105 cursor-help group relative`}
                    >
                        <Icon className={`${config.color} text-sm`} />
                        <span className={`text-xs font-bold ${config.color} uppercase tracking-wider`}>
                            {t[`badge_${badge.id}`] || badge.label || badge.id}
                        </span>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                            {t[`badge_${badge.id}_desc`] || "Badge earned"}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BadgeDisplay;
