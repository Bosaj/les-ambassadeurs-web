import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaUserPlus, FaCheckCircle, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProgramsPage = () => {
    const { programs, registerForEvent } = useData();
    const { user } = useAuth();
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [guestForm, setGuestForm] = useState({ name: '', email: '' });

    const handleJoinClick = (program) => {
        if (user) {
            if (program.attendees.some(a => a.email === user.email)) {
                toast.error("You are already registered!");
                return;
            }
            registerForEvent('programs', program.id, { name: user.name, email: user.email });
            toast.success("Successfully joined!");
        } else {
            setSelectedProgram(program);
        }
    };

    const handleGuestSubmit = (e) => {
        e.preventDefault();
        registerForEvent('programs', selectedProgram.id, guestForm);
        toast.success("Successfully joined!");
        setSelectedProgram(null);
        setGuestForm({ name: '', email: '' });
    };

    return (
        <div className="py-20 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center text-blue-900 mb-12">Our Programs</h1>

                <div className="space-y-8">
                    {programs.map((program) => {
                        const isJoined = user && program.attendees.some(a => a.email === user.email);
                        return (
                            <div key={program.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition">
                                <img src={program.image} alt={program.title} className="h-64 md:h-auto md:w-1/3 object-cover" />
                                <div className="p-8 flex flex-col justify-center flex-1">
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <FaCalendarAlt className="mr-2" /> {program.date}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{program.title}</h2>
                                    <p className="text-gray-600 mb-6">{program.description}</p>
                                    <div className="flex items-center gap-6">
                                        <span className="text-blue-900 font-semibold">{program.attendees.length} Participants</span>
                                        {isJoined ? (
                                            <span className="flex items-center text-green-600 font-bold gap-2 border px-4 py-2 rounded-lg bg-green-50">
                                                <FaCheckCircle /> Joined
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleJoinClick(program)}
                                                className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition flex items-center gap-2"
                                            >
                                                <FaUserPlus /> Join Program
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Guest Modal */}
            {selectedProgram && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setSelectedProgram(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Join {selectedProgram.title}</h2>
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
                                Confirm & Join
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramsPage;
