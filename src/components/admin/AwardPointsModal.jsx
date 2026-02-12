import React, { useState } from 'react';
import { FaStar, FaTimes, FaSave } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

import { useLanguage } from '../../context/LanguageContext';

const AwardPointsModal = ({ isOpen, onClose, user, onSuccess }) => {
    const { language, t } = useLanguage();
    const [amount, setAmount] = useState(10);
    const [reason, setReason] = useState('');
    const [actionType, setActionType] = useState('bonus');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading(t.awarding_process || "Awarding points...");

        try {
            const { error } = await supabase.rpc('award_points', {
                p_user_id: user.id,
                p_amount: parseInt(amount),
                p_description: reason,
                p_action_type: actionType
            });

            if (error) throw error;

            toast.success(t.points_awarded_success || "Points awarded successfully!", { id: toastId });
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Error awarding points:", error);
            toast.error(error.message || "Failed to award points", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <FaStar className="text-yellow-200" /> {t.award_points_title || "Award Points"}
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-600">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.awarding_to || "Awarding to"}:</p>
                        <p className="font-bold text-lg dark:text-white">{(language === 'ar' && user.full_name_ar) ? user.full_name_ar : (user.full_name || user.username || user.email)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t.points_amount || "Points Amount"}
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t.action_type || "Action Type"}
                        </label>
                        <select
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="bonus">{t.action_bonus || "Bonus / Recognition"}</option>
                            <option value="volunteer">{t.action_volunteering || "Volunteering"}</option>
                            <option value="attendance">{t.action_attendance || "Event Attendance"}</option>
                            <option value="donation">{t.action_donation || "Donation"}</option>
                            <option value="referral">{t.action_referral || "Referral"}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t.reason_description || "Reason / Description"}
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows="3"
                            placeholder={t.reason_placeholder || "e.g. Outstanding contribution..."}
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition"
                        >
                            {t.cancel_action || "Cancel"}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white font-bold shadow-md transition flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <FaStar className="animate-spin" /> {t.awarding_process || "Awarding..."}
                                </>
                            ) : (
                                <>
                                    <FaSave /> {t.award_action || "Award"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AwardPointsModal;
