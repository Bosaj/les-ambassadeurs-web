import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaChevronRight } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { ar, fr, enUS } from 'date-fns/locale';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const NotificationItem = ({ notification, onRead }) => {
    const { language } = useLanguage();

    // Select locale for date-fns
    const localeMap = {
        ar: ar,
        fr: fr,
        en: enUS
    };
    const locale = localeMap[language] || enUS;

    const getIcon = () => {
        switch (notification.type) {
            case 'success': return <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />;
            case 'warning': return <FaExclamationTriangle className="text-yellow-500 text-lg flex-shrink-0" />;
            case 'error': return <FaTimesCircle className="text-red-500 text-lg flex-shrink-0" />;
            default: return <FaInfoCircle className="text-blue-500 text-lg flex-shrink-0" />;
        }
    };

    const getBgColor = () => {
        return notification.is_read
            ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
            : 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20';
    };

    const Content = (
        <div
            className={`flex items-start gap-3 p-3 transition-colors duration-200 cursor-pointer ${getBgColor()}`}
            onClick={!notification.is_read ? onRead : undefined}
        >
            <div className="mt-1">
                {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-sm font-semibold truncate ${notification.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                        {notification.title}
                    </h4>
                    {!notification.is_read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" title="Unread"></span>
                    )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {notification.message}
                </p>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 block">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale })}
                </span>
            </div>
        </div>
    );

    if (notification.link) {
        return (
            <Link to={notification.link} className="block group" onClick={onRead}>
                {Content}
            </Link>
        );
    }

    return (
        <div className="block group">
            {Content}
        </div>
    );
};

export default NotificationItem;
