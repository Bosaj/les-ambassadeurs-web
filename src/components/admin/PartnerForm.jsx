import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { FaUpload, FaTimes } from 'react-icons/fa';

const PartnerForm = ({ formData, setFormData, onCancel, t, handleFormSubmit }) => {
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Image Upload (Immediate)
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const toastId = toast.loading(t.uploading_image || "Uploading...");
        setLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `partners/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            setFormData({ ...formData, image_url: publicUrl });
            toast.success(t.image_uploaded || "Image uploaded!", { id: toastId });
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(t.upload_failed || "Upload failed", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        handleFormSubmit(e);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.partner_name || "Partner Name"}
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                    placeholder={t.partner_name}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.partner_website || "Website URL"}
                </label>
                <input
                    type="url"
                    name="website_url"
                    value={formData.website_url || ''}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.upload_logo || "Logo"}
                </label>
                <div className="flex items-center gap-4">
                    {formData.image_url && (
                        <div className="relative w-24 h-24 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                            <img src={formData.image_url} alt="Preview" className="max-w-full max-h-full object-contain" />
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, image_url: '' })}
                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl hover:bg-red-600 transition"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                    )}
                    <label className={`cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'} bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition border dark:border-gray-600`}>
                        <FaUpload className="text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{loading ? (t.processing || "Uploading...") : (t.upload_logo || "Upload Logo")}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} className="hidden" />
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
                >
                    {t.cancel_btn || "Cancel"}
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {formData.id ? (t.update_btn || "Update") : (t.save_btn || "Save")}
                </button>
            </div>
        </form>
    );
};

export default PartnerForm;
