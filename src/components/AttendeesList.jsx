import React from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

const AttendeesList = ({ attendees, max = 3, size = "w-8 h-8", showName = false }) => {
    const { users = [] } = useData() || {};
    const { language } = useLanguage();

    if (!attendees || attendees.length === 0) return null;

    // Filter out rejected attendees
    const validAttendees = attendees.filter(a => a.status !== 'rejected');

    if (validAttendees.length === 0) return null;

    const displayedAttendees = validAttendees.slice(0, max);
    // const remainingCount = validAttendees.length - max; // Optional: if we want to show +X in the avatar stack itself

    const getAttendeeDetails = (attendee) => {
        const user = users.find(u => u.id === attendee.user_id || u.email === attendee.email);

        let displayName = attendee.name || (attendee.email ? attendee.email.split('@')[0] : 'Guest');
        let avatar = user?.avatar_url || null;

        if (user) {
            if (language === 'ar' && user.full_name_ar) {
                displayName = user.full_name_ar;
            } else if (user.full_name) {
                displayName = user.full_name;
            }
        }

        return { displayName, avatar };
    };

    return (
        <div className="flex items-center -space-x-2">
            {displayedAttendees.map((attendee, index) => {
                const { displayName, avatar } = getAttendeeDetails(attendee);
                const isOnlyOne = validAttendees.length === 1;
                const initial = displayName.charAt(0).toUpperCase();

                return (
                    <div key={attendee.id || index} className="flex items-center gap-2">
                        <div className="relative group z-10 hover:z-20 transition-all duration-200 hover:scale-110">
                            {avatar ? (
                                <img
                                    className={`${size} rounded-full border-2 border-white dark:border-gray-800 object-cover shadow-sm bg-gray-200`}
                                    src={avatar}
                                    alt={displayName}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                            ) : null}

                            {/* Fallback (visible if no avatar OR if avatar fails to load) */}
                            <div
                                className={`${size} rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs text-white font-bold uppercase shadow-sm ${avatar ? 'hidden' : 'flex'}`}
                                title={displayName}
                            >
                                {initial}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {displayName}
                            </div>
                        </div>
                        {/* Show name if requested and only 1 attendee */}
                        {showName && isOnlyOne && (
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                                {displayName}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default AttendeesList;
