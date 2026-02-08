import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCheck, FaTimes, FaSearch, FaFileInvoiceDollar } from 'react-icons/fa';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';

const DonationsList = ({ t }) => {
    const { fetchAllDonations, updateDonationStatus } = useData();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadDonations = async () => {
        setLoading(true);
        const data = await fetchAllDonations();
        setDonations(data);
        setLoading(false);
    };

    useEffect(() => {
        loadDonations();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(t.confirm_action || "Are you sure?")) return;

        const toastId = toast.loading(t.processing || "Processing...");
        const success = await updateDonationStatus(id, status);

        if (success) {
            toast.success(t.updated_successfully || "Updated successfully", { id: toastId });
            loadDonations();
        } else {
            toast.error(t.error_updating || "Error updating", { id: toastId });
        }
    };

    const filteredDonations = donations.filter(d =>
        (d.donor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAmount = donations
        .filter(d => d.status === 'verified')
        .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

    return (
        <div className="animate-fade-in">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h2 className="text-xl font-bold capitalize text-gray-800 dark:text-white flex items-center gap-2">
                        <FaMoneyBillWave className="text-green-500" />
                        {t.donations || "Donations"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t.manage_donations_subtitle || "Track and verify incoming donations."}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="block text-xs text-gray-500 uppercase font-bold tracking-wider">{t.total_verified || "Total Verified"}</span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{totalAmount.toLocaleString()} MAD</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder={t.search_donations_placeholder || "Search donor name or email..."}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-green-500 dark:text-white shadow-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">{t.loading || "Loading..."}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                <tr>
                                    <th className="p-4">{t.donor_name || "Donor Name"}</th>
                                    <th className="p-4">{t.amount || "Amount"}</th>
                                    <th className="p-4">{t.method || "Method"}</th>
                                    <th className="p-4">{t.date || "Date"}</th>
                                    <th className="p-4">{t.status || "Status"}</th>
                                    <th className="p-4 text-right">{t.actions || "Actions"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredDonations.length > 0 ? filteredDonations.map((donation) => (
                                    <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800 dark:text-white">{donation.donor_name || "Anonymous"}</div>
                                            <div className="text-xs text-gray-500">{donation.email}</div>
                                        </td>
                                        <td className="p-4 font-bold text-green-600 dark:text-green-400">
                                            {parseFloat(donation.amount).toLocaleString()} MAD
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wide
                                                ${donation.method === 'paypal' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                    donation.method === 'stripe' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' :
                                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                {donation.method}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(donation.created_at).toLocaleDateString()}
                                            <span className="block text-xs opacity-70">{new Date(donation.created_at).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit
                                                ${donation.status === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    donation.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                {donation.status === 'verified' && <FaCheck size={10} />}
                                                {donation.status === 'rejected' && <FaTimes size={10} />}
                                                {donation.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {donation.status !== 'verified' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(donation.id, 'verified')}
                                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                        title="Verify"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                )}
                                                {donation.status !== 'rejected' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(donation.id, 'rejected')}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Reject"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                )}
                                                <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="View Details (Mock)">
                                                    <FaFileInvoiceDollar />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            {t.no_donations_found || "No donations found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonationsList;
