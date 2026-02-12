import React, { useState } from 'react';
import { FaStar, FaTimes, FaSave } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const AwardPointsModal = ({ isOpen, onClose, user, onSuccess, t }) => {
    const [amount, setAmount] = useState(10);
    const [reason, setReason] = useState('');
    const [actionType, setActionType] = useState('bonus');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Awarding points...");

        try {
            const { error } = await supabase.rpc('award_points', {
                p_user_id: user.id,
                p_amount: parseInt(amount),
                p_description: reason,
                p_action_type: actionType
            });

            if (error) throw error;

            toast.success("Points awarded successfully!", { id: toastId });
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <FaStar className="text-yellow-200" /> Award Points
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-600">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Awarding to:</p>
                        <p className="font-bold text-lg dark:text-white">{user.full_name || user.username || user.email}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Points Amount
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
                            Action Type
                        </label>
                        <select
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="bonus">Bonus / Recognition</option>
                            <option value="volunteer">Volunteering</option>
                            <option value="attendance">Event Attendance</option>
                            <option value="donation">Donation</option>
                            <option value="referral">Referral</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reason / Description
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows="3"
                            placeholder="e.g. Outstanding contribution to the cleanup event"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded shadow-md transition flex items-center gap-2"
                        >
                            {loading ? "Awarding..." : <><FaSave /> Award</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AwardPointsModal;
