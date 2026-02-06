import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaSave, FaCamera, FaMoneyBillWave, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Profile = () => {
    const { user, refreshProfile } = useAuth();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        username: '',
        phone: '',
        city: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.full_name || user.name || '',
                email: user.email || '',
                username: user.username || '',
                phone: user.phone_number || user.phone || '',
                city: user.city || ''
            }));
            if (user.avatar_url) {
                setAvatarPreview(user.avatar_url);
            }
        }
    }, [user]);

    const [membershipHistory, setMembershipHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            const { data, error } = await supabase
                .from('annual_memberships')
                .select('*')
                .eq('user_id', user.id);
            if (!error && data) {
                setMembershipHistory(data);
            }
        };
        fetchHistory();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading(t.processing || "Processing...");

        try {
            const updates = {};
            if (formData.password) updates.password = formData.password;
            if (formData.email !== user.email) updates.email = formData.email;

            // 1. Update Auth (Email/Password)
            if (Object.keys(updates).length > 0) {
                const { error: authError } = await supabase.auth.updateUser(updates);
                if (authError) throw authError;
            }

            // 2. Upload Avatar
            let avatarUrl = user.avatar_url;
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                avatarUrl = publicUrl;
            }

            // 3. Update Profile (Name, Username, Avatar)
            const profileUpdates = {};
            if (formData.full_name !== (user.full_name || user.name)) profileUpdates.full_name = formData.full_name;
            if (formData.username !== user.username) profileUpdates.username = formData.username;
            if (avatarUrl !== user.avatar_url) profileUpdates.avatar_url = avatarUrl;
            if (formData.phone !== (user.phone_number || user.phone)) profileUpdates.phone_number = formData.phone;
            if (formData.city !== user.city) profileUpdates.city = formData.city;

            if (Object.keys(profileUpdates).length > 0) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update(profileUpdates)
                    .eq('id', user.id);
                if (profileError) throw profileError;
            }

            toast.success(t.update_success || "Profile updated successfully!", { id: toastId });
            setFormData(prev => ({ ...prev, password: '' })); // Clear password field
            await refreshProfile(); // Refresh global user state

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to update profile", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="bg-blue-900 dark:bg-gray-700 p-6 text-white text-center relative">
                        <div className="w-32 h-32 mx-auto relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 bg-white/20 flex items-center justify-center">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <FaUser className="text-4xl" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                                <FaCamera />
                                <input type="file" ref={(ref) => ref && (ref.value = "")} accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                        <h1 className="text-2xl font-bold mt-4">{formData.username || t.profile_title}</h1>
                        <p className="opacity-80">{user?.email}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FaUser className="text-blue-500" /> {t.profile_username || "Username"}
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="coolUser123"
                                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FaUser className="text-blue-500" /> {t.profile_name}
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FaEnvelope className="text-blue-500" /> {t.profile_email}
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FaLock className="text-blue-500" /> {t.profile_password}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={t.profile_password_hint}
                                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FaUser className="text-blue-500" /> {t.profile_phone || "Phone Number"}
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+212 6..."
                                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                        {/* City */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FaUser className="text-blue-500" /> {t.profile_city || "City"}
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Casablanca"
                                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? t.processing : <><FaSave /> {t.save_changes}</>}
                        </button>
                    </form>
                </div>

                {/* Membership History Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 mt-6">
                    <div className="bg-green-600 dark:bg-green-700 p-4 text-white flex items-center gap-3">
                        <FaMoneyBillWave className="text-2xl" />
                        <h2 className="text-xl font-bold">{t.membership_history || "Annual Membership History"}</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                            {t.membership_info || "Track your annual membership status (50 DH/year)."}
                        </p>
                        <div className="space-y-3">
                            {(() => {
                                const startYear = 2024;
                                const currentYear = new Date().getFullYear();
                                const years = [];
                                for (let y = startYear; y <= currentYear + 1; y++) years.push(y);

                                return years.map(year => {
                                    const record = membershipHistory.find(m => m.year === year);
                                    const isPaid = !!record;

                                    return (
                                        <div key={year} className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                                            <span className="font-bold text-lg dark:text-gray-200">{year}</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${isPaid
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                                }`}>
                                                {isPaid ? <><FaCheckCircle /> {t.paid || "Paid"}</> : <><FaTimesCircle /> {t.unpaid || "Unpaid"}</>}
                                            </span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
