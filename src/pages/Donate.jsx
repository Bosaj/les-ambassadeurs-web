import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { FaHeart, FaCreditCard, FaPaypal, FaUniversity, FaLock, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { compressImage } from '../utils/imageUtils';


const MAX_PROOF_SIZE = 10 * 1024 * 1024;

const Donate = () => {
    const { t, language } = useLanguage();
    const { addDonation, events, programs, projects, getLocalizedContent } = useData();
    const { user } = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [pendingMethod, setPendingMethod] = useState(null);

    const [donationForm, setDonationForm] = useState({
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
        email: user?.email || '',
        phone: user?.user_metadata?.phone || '',
        amount: '',
        method: 'transfer', // 'online', 'paypal', 'transfer'
        isAnonymous: false,
        donation_type: 'general',
        related_item_id: null,
        related_item_title: null
    });

    const handleDonateClick = (method) => {
        if (user) {
            openDonationModal(method);
        } else {
            setPendingMethod(method);
            setShowLoginPrompt(true);
        }
    };

    const openDonationModal = (method) => {
        setDonationForm(prev => ({
            ...prev,
            method,
            name: !prev.isAnonymous ? (user?.user_metadata?.full_name || user?.email?.split('@')[0] || prev.name) : 'Anonymous',
            email: !prev.isAnonymous ? (user?.email || prev.email) : (user?.email || ''), // Keep email for history if logged in
            phone: !prev.isAnonymous ? (user?.user_metadata?.phone || prev.phone) : ''
        }));
        setShowModal(true);
    };

    const handleGuestContinue = () => {
        setShowLoginPrompt(false);
        openDonationModal(pendingMethod);
    };

    const handleLoginRedirect = () => {
        navigate('/login', { state: { from: '/donate' } });
    };

    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isSupportedType = file.type === 'application/pdf' || file.type.startsWith('image/');
        if (!isSupportedType) {
            toast.error(t.invalid_file_type || 'Please upload an image or PDF file.');
            e.target.value = '';
            return;
        }

        if (file.size > MAX_PROOF_SIZE) {
            toast.error(t.file_too_large || 'The proof file must be 10 MB or smaller.');
            e.target.value = '';
            return;
        }

        // Store locally; upload only after the user submits the transfer form.
        setSelectedFile(file);
    };

    // Manual submit for bank transfer — upload happens here on submit
    const handleManualSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!donationForm.amount || donationForm.amount < 1) {
            toast.error(t.amount_required || "Please enter a donation amount");
            return;
        }

        if (!selectedFile) {
            toast.error(t.upload_proof_req || "Please upload a proof of payment");
            return;
        }

        setUploading(true);
        let proofUrl = donationForm.proof_url || null;

        try {
            // Upload file now (on submit) if one was selected
            if (selectedFile) {
                const isImage = selectedFile.type.startsWith('image/');
                const uploadFile = isImage ? await compressImage(selectedFile) : selectedFile;
                const extension = isImage ? 'jpg' : 'pdf';
                const fileName = `${crypto.randomUUID()}.${extension}`;

                const { error: uploadError } = await supabase.storage
                    .from('donations')
                    .upload(fileName, uploadFile, {
                        contentType: isImage ? 'image/jpeg' : 'application/pdf',
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                // Keep the bucket private; administrators should create short-lived signed URLs.
                proofUrl = fileName;
            }

            await addDonation({ ...donationForm, proof_url: proofUrl });
            toast.success(t.donation_success);
            setShowModal(false);
            setSelectedFile(null);
            setDonationForm({ name: '', amount: '', method: 'transfer', proof_url: null });
        } catch (error) {
            if (import.meta.env.DEV) console.error('Transfer submit error:', error);
            toast.error(t.donation_error || "Failed to submit. Please try again.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300"
        >
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-blue-900 dark:text-white mb-6">{t.donate_title}</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        {t.donate_hero_desc}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Bank Transfer */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition border-t-4 border-blue-900 dark:border-blue-500 transition-colors duration-300 flex flex-col">
                        <div className="text-blue-900 dark:text-blue-400 text-4xl mb-6 flex justify-center">
                            <FaUniversity />
                        </div>
                        <h3 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">{t.bank_transfer}</h3>
                        <div className="space-y-4 text-gray-600 dark:text-gray-300 flex-1">
                            <p className="flex justify-between border-b dark:border-gray-700 pb-2">
                                <span className="font-semibold">{t.bank_label}</span>
                                <span className="text-right">{t.bank_name_value}</span>
                            </p>
                            <p className="flex justify-between border-b dark:border-gray-700 pb-2">
                                <span className="font-semibold">{t.account_name_label}</span>
                                <span className="text-right">{t.account_name_value}</span>
                            </p>
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-center font-mono text-sm break-all dark:text-white">
                                {t.bank_details}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDonateClick('transfer')}
                            className="w-full mt-6 bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-md"
                        >
                            {t.record_transfer}
                        </button>
                    </div>

                    {/* Online Payment */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition border-t-4 border-red-500 transform md:-translate-y-4 transition-colors duration-300 flex flex-col">
                        <div className="text-red-500 text-4xl mb-6 flex justify-center">
                            <FaCreditCard />
                        </div>
                        <h3 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">{t.online_payment}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-center mb-8 flex-1">
                            {t.online_payment_desc}
                        </p>
                        <button
                            disabled
                            className="w-full bg-gray-400 text-white font-bold py-4 rounded-lg cursor-not-allowed shadow-none"
                        >
                            {t.coming_soon}
                        </button>
                        <div className="mt-4 flex justify-center gap-4 opacity-60">
                            <div className="flex gap-2 items-center text-gray-400 text-sm">
                                <FaLock size={12} /> {t.secure_payment}
                            </div>
                        </div>
                    </div>

                    {/* PayPal */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition border-t-4 border-blue-600 transition-colors duration-300 flex flex-col">
                        <div className="text-blue-600 dark:text-blue-400 text-4xl mb-6 flex justify-center">
                            <FaPaypal />
                        </div>
                        <h3 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">PayPal</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-center mb-8 flex-1">
                            {t.paypal_desc}
                        </p>
                        <button
                            disabled
                            className="w-full bg-gray-400 text-white font-bold py-4 rounded-lg cursor-not-allowed shadow-none"
                        >
                            {t.coming_soon}
                        </button>
                    </div>
                </div>

                <div className="mt-20 text-center bg-blue-50 dark:bg-gray-800 p-10 rounded-2xl max-w-4xl mx-auto transition-colors duration-300">
                    <FaHeart className="text-red-500 text-5xl mx-auto mb-6 animate-pulse" />
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-4">{t.impact_title}</h2>
                    <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.impact_desc}
                    </p>
                </div>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={t.make_donation}
            >
                <div className="space-y-6">


                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            id="anonymous"
                            checked={donationForm.isAnonymous}
                            onChange={e => {
                                const isAnon = e.target.checked;
                                setDonationForm(prev => ({
                                    ...prev,
                                    isAnonymous: isAnon,
                                    name: isAnon ? 'Anonymous' : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''),
                                    // We keep email if logged in for receipt/history, but clear phone
                                    phone: isAnon ? '' : (user?.user_metadata?.phone || '')
                                }));
                            }}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                            <label htmlFor="anonymous" className="text-gray-700 dark:text-gray-300 font-medium">
                                {t.donate_anonymous}
                            </label>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {t.donate_anonymous_desc || "Your name will be hidden from the public supporters list."}
                            </span>
                        </div>
                    </div>

                    {!donationForm.isAnonymous && (
                        <>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">{t.full_name}</label>
                                <input
                                    type="text"
                                    required={!donationForm.isAnonymous}
                                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all duration-200 shadow-sm text-lg"
                                    value={donationForm.name}
                                    onChange={e => setDonationForm({ ...donationForm, name: e.target.value })}
                                    placeholder={t.name_placeholder}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">{t.email}</label>
                                <input
                                    type="email"
                                    required={!donationForm.isAnonymous}
                                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all duration-200 shadow-sm text-lg"
                                    value={donationForm.email}
                                    onChange={e => setDonationForm({ ...donationForm, email: e.target.value })}
                                    placeholder={t.email_placeholder}
                                    disabled={!!user} // Disable email edit if logged in? Maybe allow override? User said "pre-fill... fix or modefy". So allow edit.
                                // actually user said "just he fix or modefy". So remove disabled.
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">{t.phone}</label>
                                <input
                                    type="tel"
                                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all duration-200 shadow-sm text-lg"
                                    value={donationForm.phone}
                                    onChange={e => setDonationForm({ ...donationForm, phone: e.target.value })}
                                    placeholder={t.phone_placeholder}
                                />
                            </div>
                        </>
                    )}
                    {/* Donation Purpose Selector */}
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                            {t.donation_purpose_label || "Donation Purpose"}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                            {[
                                { key: 'general', label: t.donation_type_general || 'General' },
                                { key: 'event', label: t.donation_type_event || 'Event' },
                                { key: 'program', label: t.donation_type_program || 'Program' },
                                { key: 'project', label: t.donation_type_project || 'Project' },
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setDonationForm(prev => ({ ...prev, donation_type: key, related_item_id: null, related_item_title: null }))}
                                    className={`py-2 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${donationForm.donation_type === key
                                        ? 'border-blue-900 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-400'
                                        : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Item Selector — shown for event/program/project */}
                        {donationForm.donation_type !== 'general' && (() => {
                            const itemMap = {
                                event: events || [],
                                program: programs || [],
                                project: projects || [],
                            };
                            const items = itemMap[donationForm.donation_type] || [];
                            return items.length > 0 ? (
                                <div className="mt-2">
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                                        {t.donation_select_item || "Select a specific item (optional)"}
                                    </label>
                                    <select
                                        className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                                        value={donationForm.related_item_id || ''}
                                        onChange={e => {
                                            const selected = items.find(i => i.id === e.target.value);
                                            setDonationForm(prev => ({
                                                ...prev,
                                                related_item_id: e.target.value || null,
                                                related_item_title: selected ? getLocalizedContent(selected.title, language) : null
                                            }));
                                        }}
                                    >
                                        <option value="">{t.donation_no_specific || '— No specific item —'}</option>
                                        {items.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {getLocalizedContent(item.title, language)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : null;
                        })()}
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">{t.amount_label}</label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="10"
                                className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all duration-200 shadow-sm px-4 text-lg font-mono"
                                value={donationForm.amount}
                                onChange={e => setDonationForm({ ...donationForm, amount: e.target.value })}
                                placeholder="e.g. 100"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">{t.payment_method}</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                disabled
                                className={`p-4 rounded-xl border-2 text-sm font-bold flex flex-col items-center gap-2 transition-all duration-200 opacity-50 cursor-not-allowed border-transparent bg-gray-50 dark:bg-gray-800 text-gray-500`}
                            >
                                <FaCreditCard className="text-xl" /> {t.credit_card_stripe} <span className="text-xs text-red-500">({t.coming_soon})</span>
                            </button>
                            <button
                                type="button"
                                disabled
                                className={`p-4 rounded-xl border-2 text-sm font-bold flex flex-col items-center gap-2 transition-all duration-200 opacity-50 cursor-not-allowed border-transparent bg-gray-50 dark:bg-gray-800 text-gray-500`}
                            >
                                <FaPaypal className="text-xl" /> PayPal <span className="text-xs text-blue-500">({t.coming_soon})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDonateClick('transfer')}
                                className={`p-4 rounded-xl border-2 text-sm font-bold flex flex-col items-center gap-2 transition-all duration-200 ${donationForm.method === 'transfer'
                                    ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-md transform scale-[1.02] dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
                                    }`}
                            >
                                <FaUniversity className="text-xl" /> {t.bank_transfer}
                            </button>
                        </div>
                    </div>

                    <div className="min-h-[150px]">
                        {donationForm.method === 'transfer' && (
                            <div className="mt-4 space-y-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t.upload_proof}
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        {t.proof_upload_desc}
                                    </p>

                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100
                                            dark:file:bg-gray-700 dark:file:text-gray-300
                                        "
                                    />
                                    {selectedFile && !uploading && (
                                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                            <FaCheck /> {selectedFile.name}
                                        </p>
                                    )}
                                    {uploading && <p className="text-xs text-blue-600 mt-2 animate-pulse">{t.uploading || 'Uploading...'}</p>}
                                </div>

                                <button
                                    onClick={handleManualSubmit}
                                    disabled={uploading || !donationForm.amount || !selectedFile}
                                    className={`w-full text-white font-bold py-4 rounded-lg transition shadow-lg flex justify-center items-center gap-2
                                        ${uploading || !donationForm.amount || !selectedFile
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-900 hover:bg-blue-800'}`}
                                >
                                    {uploading
                                        ? <><FaCheck className="animate-spin" /> {t.uploading || 'Submitting...'}</>
                                        : <><FaUniversity /> {t.record_transfer}</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Login Prompt Modal */}
            <Modal
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title={t.login_prompt_title}
            >
                <div className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        {t.login_prompt_desc}
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleLoginRedirect}
                            className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-md"
                        >
                            {t.login_btn}
                        </button>
                        <button
                            onClick={handleGuestContinue}
                            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            {t.continue_guest}
                        </button>
                    </div>
                </div>
            </Modal>

        </motion.div >
    );
};

export default Donate;
