import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaUserPlus, FaCheckCircle, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NewsPage = () => {
    const { news, registerForEvent } = useData();
    const { user } = useAuth();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [guestForm, setGuestForm] = useState({ name: '', email: '' });

    const handleRegisterClick = (event) => {
        if (user) {
            // Auto register logged in user
            if (event.attendees.some(a => a.email === user.email)) {
                toast.error("You are already registered!");
                return;
            }
            registerForEvent('news', event.id, { name: user.name, email: user.email });
            toast.success("Successfully registered!");
        } else {
            // Open modal for guest
            setSelectedEvent(event);
        }
    };

    const handleGuestSubmit = (e) => {
        e.preventDefault();
        registerForEvent('news', selectedEvent.id, guestForm);
        toast.success("Successfully registered!");
        setSelectedEvent(null);
        setGuestForm({ name: '', email: '' });
    };

    return (
        <div className="py-20 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center text-blue-900 mb-12">Latest News & Events</h1>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map((item) => {
                        const isRegistered = user && item.attendees.some(a => a.email === user.email);
                        return (
                            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition">
                                <img src={item.image} alt={item.title} className="h-48 w-full object-cover" />
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <FaCalendarAlt className="mr-2" /> {item.date}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h2>
                                    <p className="text-gray-600 mb-4 flex-1">{item.description}</p>
                                    <div className="flex justify-between items-center mt-auto pt-4 border-t">
                                        <span className="text-sm font-semibold text-blue-900">{item.attendees.length} Attendees</span>
                                        {isRegistered ? (
                                            <span className="flex items-center text-green-600 font-bold gap-2">
                                                <FaCheckCircle /> Joined
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleRegisterClick(item)}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2 text-sm"
                                            >
                                                <FaUserPlus /> Join / Attend
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Guest Registration Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Register for {selectedEvent.title}</h2>
                        <form onSubmit={handleGuestSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={guestForm.name}
                                    onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={guestForm.email}
                                    onChange={e => setGuestForm({ ...guestForm, email: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition">
                                Confirm Registration
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsPage;
