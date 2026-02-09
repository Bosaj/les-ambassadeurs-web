import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { FaHeart, FaCreditCard, FaPaypal, FaUniversity, FaLock, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckout from '../components/StripeCheckout';

// Initialize Stripe outside of component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Donate = () => {
    const { language, t } = useLanguage();
    const { addDonation } = useData();
    const { user } = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [pendingMethod, setPendingMethod] = useState(null);

    const [donationForm, setDonationForm] = useState({
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
        email: user?.email || '',
        phone: user?.user_metadata?.phone || '',
        amount: '',
        method: 'online', // 'online', 'paypal', 'transfer'
        isAnonymous: false
    });

    const [clientSecret, setClientSecret] = useState("");
    const [stripeError, setStripeError] = useState(null);

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
        setClientSecret(""); // Reset stripe secret when opening modal
        setStripeError(null);
    };

    const handleGuestContinue = () => {
        setShowLoginPrompt(false);
        openDonationModal(pendingMethod);
    };

    const handleLoginRedirect = () => {
        navigate('/login', { state: { from: '/donate' } });
    };

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Check for Stripe redirect status
    useEffect(() => {
        const clientSecret = searchParams.get('payment_intent_client_secret');
        const redirectStatus = searchParams.get('redirect_status');

        if (clientSecret && redirectStatus === 'succeeded') {
            toast.success(t.donation_success || "Donation successful! Thank you.");
        } else if (redirectStatus === 'failed') {
            toast.error("Payment failed. Please try again.");
        }
    }, [searchParams, t]);

    // Effect to fetch payment intent when amount changes and method is 'online'
    useEffect(() => {
        const fetchPaymentIntent = async () => {
            if (donationForm.method === 'online' && donationForm.amount >= 10) {
                try {
                    const response = await fetch('/.netlify/functions/create-payment-intent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            amount: donationForm.amount,
                            currency: 'mad'
                        }),
                    });

                    if (!response.ok) {
                        const text = await response.text();
                        let errorMsg = "Failed to initialize payment";
                        try {
                            const errorData = JSON.parse(text);
                            errorMsg = errorData.error || errorMsg;
                        } catch (e) {
                            console.error("Failed to parse error response:", text);
                            errorMsg += ` (Status: ${response.status})`;
                        }
                        throw new Error(errorMsg);
                    }

                    const data = await response.json();
                    setClientSecret(data.clientSecret);
                    setStripeError(null);
                } catch (error) {
                    console.error("Error creating payment intent:", error);
                    // Critical error - redirect to error page
                    navigate('/error', { state: { error: error.message } });
                }
            } else {
                setClientSecret("");
                if (donationForm.amount > 0 && donationForm.amount < 10 && donationForm.method === 'online') {
                    setStripeError("Minimum donation is 10 DH");
                }
            }
        };

        // Debounce fetching to avoid too many requests while typing
        const timeoutId = setTimeout(() => {
            if (showModal && donationForm.method === 'online') {
                fetchPaymentIntent();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [donationForm.amount, donationForm.method, showModal]);

    const handleSuccess = async (details, methodOverride = null) => {
        try {
            const donationData = {
                ...donationForm,
                method: methodOverride || donationForm.method,
                status: 'verified', // Or 'processing'
                transaction_id: details.id
            };

            await addDonation(donationData);
            toast.success(t.donation_success);
            setShowModal(false);
            setDonationForm({ name: '', amount: '', method: 'online' });
            setClientSecret("");
        } catch (error) {
            console.error(error);
            toast.error(t.donation_error);
        }
    };

    const handlePayPalSuccess = async (details) => {
        handleSuccess(details, 'paypal');
    };

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('donations')
                .upload(filePath, file);

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('donations')
                .getPublicUrl(filePath);

            setDonationForm(prev => ({ ...prev, proof_url: publicUrlData.publicUrl }));
            toast.success(t.proof_uploaded || "Proof Uploaded");
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error("Error uploading file. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // Fallback manual submit for transfer
    const handleManualSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!donationForm.proof_url) {
            toast.error(t.upload_proof_req || "Please upload a proof of payment");
            return;
        }

        try {
            await addDonation(donationForm);
            toast.success(t.donation_success);
            setShowModal(false);
            setDonationForm({ name: '', amount: '', method: 'online', proof_url: null });
        } catch (error) {
            toast.error(t.donation_error);
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
                                RIB: 123 456 78901234567890 12
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
                            onClick={() => handleDonateClick('online')}
                            className="w-full bg-red-500 text-white font-bold py-4 rounded-lg hover:bg-red-600 transition shadow-md"
                        >
                            {t.donate_now_btn}
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
                            onClick={() => handleDonateClick('paypal')}
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition shadow-md"
                        >
                            {t.donate_paypal}
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
                        <label htmlFor="anonymous" className="text-gray-700 dark:text-gray-300 font-medium">
                            {t.donate_anonymous}
                        </label>
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
                                onClick={() => handleDonateClick('online')}
                                className={`p-4 rounded-xl border-2 text-sm font-bold flex flex-col items-center gap-2 transition-all duration-200 ${donationForm.method === 'online'
                                    ? 'border-red-500 bg-red-50 text-red-600 shadow-md transform scale-[1.02] dark:bg-red-900/20 dark:text-red-400'
                                    : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
                                    }`}
                            >
                                <FaCreditCard className="text-xl" /> {t.credit_card_stripe}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDonateClick('paypal')}
                                className={`p-4 rounded-xl border-2 text-sm font-bold flex flex-col items-center gap-2 transition-all duration-200 ${donationForm.method === 'paypal'
                                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md transform scale-[1.02] dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
                                    }`}
                            >
                                <FaPaypal className="text-xl" /> PayPal
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
                        {donationForm.method === 'paypal' && (
                            <div className="mt-4">
                                {donationForm.amount > 0 ? (
                                    <PayPalScriptProvider options={{
                                        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
                                        currency: "MAD",
                                        intent: "capture"
                                    }}>
                                        <PayPalButtons
                                            style={{ layout: "vertical", shape: "rect", label: "donate" }}
                                            createOrder={(data, actions) => {
                                                return actions.order.create({
                                                    purchase_units: [{
                                                        amount: { value: donationForm.amount },
                                                        description: t.donation_to,
                                                    }],
                                                });
                                            }}
                                            onApprove={async (data, actions) => {
                                                const details = await actions.order.capture();
                                                handlePayPalSuccess(details);
                                            }}
                                            onError={(err) => toast.error((t.paypal_error) + err.message)}
                                        />
                                    </PayPalScriptProvider>
                                ) : (
                                    <div className="text-center text-gray-500 py-4">
                                        {t.enter_amount_paypal}
                                    </div>
                                )}
                            </div>
                        )}

                        {donationForm.method === 'online' && (
                            <div className="mt-4">
                                {clientSecret && donationForm.amount > 0 ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <StripeCheckout
                                            amount={donationForm.amount}
                                            onSuccess={(details) => handleSuccess(details, 'stripe')}
                                            onError={(err) => console.error(err)}
                                        />
                                    </Elements>
                                ) : (
                                    <div className="text-center text-gray-500 py-4">
                                        {stripeError ? (
                                            <span className="text-red-500">{stripeError}</span>
                                        ) : (
                                            t.enter_amount_stripe
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

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
                                    {uploading && <p className="text-xs text-blue-600 mt-2">{t.uploading}</p>}
                                    {donationForm.proof_url && (
                                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                            <FaCheck /> {t.proof_uploaded}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleManualSubmit}
                                    disabled={uploading || !donationForm.proof_url}
                                    className={`w-full text-white font-bold py-4 rounded-lg transition shadow-lg flex justify-center items-center gap-2
                                        ${uploading || !donationForm.proof_url
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-900 hover:bg-blue-800'}`}
                                >
                                    <FaUniversity /> {t.record_transfer}
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
