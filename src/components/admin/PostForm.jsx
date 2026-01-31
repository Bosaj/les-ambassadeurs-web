import React from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const PostForm = ({
    type,
    formData,
    setFormData,
    handleFormSubmit,
    activeLang,
    setActiveLang,
    t,
    onCancel,
    editingId
}) => {

    // Helper to upload image (copied logic)
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const toastId = toast.loading(t.uploading_image || "Uploading...");
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${type}/${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            setFormData({ ...formData, image: publicUrl });
            toast.success(t.image_uploaded || "Image uploaded!", { id: toastId });
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(t.upload_failed || "Upload failed", { id: toastId });
        }
    };

    return (
        <form onSubmit={(e) => handleFormSubmit(e, type)} className="space-y-4">

            {/* Language Tabs */}
            <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
                {['en', 'fr', 'ar'].map(lang => (
                    <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveLang(lang)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeLang === lang
                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        {lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'العربية'}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.title_label} ({activeLang.toUpperCase()})
                    </label>
                    <input
                        type="text"
                        required
                        className="border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white transition-all"
                        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                        value={formData.title[activeLang] || ''}
                        onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}
                        placeholder={`${t.title_label} in ${activeLang}`}
                    />
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.date_label}</label>
                    <input
                        type="date"
                        required={type !== 'projects'} // Projects might not strictly need a date? assuming yes for now based on previous code.
                        className="border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white transition-all"
                        value={formData.date || ''}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.image_label}</label>
                <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center">
                    <div className="w-full sm:w-auto">
                        <label className="cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-gray-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors inline-block text-center w-full sm:w-auto border border-blue-200 dark:border-gray-600">
                            Choose File
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>

                    <div className="flex-1 w-full">
                        <input
                            type="url"
                            placeholder={t.or_paste_url || "Or paste image URL"}
                            className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white text-sm"
                            value={formData.image || ''}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                        />
                    </div>
                    {formData.image && (
                        <div className="relative group shrink-0">
                            <img src={formData.image} alt="Preview" className="h-12 w-16 object-cover rounded-md border border-gray-300 dark:border-gray-600" />
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.description_label} ({activeLang.toUpperCase()})
                </label>
                <textarea
                    required
                    rows="6"
                    className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white transition-all resize-y"
                    dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                    value={formData.description[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, description: { ...formData.description, [activeLang]: e.target.value } })}
                    placeholder={`${t.description_label} in ${activeLang}`}
                ></textarea>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                    {t.cancel_btn}
                </button>
                <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-8 py-2.5 rounded-lg hover:from-blue-800 hover:to-blue-950 transition-all font-bold shadow-md hover:shadow-lg"
                >
                    {editingId ? t.update_btn : t.add_btn}
                </button>
            </div>
        </form>
    );
};

export default PostForm;