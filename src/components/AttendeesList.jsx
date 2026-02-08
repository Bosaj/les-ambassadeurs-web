import React from 'react';
import { useData } from '../context/DataContext';

const AttendeesList = ({ attendees, max = 3, size = "w-8 h-8" }) => {
    const { users } = useData();

    if (!attendees || attendees.length === 0) return null;

    // Filter out rejected attendees
    const validAttendees = attendees.filter(a => a.status !== 'rejected');

    if (validAttendees.length === 0) return null;

    const displayedAttendees = validAttendees.slice(0, max);
    // const remainingCount = validAttendees.length - max; // Optional: if we want to show +X in the avatar stack itself

    const getAvatar = (email) => {
        const user = users.find(u => u.email === email);
        return user?.avatar_url || null;
    };

    return (
        <div className="flex items-center -space-x-2">
            {displayedAttendees.map((attendee, index) => {
                const avatar = getAvatar(attendee.email);
                return (
                    <div key={index} className="relative group z-10 hover:z-20 transition-all duration-200 hover:scale-110">
                        {avatar ? (
                            <img
                                className={`${size} rounded-full border-2 border-white dark:border-gray-800 object-cover shadow-sm`}
                                src={avatar}
                                alt={attendee.name}
                                title={attendee.name}
                            />
                        ) : (
                            <div
                                className={`${size} rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] text-white font-bold uppercase shadow-sm`}
                                title={attendee.name}
                            >
                                {attendee.name ? attendee.name.charAt(0) : '?'}
                            </div>
                        )}
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {attendee.name}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AttendeesList;
