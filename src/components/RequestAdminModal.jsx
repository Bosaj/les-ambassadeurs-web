import React, { useState } from 'react';
import { FaUserShield, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const RequestAdminModal = ({ isOpen, onClose, onSubmit }) => {
    const { t } = useLanguage();
    const [selectedRole, setSelectedRole] = useState('Volunteer'); // Default or empty

    const roles = [
        { id: 'Financial', label: t.role_financial },
        { id: 'Designer', label: t.role_designer },
        { id: 'Content Manager', label: t.role_content },
        { id: 'Event Coordinator', label: t.role_event },
        { id: 'Marketing', label: t.role_marketing },
        { id: 'Developer', label: t.role_developer },
        { id: 'Other', label: t.role_other },
    ];

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(selectedRole);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaUserShield className="text-blue-600" />
                        {t.request_admin_role}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t.select_preferred_role}
                        </label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full p-3 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {t.cancel || "Cancel"}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-md"
                        >
                            {t.submit_request}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestAdminModal;
