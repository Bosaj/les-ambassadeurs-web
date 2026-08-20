import React, { useState, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import {
    FaPlus, FaEdit, FaTrash, FaTimes, FaImages, FaStar, FaSearch,
    FaUpload, FaLink
} from 'react-icons/fa';

const RELATED_TYPES = ['general', 'event', 'project', 'program'];

const EMPTY_FORM = {
    image_url: '',
    caption: { en: '', fr: '', ar: '' },
    related_type: 'general',
    related_item_id: '',
    is_featured: false,
};

const GalleryManagement = () => {
    const { t, language } = useLanguage();
    const { galleryImages, fetchGalleryImages, addGalleryImage, updateGalleryImage, deleteGalleryImage,
        events, programs, projects } = useData();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [activeLang, setActiveLang] = useState('en');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [uploading, setUploading] = useState(false);
    const [imageInputMode, setImageInputMode] = useState('url'); // 'url' | 'upload'

    useEffect(() => {
        const load = async () => {
            setFetching(true);
            await fetchGalleryImages();
            setFetching(false);
        };
        load();
    }, [fetchGalleryImages]);

    const getCaption = (img) => {
        if (!img.caption) return '';
        if (typeof img.caption === 'string') return img.caption;
        return img.caption[language] || img.caption.en || img.caption.fr || img.caption.ar || '';
    };

    // Related items list depending on selected type
    const getRelatedItems = () => {
        if (formData.related_type === 'event') return events || [];
        if (formData.related_type === 'project') return projects || [];
        if (formData.related_type === 'program') return programs || [];
        return [];
    };

    const getItemTitle = (item) => {
        if (!item?.title) return '';
        if (typeof item.title === 'string') return item.title;
        return item.title[language] || item.title.en || '';
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) { toast.error('Image too large (max 5MB)'); return; }

        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const fileName = `gallery/${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from('images').upload(fileName, file, { upsert: true });
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
            setFormData(prev => ({ ...prev, image_url: publicUrl }));
            toast.success(t.image_uploaded || 'Image uploaded!');
        } catch (err) {
            console.error('Upload error:', err);
            toast.error(t.upload_failed || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image_url) { toast.error('Please provide an image URL or upload an image'); return; }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                related_item_id: formData.related_item_id || null,
            };
            if (editingId) {
                await updateGalleryImage(editingId, payload);
                toast.success(t.item_updated_success || 'Image updated!');
            } else {
                await addGalleryImage(payload);
                toast.success(t.item_added_success || 'Image added!');
            }
            handleClose();
        } catch (err) {
            console.error(err);
            toast.error(t.error_saving || 'Error saving image');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (img) => {
        setEditingId(img.id);
        setFormData({
            image_url: img.image_url || '',
            caption: img.caption || { en: '', fr: '', ar: '' },
            related_type: img.related_type || 'general',
            related_item_id: img.related_item_id || '',
            is_featured: img.is_featured || false,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t.confirm_delete_message || 'Delete this image?')) return;
        try {
            await deleteGalleryImage(id);
            toast.success(t.item_deleted || 'Image deleted');
        } catch {
            toast.error(t.error_deleting || 'Error deleting');
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setActiveLang('en');
    };

    const filtered = galleryImages.filter(img => {
        const matchesFilter = activeFilter === 'all' || img.related_type === activeFilter;
        const caption = getCaption(img).toLowerCase();
        const matchesSearch = !searchTerm || caption.includes(searchTerm.toLowerCase()) || img.image_url.includes(searchTerm);
        return matchesFilter && matchesSearch;
    });

    const typeColors = {
        event: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        project: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        program: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        general: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    };

    const typeLabels = {
        all: t.gallery_filter_all || 'All',
        event: t.gallery_filter_events || 'Events',
        project: t.gallery_filter_projects || 'Projects',
        program: t.gallery_filter_programs || 'Programs',
        general: t.gallery_filter_general || 'General',
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FaImages className="text-blue-600" /> {t.manage_gallery || 'Manage Gallery'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {galleryImages.length} {t.gallery_filter_all || 'images'}
                    </p>
                </div>
                <button
                    onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData(EMPTY_FORM); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium text-sm"
                >
                    <FaPlus size={12} /> {t.add_image || 'Add Image'}
                </button>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="relative flex-1 max-w-xs">
                    <FaSearch className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder={t.search_placeholder || 'Search...'}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full ps-9 pe-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['all', 'event', 'project', 'program', 'general'].map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                                activeFilter === f
                                    ? 'bg-blue-900 text-white border-blue-900'
                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                            }`}
                        >
                            {typeLabels[f]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Image Grid */}
            {fetching ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    <FaImages className="text-5xl mx-auto mb-3 opacity-30" />
                    <p>{t.no_gallery_images || 'No images yet'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filtered.map(img => (
                        <div key={img.id} className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-gray-100 dark:bg-gray-700">
                            <img
                                src={img.image_url}
                                alt={getCaption(img) || 'Gallery'}
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                                onError={e => { e.target.src = 'https://via.placeholder.com/200x160?text=Image'; }}
                            />
                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => handleEdit(img)}
                                    className="bg-white text-blue-600 w-9 h-9 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition shadow-lg"
                                    title={t.edit_btn || 'Edit'}
                                >
                                    <FaEdit size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(img.id)}
                                    className="bg-white text-red-600 w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition shadow-lg"
                                    title={t.delete || 'Delete'}
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                            {/* Badges */}
                            <div className="absolute top-2 start-2 flex flex-col gap-1">
                                {img.is_featured && (
                                    <span className="bg-yellow-400 text-yellow-900 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                        <FaStar size={8} /> {t.featured_image || 'Featured'}
                                    </span>
                                )}
                                {img.related_type && (
                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${typeColors[img.related_type]}`}>
                                        {typeLabels[img.related_type]}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FaImages className="text-blue-600" />
                                {editingId ? (t.edit_image || 'Edit Image') : (t.add_image || 'Add Image')}
                            </h3>
                            <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            {/* Image input mode toggle */}
                            <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setImageInputMode('url')}
                                    className={`flex-1 py-1.5 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 transition ${imageInputMode === 'url' ? 'bg-white dark:bg-gray-600 shadow text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    <FaLink size={12} /> URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageInputMode('upload')}
                                    className={`flex-1 py-1.5 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 transition ${imageInputMode === 'upload' ? 'bg-white dark:bg-gray-600 shadow text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    <FaUpload size={12} /> {t.uploading_image || 'Upload'}
                                </button>
                            </div>

                            {/* Image URL or Upload */}
                            {imageInputMode === 'url' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t.image_url_label || 'Image URL'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                        placeholder="https://..."
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t.image_label || 'Image'} <span className="text-red-500">*</span>
                                    </label>
                                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-400 transition bg-gray-50 dark:bg-gray-700">
                                        {uploading ? (
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm">{t.uploading_image || 'Uploading...'}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <FaUpload className="text-2xl text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files[0])} />
                                    </label>
                                </div>
                            )}

                            {/* Image Preview */}
                            {formData.image_url && (
                                <div className="rounded-xl overflow-hidden border dark:border-gray-600 h-40">
                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover"
                                        onError={e => { e.target.src = 'https://via.placeholder.com/400x160?text=Preview'; }} />
                                </div>
                            )}

                            {/* Caption (multilingual) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t.image_caption || 'Caption'}
                                </label>
                                <div className="flex gap-1 mb-2">
                                    {['en', 'fr', 'ar'].map(lang => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => setActiveLang(lang)}
                                            className={`px-3 py-1 rounded text-xs font-medium transition ${activeLang === lang ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                        >
                                            {lang.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={formData.caption[activeLang] || ''}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        caption: { ...prev.caption, [activeLang]: e.target.value }
                                    }))}
                                    dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                    rows={2}
                                    placeholder={`Caption in ${activeLang.toUpperCase()}...`}
                                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Related Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t.related_to || 'Related to'}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {RELATED_TYPES.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, related_type: type, related_item_id: '' }))}
                                            className={`py-2 rounded-lg text-xs font-medium border transition ${formData.related_type === type ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'}`}
                                        >
                                            {typeLabels[type]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Related Item dropdown */}
                            {formData.related_type !== 'general' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t.select_related_item || 'Select related item (optional)'}
                                    </label>
                                    <select
                                        value={formData.related_item_id || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, related_item_id: e.target.value }))}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">— {t.donation_no_specific || 'None'} —</option>
                                        {getRelatedItems().map(item => (
                                            <option key={item.id} value={item.id}>{getItemTitle(item)}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Featured toggle */}
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={e => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${formData.is_featured ? 'bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${formData.is_featured ? 'translate-x-4' : ''}`} />
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <FaStar className={formData.is_featured ? 'text-yellow-400' : 'text-gray-400'} />
                                    {t.featured_image || 'Featured Image'}
                                </span>
                            </label>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition"
                                >
                                    {t.cancel || 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || uploading}
                                    className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2"
                                >
                                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    {loading ? (t.processing || 'Saving...') : (t.save_btn || 'Save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryManagement;
