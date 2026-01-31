import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { FaHandHoldingHeart, FaCalendarCheck, FaStar, FaSignOutAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const VolunteerDashboard = () => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [eventCount, setEventCount] = useState(0);
    const [donationCount, setDonationCount] = useState(0);
    const [testimonial, setTestimonial] = useState('');

    const events = [
        { id: 1, title: 'Beach Cleanup', date: '2024-06-05', location: 'Casablanca' },
        { id: 2, title: 'Food Drive', date: '2024-03-12', location: 'Rabat' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleJoinEvent = () => {
        setEventCount(prev => prev + 1);
        toast.success(t.event_joined_success);
    };

    const handleSubmitTestimonial = (e) => {
        e.preventDefault();
        setTestimonial('');
        toast.success(t.testimonial_submitted);
    };

    const handleDonateClick = () => {
        setDonationCount(prev => prev + 1);
        toast.success(t.donation_thank_you);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t.welcome}, {user?.name}</h1>
                        <p className="text-gray-600">{t.volunteer_dashboard}</p>
                    </div>
                    <button onClick={handleLogout} className="bg-white border text-gray-700 px-4 py-2 rounded hover:bg-gray-50 flex items-center gap-2">
                        <FaSignOutAlt /> {t.logout}
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-blue-900 text-white rounded-xl p-6 shadow-md flex items-center justify-between cursor-pointer transform hover:scale-105 transition" onClick={handleDonateClick}>
                        <div>
                            <p className="text-lg opacity-80">{t.donations_made}</p>
                            <h2 className="text-4xl font-bold">{donationCount}</h2>
                        </div>
                        <FaHandHoldingHeart className="text-5xl opacity-50" />
                    </div>
                    <div className="bg-red-500 text-white rounded-xl p-6 shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-lg opacity-80">{t.events_joined}</p>
                            <h2 className="text-4xl font-bold">{eventCount}</h2>
                        </div>
                        <FaCalendarCheck className="text-5xl opacity-50" />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Available Events */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">{t.upcoming_opportunities}</h2>
                        <div className="space-y-4">
                            {events.map(event => (
                                <div key={event.id} className="border p-4 rounded-lg hover:shadow-md transition">
                                    <h3 className="font-bold text-blue-900">{event.title}</h3>
                                    <p className="text-sm text-gray-500">{event.date} • {event.location}</p>
                                    <button onClick={handleJoinEvent} className="mt-3 w-full bg-blue-100 text-blue-800 py-2 rounded font-medium hover:bg-blue-200 transition">
                                        {t.join_event_btn}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Testimonial */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">{t.share_story}</h2>
                        <form onSubmit={handleSubmitTestimonial}>
                            <textarea
                                value={testimonial}
                                onChange={(e) => setTestimonial(e.target.value)}
                                className="w-full border p-3 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                rows="4"
                                placeholder={t.testimonial_placeholder}
                                required
                            ></textarea>
                            <button className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2">
                                <FaStar /> {t.submit_testimonial}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
