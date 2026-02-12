import React from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmationModal from '../ConfirmationModal';
import { FaUserShield, FaCheckCircle, FaClock, FaCheck, FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MembershipRequests = () => {
    const { users, verifyMember } = useData();
    const { t, language } = useLanguage();
    const [confirmModal, setConfirmModal] = React.useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        isDangerous: false
    });

    const pendingMembers = users ? users.filter(u => u.membership_status === 'pending') : [];

    const handleVerify = async (id, action) => {
        setConfirmModal({
            isOpen: true,
            title: action === 'approve' ? (t.approve_member || "Approve Member") : (t.reject_member || "Reject Member"),
            message: t.confirm_action || "Are you sure you want to proceed with this action?",
            isDangerous: action === 'reject',
            onConfirm: async () => {
                const toastId = toast.loading("Processing...");
                const result = await verifyMember(id, action);
                if (result.success) {
                    toast.success("Updated successfully", { id: toastId });
                } else {
                    toast.error("Failed to update", { id: toastId });
                }
            }
        });
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                <FaUserShield /> {t.membership_requests || "Membership Requests"}
            </h2>

            {pendingMembers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center text-gray-500">
                    <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3 opacity-50" />
                    <p>{t.no_pending_requests || "No pending membership requests."}</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="p-4">{t.table_header_name || "Name"}</th>
                                <th className="p-4">{t.email || "Email"}</th>
                                <th className="p-4">{t.status || "Status"}</th>
                                <th className="p-4">{t.documents || "Documents"}</th>
                                <th className="p-4 text-right">{t.actions || "Actions"}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {pendingMembers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="p-4 font-bold dark:text-white">{(language === 'ar' && user.full_name_ar) ? user.full_name_ar : user.full_name}</td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                                    <td className="p-4">
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                                            <FaClock size={10} /> Pending
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className="flex flex-col gap-1 text-gray-600 dark:text-gray-300">
                                            <span className="flex items-center gap-1 text-green-600">
                                                <FaCheckCircle size={12} /> Internal Law
                                            </span>
                                            <span className="flex items-center gap-1 text-green-600">
                                                <FaCheckCircle size={12} /> Commitment
                                            </span>
                                            <span className="flex items-center gap-1 text-yellow-600">
                                                <FaMoneyBillWave size={12} /> Payment: Unpaid
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleVerify(user.id, 'approve')}
                                                className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg transition text-sm flex items-center gap-1"
                                                title="Approve & Verify Payment"
                                            >
                                                <FaCheck /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleVerify(user.id, 'reject')}
                                                className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg transition text-sm flex items-center gap-1"
                                                title="Reject"
                                            >
                                                <FaTimes /> Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={confirmModal.isDangerous}
            />
        </div>
    );
};

export default MembershipRequests;
