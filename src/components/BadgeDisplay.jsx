import React from 'react';
import {
    FaAward, FaHandHoldingHeart, FaUsers, FaStar, FaMedal, FaCrown, FaRocket,
    FaShieldAlt, FaCalendarCheck, FaCheckCircle
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../lib/gamification';

const ICONS = { FaAward, FaHandHoldingHeart, FaUsers, FaStar, FaMedal, FaCrown, FaRocket, FaShieldAlt, FaCalendarCheck, FaCheckCircle };

const STYLE = {
    event: 'text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
    donation: 'text-pink-600 bg-pink-100 border-pink-200 dark:bg-pink-900/30 dark:border-pink-800',
    community: 'text-green-600 bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800',
    points: 'text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800',
};

// Shows badges as returned by badge_definitions ({ id, name, name_i18n, description_i18n, icon, category })
const BadgeDisplay = ({ badges = [] }) => {
    const { language } = useLanguage();

    if (!badges || badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-3">
            {badges.map((badge) => {
                const Icon = ICONS[badge.icon] || FaAward;
                const style = STYLE[badge.category] || 'text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
                const name = localized(badge.name_i18n, language, badge.name || badge.id);
                const description = localized(badge.description_i18n, language, '');

                return (
                    <div
                        key={badge.id}
                        title={description}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${style} transition-transform hover:scale-105`}
                    >
                        <Icon className="text-sm" />
                        <span className="text-xs font-bold uppercase tracking-wider">{name}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default BadgeDisplay;
