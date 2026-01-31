import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const VolunteerDashboard = () => {
    const { user, logout } = useAuth();
    const { t, language } = useLanguage();
    const { addPost } = useData();
    const navigate = useNavigate();

    const [eventCount, setEventCount] = useState(0);
    const [donationCount, setDonationCount] = useState(0);
    const [testimonial, setTestimonial] = useState('');
    const [rating, setRating] = useState(5);

    const events = [
        { id: 1, title: t.event_beach_cleanup, date: '2024-06-05', location: 'Casablanca' },
        { id: 2, title: t.event_food_drive, date: '2024-03-12', location: 'Rabat' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleJoinEvent = () => {
        setEventCount(prev => prev + 1);
        toast.success(t.event_joined_success);
    };

    const handleRequestAdmin = async () => {
        if (!window.confirm(t.confirm_admin_request || "Request Admin access?")) return;

        const toastId = toast.loading(t.submitting_request || "Submitting request...");
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ request_status: 'pending' })
                .eq('id', user.id);

            if (error) throw error;
            toast.success(t.request_submitted || "Request submitted successfully!", { id: toastId });
        } catch (error) {
            console.error('Error requesting admin:', error);
            toast.error(t.request_failed || "Request failed", { id: toastId });
        }
    };

    const handleSubmitTestimonial = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(t.processing || "Processing...");
        try {
            await addPost('testimonials', {
                name: user.name,
                role: { en: 'Volunteer', fr: 'Bénévole', ar: 'متطوع' }, // Generic role
                content: { [language]: testimonial }, // Save content in current language
                rating: rating,
                image_url: user.user_metadata?.avatar_url || '', // Use user profile pic if available
                is_approved: false // Pending approval
            });
            toast.success(t.testimonial_submitted_approval, { id: toastId });
            setTestimonial('');
            setRating(5);
        } catch (error) {
            console.error(error);
            toast.error(t.error_occurred, { id: toastId });
        }
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
                    <div className="flex gap-2">
                        {user?.role !== 'admin' && (
                            <button onClick={handleRequestAdmin} className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-4 py-2 rounded hover:bg-yellow-200 flex items-center gap-2">
                                <FaUserShield /> {t.request_admin || "Request Admin Access"}
                            </button>
                        )}
                        <button onClick={handleLogout} className="bg-white border text-gray-700 px-4 py-2 rounded hover:bg-gray-50 flex items-center gap-2">
                            <FaSignOutAlt /> {t.logout}
                        </button>
                    </div>
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
