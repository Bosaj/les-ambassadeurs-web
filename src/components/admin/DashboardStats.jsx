import React from 'react';
import { FaUsers, FaCalendarAlt, FaNewspaper, FaHandsHelping, FaMoneyBillWave } from 'react-icons/fa';

const StatCard = ({ title, value, icon: Icon, color, t }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-transform hover:scale-105">
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</h3>
        </div>
        <div className={`p-4 rounded-full ${color}`}>
            <Icon className="text-white text-xl" />
        </div>
    </div>
);

const DashboardStats = ({ data, t }) => {
    const { news, programs, projects, events, users, donations } = data;

    const stats = [
        {
            title: t.manage_users || "Total Users",
            value: users?.length || 0,
            icon: FaUsers,
            color: "bg-blue-500"
        },
        {
            title: t.tab_news || "News Items",
            value: news?.length || 0,
            icon: FaNewspaper,
            color: "bg-green-500"
        },
        {
            title: t.manage_programs || "Programs",
            value: programs?.length || 0,
            icon: FaCalendarAlt,
            color: "bg-purple-500"
        },
        {
            title: t.manage_projects || "Projects",
            value: projects?.length || 0,
            icon: FaHandsHelping,
            color: "bg-orange-500"
        },
        {
            title: t.tab_events || "Events",
            value: events?.length || 0,
            icon: FaCalendarAlt, // Or FaCalendarCheck
            color: "bg-pink-500"
        },
        // {
        //     title: t.donations || "Donations",
        //     value: `${donations?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)} MAD`, // Example calculation
        //     icon: FaMoneyBillWave,
        //     color: "bg-yellow-500"
        // }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default DashboardStats;
