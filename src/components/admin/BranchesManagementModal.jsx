import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FaTimes, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BranchesManagementModal = ({ isOpen, onClose, t, onUpdate }) => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBranch, setEditingBranch] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        google_map_link: '',
        lat: '',
        lng: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchBranches();
        }
    }, [isOpen]);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('branches')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBranches(data || []);
        } catch (error) {
            console.error('Error fetching branches:', error);
            toast.error(t.error_loading_data || "Error loading branches");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setFormData({
            name: branch.name,
            city: branch.city,
            address: branch.address || '',
            phone: branch.phone || '',
            email: branch.email || '',
            google_map_link: branch.google_map_link || '',
            lat: branch.lat,
            lng: branch.lng
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t.confirm_delete || "Are you sure?")) return;

        try {
            const { error } = await supabase
                .from('branches')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success(t.item_deleted || "Branch deleted");
            fetchBranches();
            onUpdate && onUpdate();
        } catch (error) {
            console.error('Error deleting branch:', error);
            toast.error(t.error_deleting || "Error deleting branch");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const branchData = {
                ...formData,
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng)
            };

            let error;
            if (editingBranch) {
                const { error: updateError } = await supabase
                    .from('branches')
                    .update(branchData)
                    .eq('id', editingBranch.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('branches')
                    .insert([branchData]);
                error = insertError;
            }

            if (error) throw error;

            toast.success(editingBranch ? (t.item_updated || "Branch updated") : (t.item_added || "Branch added"));
            setEditingBranch(null);
            setFormData({
                name: '',
                city: '',
                address: '',
                phone: '',
                email: '',
                google_map_link: '',
                lat: '',
                lng: ''
            });
            fetchBranches();
            onUpdate && onUpdate();
        } catch (error) {
            console.error('Error saving branch:', error);
            toast.error(t.error_saving || "Error saving branch");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold dark:text-white">{t.manage_branches || "Manage Branches"}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-auto p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Form Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 dark:text-white">
                                {editingBranch ? (t.edit_branch || "Edit Branch") : (t.add_new_branch || "Add New Branch")}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.branch_name || "Name"}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.city || "City"}</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.phone || "Phone"}</label>
                                        <input
                                            type="tel"
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.address || "Address"}</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.email || "Email"}</label>
                                    <input
                                        type="email"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.google_map_link || "Google Map Link"}</label>
                                    <input
                                        type="url"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.google_map_link}
                                        onChange={e => setFormData({ ...formData, google_map_link: e.target.value })}
                                        placeholder="https://goo.gl/maps/..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.latitude || "Latitude"}</label>
                                        <input
                                            type="number"
                                            step="any"
                                            required
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.lat}
                                            onChange={e => setFormData({ ...formData, lat: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.longitude || "Longitude"}</label>
                                        <input
                                            type="number"
                                            step="any"
                                            required
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.lng}
                                            onChange={e => setFormData({ ...formData, lng: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                                    >
                                        {editingBranch ? (t.update_btn || "Update") : (t.add_btn || "Add")}
                                    </button>
                                    {editingBranch && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingBranch(null);
                                                setFormData({
                                                    name: '',
                                                    city: '',
                                                    address: '',
                                                    phone: '',
                                                    email: '',
                                                    google_map_link: '',
                                                    lat: '',
                                                    lng: ''
                                                });
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                                        >
                                            {t.cancel_btn || "Cancel"}
                                        </button>
                                    )}
                                </div>
                            </form>

                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-200">
                                <p className="font-semibold">{t.coordinates_help || "How to get coordinates:"}</p>
                                <ol className="list-decimal list-inside mt-1 space-y-1">
                                    <li>{t.coordinates_step1 || "Go to Google Maps"}</li>
                                    <li>{t.coordinates_step2 || "Right-click on the desired location"}</li>
                                    <li>{t.coordinates_step3 || "Click on the coordinates to copy them"}</li>
                                    <li>{t.coordinates_step4 || "Paste latitude and longitude above"}</li>
                                </ol>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className="overflow-y-auto max-h-[600px] border rounded dark:border-gray-600">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                                    <tr>
                                        <th className="p-3 dark:text-white">{t.branch_name || "Name"}</th>
                                        <th className="p-3 dark:text-white">{t.city || "City"}</th>
                                        <th className="p-3 dark:text-white text-right">{t.actions || "Actions"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="3" className="p-4 text-center dark:text-gray-300">{t.loading || "Loading..."}</td>
                                        </tr>
                                    ) : branches.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="p-4 text-center dark:text-gray-300">{t.no_items_found || "No branches found"}</td>
                                        </tr>
                                    ) : (
                                        branches.map(branch => (
                                            <tr key={branch.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="p-3 dark:text-gray-300">{branch.name}</td>
                                                <td className="p-3 dark:text-gray-300">{branch.city}</td>
                                                <td className="p-3 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(branch)}
                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                        title={t.edit || "Edit"}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(branch.id)}
                                                        className="text-red-600 hover:text-red-800 p-1"
                                                        title={t.delete || "Delete"}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchesManagementModal;
