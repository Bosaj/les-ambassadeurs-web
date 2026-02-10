import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { FaUpload, FaTimes } from 'react-icons/fa';

const PartnerForm = ({ onSubmit, initialData = {}, onCancel, t }) => {
    const [formData, setFormData] = useState({
        name: '',
        website_url: '',
        image_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                website_url: initialData.website_url || '',
                image_url: initialData.image_url || ''
            });
            if (initialData.image_url) {
                setImagePreview(initialData.image_url);
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.image_url;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `partners/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                imageUrl = data.publicUrl;
            }

            const partnerData = {
                ...formData,
                image_url: imageUrl
            };

            await onSubmit(partnerData);
        } catch (error) {
            console.error("Error saving partner:", error);
            toast.error(t.error_occurred || "Error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.partner_name}
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.partner_website}
                </label>
                <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.logo}
                </label>
                <div className="flex items-center gap-4">
                    {imagePreview && (
                        <div className="relative w-24 h-24 border rounded overflow-hidden">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                            <button
                                type="button"
                                onClick={() => { setImageFile(null); setImagePreview(null); setFormData({ ...formData, image_url: '' }) }}
                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                    )}
                    <label className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 transition">
                        <FaUpload className="text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.upload_logo}</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
                >
                    {t.cancel || "Cancel"}
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (t.processing || "Processing...") : (initialData ? (t.update_btn || "Update") : (t.save_btn || "Save"))}
                </button>
            </div>
        </form>
    );
};

export default PartnerForm;
