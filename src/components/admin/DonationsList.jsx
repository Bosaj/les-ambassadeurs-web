import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCheck, FaTimes, FaSearch, FaFileInvoiceDollar, FaUser, FaEnvelope, FaCalendarAlt, FaCreditCard, FaTrash } from 'react-icons/fa';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';
import Modal from '../Modal';

const DonationsList = ({ t }) => {
    const { fetchAllDonations, updateDonationStatus, deleteDonation } = useData();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDonation, setSelectedDonation] = useState(null);

    const loadDonations = async () => {
        setLoading(true);
        const data = await fetchAllDonations();
        setDonations(data);
        setLoading(false);
    };

    useEffect(() => {
        loadDonations();
    }, []);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, id: null });

    const openConfirmModal = (id, type) => {
        setConfirmModal({ isOpen: true, type, id });
    };

    const closeConfirmModal = () => {
        setConfirmModal({ isOpen: false, type: null, id: null });
    };

    const handleConfirmAction = async () => {
        const { id, type } = confirmModal;
        if (!id || !type) return;

        const toastId = toast.loading(t.processing || "Processing...");

        if (type === 'delete') {
            const success = await deleteDonation(id);
            if (success) {
                toast.success(t.deleted_successfully || "Deleted successfully", { id: toastId });
                setDonations(prev => prev.filter(d => d.id !== id));
                if (selectedDonation && selectedDonation.id === id) {
                    setSelectedDonation(null);
                }
            } else {
                toast.error(t.error_deleting || "Error deleting", { id: toastId });
            }
        } else {
            const success = await updateDonationStatus(id, type);

            if (success) {
                toast.success(t.updated_successfully || "Updated successfully", { id: toastId });
                // Update local state to reflect change immediately without reload if possible, 
                // but loadDonations() is safer ensuring DB sync.
                // We can also optimistically update the list:
                setDonations(prev => prev.map(d => d.id === id ? { ...d, status: type } : d));

                if (selectedDonation && selectedDonation.id === id) {
                    setSelectedDonation(prev => ({ ...prev, status: type }));
                }
            } else {
                toast.error(t.error_updating || "Error updating", { id: toastId });
                loadDonations(); // Revert on error
            }
        }
        closeConfirmModal();
    };

    const getStatusLabel = (status) => {
        const key = `status_${status}`;
        return t[key] || status;
    };

    const getMethodLabel = (method) => {
        // Map 'online' to 'stripe' if needed or just use the method key
        const key = `method_${method === 'online' ? 'stripe' : method}`;
        return t[key] || method;
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
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{totalAmount.toLocaleString()} {t.currency_mad || 'DH'}</span>
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
                                            {parseFloat(donation.amount).toLocaleString()} {t.currency_mad || 'DH'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wide
                                                ${donation.method === 'paypal' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                    donation.method === 'stripe' || donation.method === 'online' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' :
                                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                {getMethodLabel(donation.method)}
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
                                                {getStatusLabel(donation.status || 'pending')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {donation.status !== 'verified' && (
                                                    <button
                                                        onClick={() => openConfirmModal(donation.id, 'verified')}
                                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                        title={t.verify || "Verify"}
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                )}
                                                {donation.status !== 'rejected' && (
                                                    <button
                                                        onClick={() => openConfirmModal(donation.id, 'rejected')}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title={t.reject || "Reject"}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => setSelectedDonation(donation)}
                                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title={t.view_details || "View Details"}
                                                >
                                                    <FaFileInvoiceDollar />
                                                </button>
                                                <button
                                                    onClick={() => openConfirmModal(donation.id, 'delete')}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title={t.delete || "Delete"}
                                                >
                                                    <FaTrash />
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
                {/* Donation Details Modal */}
                <Modal
                    isOpen={!!selectedDonation}
                    onClose={() => setSelectedDonation(null)}
                    title={t.donation_details || "Donation Details"}
                >
                    {selectedDonation && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex flex-col items-center justify-center mb-6">
                                    <span className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">{t.amount}</span>
                                    <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                                        {parseFloat(selectedDonation.amount).toLocaleString()} <span className="text-xl text-gray-400">{t.currency_mad || 'DH'}</span>
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm">
                                            <FaUser className="text-blue-500" /> {t.donor_name}
                                        </div>
                                        <div className="font-semibold text-gray-800 dark:text-white pl-6">
                                            {selectedDonation.donor_name || "Anonymous"}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm">
                                            <FaEnvelope className="text-orange-500" /> {t.email}
                                        </div>
                                        <div className="font-semibold text-gray-800 dark:text-white pl-6">
                                            {selectedDonation.email || "N/A"}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm">
                                            <FaCreditCard className="text-purple-500" /> {t.method}
                                        </div>
                                        <div className="font-semibold text-gray-800 dark:text-white pl-6 capitalize">
                                            {getMethodLabel(selectedDonation.method)}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm">
                                            <FaCalendarAlt className="text-pink-500" /> {t.date}
                                        </div>
                                        <div className="font-semibold text-gray-800 dark:text-white pl-6">
                                            {new Date(selectedDonation.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {selectedDonation.proof_url ? (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex justify-between items-center text-sm">
                                        <span className="font-medium text-blue-900 dark:text-blue-300">
                                            {t.proof_method || "Payment Proof Available"}
                                        </span>
                                        <a
                                            href={selectedDonation.proof_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
                                        >
                                            <FaFileInvoiceDollar /> {t.view_proof || "View Proof"}
                                        </a>
                                    </div>
                                ) : selectedDonation.method === 'transfer' && (
                                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
                                        {t.no_proof || "No proof attached"}
                                    </div>
                                )}

                            </div>

                            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <span className="font-medium text-gray-600 dark:text-gray-300">{t.status}</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize flex items-center gap-2
                                ${selectedDonation.status === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        selectedDonation.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    {selectedDonation.status === 'verified' && <FaCheck />}
                                    {selectedDonation.status === 'rejected' && <FaTimes />}
                                    {getStatusLabel(selectedDonation.status || 'pending')}
                                </span>
                            </div>

                            {/* Actions in Modal */}
                            <div className="flex gap-3 justify-end pt-2">
                                {selectedDonation.status !== 'verified' && (
                                    <button
                                        onClick={() => openConfirmModal(selectedDonation.id, 'verified')}
                                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-lg hover:shadow-green-500/30"
                                    >
                                        <FaCheck /> {t.verify}
                                    </button>
                                )}
                                {selectedDonation.status !== 'rejected' && (
                                    <button
                                        onClick={() => openConfirmModal(selectedDonation.id, 'rejected')}
                                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow-lg hover:shadow-red-500/30"
                                    >
                                        <FaTimes /> {t.reject}
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedDonation(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition"
                                >
                                    {t.close || "Close"}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Confirmation Modal */}
                <Modal
                    isOpen={confirmModal.isOpen}
                    onClose={closeConfirmModal}
                    title={
                        confirmModal.type === 'delete' ? (t.confirm_delete_title || "Confirm Deletion") :
                            confirmModal.type === 'verified' ? (t.confirm_verify_title || "Confirm Verification") :
                                (t.confirm_reject_title || "Confirm Rejection")
                    }
                >
                    <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                            {confirmModal.type === 'delete' ? (t.confirm_delete_msg || "Are you sure you want to delete this donation permanently?") :
                                confirmModal.type === 'verified'
                                    ? (t.confirm_verify_msg || "Are you sure you want to verify this donation?")
                                    : (t.confirm_reject_msg || "Are you sure you want to reject this donation?")}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={closeConfirmModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                            >
                                {t.cancel || "Cancel"}
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className={`px-4 py-2 text-white rounded-lg transition shadow-md font-bold
                                ${confirmModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                                        confirmModal.type === 'verified' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                {confirmModal.type === 'delete' ? (t.yes_delete || "Yes, Delete") :
                                    confirmModal.type === 'verified' ? (t.yes_verify || "Yes, Verify") : (t.yes_reject || "Yes, Reject")}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default DonationsList;
