import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes, FaTrash } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationItem from './NotificationItem';

const NotificationBell = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (!error && data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        };

        if (user) {
            fetchNotifications();

            // Real-time subscription
            const channel = supabase
                .channel('public:notifications')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
                    console.log('New notification received!', payload);
                    setNotifications(prev => [payload.new, ...prev]);
                    setUnreadCount(prev => prev + 1);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const handleMarkAsRead = async (id) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            // Recalculate unread count locally to avoid drift
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllAsRead = async () => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    };

    const handleClearAll = async () => {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', user.id);

        if (!error) {
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white hover:text-gray-200 transition-colors focus:outline-none rounded-full hover:bg-white/10"
                aria-label="Notifications"
            >
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-blue-900 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-[-60px] sm:right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in-down origin-top-right z-[100]">
                    <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
                            <FaBell className="text-blue-600 dark:text-blue-400" />
                            {t?.notifications || "Notifications"}
                        </h3>
                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                                >
                                    {t?.mark_all_read || "Mark all read"}
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1"
                                    title={t?.clear_all || "Clear all"}
                                >
                                    <FaTrash size={12} />
                                    <span className="hidden sm:inline">{t?.clear_all || "Clear"}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-3">
                                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full">
                                    <FaBell className="text-gray-300 dark:text-gray-500 text-2xl" />
                                </div>
                                <p className="text-sm">{t?.no_notifications || "No notifications yet"}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {notifications.map(notification => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onRead={() => handleMarkAsRead(notification.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-2 bg-gray-50 dark:bg-gray-900 text-center text-xs text-gray-500 border-t dark:border-gray-700">
                            {t?.showing_last_10 || "Showing last 10 notifications"}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
