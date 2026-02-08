import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

import { motion } from 'framer-motion';
import { FaHeart, FaCreditCard, FaPaypal, FaUniversity, FaLock } from 'react-icons/fa';
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
    const [donationForm, setDonationForm] = useState({
        name: user?.name || '',
        amount: '',
        method: 'online', // 'online', 'paypal', 'transfer'
    });

    const [clientSecret, setClientSecret] = useState("");
    const [stripeError, setStripeError] = useState(null);

    const handleDonateClick = (method) => {
        setDonationForm(prev => ({ ...prev, method, name: user?.name || prev.name }));
        setShowModal(true);
        setClientSecret(""); // Reset stripe secret when opening modal
        setStripeError(null);
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
                    setStripeError("Minimum donation is 10 MAD");
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

    // Fallback manual submit for transfer
    const handleManualSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            await addDonation(donationForm);
            toast.success(t.donation_success);
            setShowModal(false);
            setDonationForm({ name: '', amount: '', method: 'online' });
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
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">{t.full_name}</label>
                        <input
                            type="text"
                            required
                            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition"
                            value={donationForm.name}
                            onChange={e => setDonationForm({ ...donationForm, name: e.target.value })}
                            placeholder={t.name_placeholder || "Your Name"}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">{t.amount_label}</label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="10"
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition px-4"
                                value={donationForm.amount}
                                onChange={e => setDonationForm({ ...donationForm, amount: e.target.value })}
                                placeholder="e.g. 100"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">{t.payment_method}</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => handleDonateClick('online')}
                                className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition ${donationForm.method === 'online'
                                    ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <FaCreditCard /> {t.credit_card_stripe || "Card"}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDonateClick('paypal')}
                                className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition ${donationForm.method === 'paypal'
                                    ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <FaPaypal /> PayPal
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDonateClick('transfer')}
                                className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition ${donationForm.method === 'transfer'
                                    ? 'border-blue-900 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <FaUniversity /> {t.bank_transfer || "Transfer"}
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
                                                        description: t.donation_to || "Donation to Association Les Ambassadeurs du Bien",
                                                    }],
                                                });
                                            }}
                                            onApprove={async (data, actions) => {
                                                const details = await actions.order.capture();
                                                handlePayPalSuccess(details);
                                            }}
                                            onError={(err) => toast.error((t.paypal_error || "PayPal Error: ") + err.message)}
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
                            <button
                                onClick={handleManualSubmit}
                                className="w-full bg-blue-900 text-white font-bold py-4 rounded-lg hover:bg-blue-800 transition shadow-lg mt-4 flex justify-center items-center gap-2"
                            >
                                <FaUniversity /> {t.record_transfer || "Record Transfer"}
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
};

export default Donate;
