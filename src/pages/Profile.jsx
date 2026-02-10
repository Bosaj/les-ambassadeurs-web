import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaSave, FaCamera, FaHistory, FaCheckCircle, FaCalendarAlt, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const Profile = () => {
    const { user, refreshProfile, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [membershipHistory, setMembershipHistory] = useState([]);

    // Delete Account State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        username: '',
        phone: '',
        city: '',
        full_name_ar: '',
        city_ar: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || user.name || '',
                email: user.email || '',
                password: '', // Clear password field on load
                username: user.username || '',
                phone: user.phone_number || user.phone || '',
                city: user.city || '',
                full_name_ar: user.full_name_ar || '',
                city_ar: user.city_ar || ''
            });
            if (user.avatar_url) {
                setAvatarPreview(user.avatar_url);
            }

            const fetchMembershipHistory = async () => {
                try {
                    const { data, error } = await supabase
                        .from('annual_memberships')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('year', { ascending: false });
                    if (error) throw error;
                    if (data) setMembershipHistory(data);
                } catch (error) {
                    console.error("Error fetching membership history:", error.message);
                    toast.error(t.error_fetching_history || "Error fetching membership history.");
                }
            };

            fetchMembershipHistory();
        }
    }, [user, t]);

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
            if (formData.full_name_ar !== user.full_name_ar) profileUpdates.full_name_ar = formData.full_name_ar;
            if (formData.city_ar !== user.city_ar) profileUpdates.city_ar = formData.city_ar;

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

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        if (window.confirm(t.delete_account_confirm || "Are you absolutely sure? Type 'DELETE' to confirm.")) {
            setDeleteLoading(true);
            const toastId = toast.loading(t.processing || "Processing...");
            try {
                // Call Supabase RPC to delete user from auth.users
                // This requires the 'delete_own_account' function to be created in Supabase (check migrations)
                const { error } = await supabase.rpc('delete_own_account');

                if (error) throw error;

                toast.success(t.account_deleted_success || "Your account has been deleted.", { id: toastId });

                // Logout and redirect
                await logout();
                navigate('/');

            } catch (error) {
                console.error("Delete account error:", error);
                toast.error(t.delete_account_error || "Error deleting account. Please contact support.", { id: toastId });
                setDeleteLoading(false);
            }
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

                        {/* Arabic Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FaUser className="text-blue-500" /> {t.full_name_ar}
                            </label>
                            <input
                                type="text"
                                name="full_name_ar"
                                value={formData.full_name_ar}
                                onChange={handleChange}
                                placeholder={t.full_name_ar_placeholder}
                                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition text-right"
                                dir="rtl"
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

                        {/* Arabic City */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FaUser className="text-blue-500" /> {t.city_ar}
                            </label>
                            <input
                                type="text"
                                name="city_ar"
                                value={formData.city_ar}
                                onChange={handleChange}
                                placeholder={t.city_ar_placeholder}
                                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition text-right"
                                dir="rtl"
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
            </div>

            {/* Membership History Section */}
            <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden animate-fade-in delay-100">
                <div className="bg-green-600 p-6 text-white text-center">
                    <FaHistory className="text-4xl mx-auto mb-3" />
                    <h2 className="text-2xl font-bold">{t.membership_history_title || "Membership History"}</h2>
                    <p className="opacity-90">{t.membership_history_desc || "Your annual contribution records"}</p>
                </div>
                <div className="p-8">
                    {membershipHistory.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                            <p>{t.no_history || "No membership payments recorded yet."}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {membershipHistory.map((record) => (
                                <div key={record.year} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-xl">
                                            <FaCalendarAlt />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-white">{record.year}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t.annual_fee || "Annual Fee"}: {record.amount} {t.currency_mad}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full font-bold text-sm">
                                        <FaCheckCircle />
                                        <span>{t.paid || "Paid"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Account Section */}
            <div className="max-w-4xl mx-auto mt-12 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl shadow-sm overflow-hidden p-8">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 shrink-0">
                        <FaExclamationTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">{t.delete_account_title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{t.delete_account_warning}</p>

                        {showDeleteConfirm ? (
                            <div className="space-y-4 animate-fade-in bg-white dark:bg-gray-800 p-6 rounded-xl border border-red-100 dark:border-red-900/50">
                                <label className="block font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                    {t.delete_account_confirm}
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder={t.delete_confirmation_placeholder}
                                    className="w-full p-3 border border-red-300 rounded-lg dark:bg-gray-700 dark:border-red-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none mb-4"
                                />
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                                    >
                                        {deleteLoading ? t.processing : t.delete_account_btn}
                                    </button>
                                    <button
                                        onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg dark:bg-gray-700 dark:text-white transition-colors"
                                        disabled={deleteLoading}
                                    >
                                        {t.cancel_registration || "Cancel"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                            >
                                <FaTrash /> {t.delete_account_btn}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
