import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { FaHistory, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa';

const MembershipHistoryModal = ({ user, onClose, t }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
    const years = Array.from({ length: currentYear - startYear + 2 }, (_, i) => startYear + i); // Up to next year

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('annual_memberships')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    const togglePayment = async (year, existingRecord) => {
        try {
            if (existingRecord) {
                // Remove payment
                const { error } = await supabase
                    .from('annual_memberships')
                    .delete()
                    .eq('id', existingRecord.id);
                if (error) throw error;
                toast.success(`Removed payment for ${year}`);
            } else {
                // Add payment
                const { error } = await supabase
                    .from('annual_memberships')
                    .insert({
                        user_id: user.id,
                        year: year,
                        amount: 50,
                        status: 'paid'
                    });
                if (error) throw error;
                toast.success(`Marked ${year} as Paid`);
            }
            fetchHistory(); // Refresh
        } catch (error) {
            console.error("Error toggling payment:", error);
            toast.error("Failed to update payment");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                            <FaHistory /> {t.membership_history_title || "Membership History"}
                        </h2>
                        <p className="text-sm opacity-80">{user.full_name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition">
                        <FaTimesCircle className="text-2xl" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8">{t.loading_history || "Loading history..."}</div>
                    ) : (
                        <div className="space-y-3">
                            {years.map(year => {
                                const record = history.find(h => h.year === year);
                                const isPaid = !!record;

                                return (
                                    <div key={year} className={`flex items-center justify-between p-4 rounded-xl border-2 transition ${isPaid ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isPaid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <FaCalendarAlt />
                                            </div>
                                            <div>
                                                <div className="font-bold dark:text-white">{year}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{t.annual_fee || "Annual Fee"}: 50 {t.currency_mad || "DH"}</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => togglePayment(year, record)}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${isPaid ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                        >
                                            {isPaid ? (t.remove_payment || 'Remove') : (t.mark_paid || 'Mark Paid')}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MembershipHistoryModal;
