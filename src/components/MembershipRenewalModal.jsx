import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckout from './StripeCheckout';
import toast from 'react-hot-toast';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { FaCreditCard, FaUniversity, FaMoneyBillWave, FaTimes, FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaPaypal } from 'react-icons/fa';
import { getStripe } from '../lib/stripe';

const MembershipRenewalModal = ({ isOpen, onClose, onRenewalComplete }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState(''); // 'online', 'bank', 'cash'
    const [loading, setLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [proofFile, setProofFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const currentYear = new Date().getFullYear();
    const MEMBERSHIP_FEE = 50; // MAD

    const handleMethodSelect = async (method) => {
        setPaymentMethod(method);
        if (method === 'online') {
            await initializeStripePayment();
        }
    };

    const initializeStripePayment = async () => {
        setLoading(true);
        try {
            const response = await fetch('/.netlify/functions/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: MEMBERSHIP_FEE, currency: 'mad' }),
            });
            const data = await response.json();
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
            } else {
                toast.error("Failed to initialize payment");
            }
        } catch (error) {
            console.error("Stripe init error:", error);
            toast.error("Network error initializing payment");
        } finally {
            setLoading(false);
        }
    };

    const handleStripeSuccess = async (paymentIntent) => {
        await recordMembershipPayment('online', paymentIntent.id, 'paid');
    };

    const handlePayPalSuccess = async (details) => {
        await recordMembershipPayment('paypal', details.id, 'paid');
    };

    const recordMembershipPayment = async (method, transactionId, status) => {
        try {
            const { error } = await supabase
                .from('annual_memberships')
                .insert({
                    user_id: user.id,
                    year: currentYear,
                    amount: MEMBERSHIP_FEE,
                    status: status,
                    payment_method: method,
                    payment_intent_id: transactionId
                });

            if (error) throw error;
            toast.success(t.renewal_success);
            onRenewalComplete();
            onClose();
        } catch (error) {
            console.error("Renewal error:", error);
            toast.error("Failed to record membership. Please contact support.");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProofFile(file);
    };

    const submitManualPayment = async () => {
        setLoading(true);
        let proofUrl = null;

        try {
            if (paymentMethod === 'bank' && proofFile) {
                setUploading(true);
                const fileExt = proofFile.name.split('.').pop();
                const fileName = `membership_${user.id}_${currentYear}_${Date.now()}.${fileExt}`;
                const filePath = `membership-proofs/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('receipts') // Reusing receipts bucket
                    .upload(filePath, proofFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
                proofUrl = data.publicUrl;
                setUploading(false);
            }

            const { error } = await supabase
                .from('annual_memberships')
                .insert({
                    user_id: user.id,
                    year: currentYear,
                    amount: MEMBERSHIP_FEE,
                    status: 'pending', // Pending for manual verification
                    payment_method: paymentMethod,
                    proof_url: proofUrl
                });

            if (error) throw error;
            toast.success(t.renewal_pending_msg);
            onRenewalComplete();
            onClose();
        } catch (error) {
            console.error("Renewal error:", error);
            toast.error("Failed to submit renewal request.");
            setUploading(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t.renew_modal_title || "Renew Membership"}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {!paymentMethod ? (
                        <div className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-300 mb-4">{t.select_payment_method || "Select a payment method"}:</p>

                            <div className="grid grid-cols-1 gap-3">
                                <button onClick={() => handleMethodSelect('cash')} className="w-full flex items-center p-4 border dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group text-left">
                                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl group-hover:scale-110 transition">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div className="ml-4 rtl:mr-4">
                                        <h4 className="font-bold text-gray-800 dark:text-white">{t.pay_cash || "Cash"}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.cash_desc || "Pay at the office"}</p>
                                    </div>
                                </button>

                                <button onClick={() => handleMethodSelect('bank')} className="w-full flex items-center p-4 border dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group text-left">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition">
                                        <FaUniversity />
                                    </div>
                                    <div className="ml-4 rtl:mr-4">
                                        <h4 className="font-bold text-gray-800 dark:text-white">{t.pay_bank_transfer || "Bank Transfer"}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.bank_desc || "Transfer & Upload Proof"}</p>
                                    </div>
                                </button>

                                <button onClick={() => handleMethodSelect('online')} className="w-full flex items-center p-4 border dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group text-left">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl group-hover:scale-110 transition">
                                        <FaCreditCard />
                                    </div>
                                    <div className="ml-4 rtl:mr-4">
                                        <h4 className="font-bold text-gray-800 dark:text-white">{t.pay_online || "Online Payment"}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.online_desc || "Secure Card Payment"}</p>
                                    </div>
                                </button>

                                <button onClick={() => handleMethodSelect('paypal')} className="w-full flex items-center p-4 border dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group text-left">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition">
                                        <FaPaypal />
                                    </div>
                                    <div className="ml-4 rtl:mr-4">
                                        <h4 className="font-bold text-gray-800 dark:text-white">PayPal</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.paypal_desc || "Pay via PayPal"}</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <button onClick={() => setPaymentMethod('')} className="text-sm text-blue-600 hover:underline mb-2">
                                &larr; {t.back_to_methods || "Back"}
                            </button>

                            {paymentMethod === 'cash' && (
                                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-700">
                                    <FaMoneyBillWave className="text-4xl text-yellow-600 mx-auto mb-3" />
                                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">{t.cash_instruction}</p>
                                    <div className="font-bold text-xl my-4 text-gray-800 dark:text-white">{MEMBERSHIP_FEE} {t.currency_mad || 'DH'}</div>
                                    <button
                                        onClick={submitManualPayment}
                                        disabled={loading}
                                        className="w-full bg-yellow-600 text-white py-3 rounded-lg font-bold hover:bg-yellow-700 transition"
                                    >
                                        {loading ? t.processing : t.confirm_renewal}
                                    </button>
                                </div>
                            )}

                            {paymentMethod === 'bank' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t.bank_instruction}</p>
                                        <div className="font-mono bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-600 text-center select-all space-y-2">
                                            <div className="font-bold text-blue-900 dark:text-blue-300">{t.bank_name || "Bank: Banque Populaire"}</div>
                                            <div className="font-semibold text-gray-700 dark:text-gray-300">{t.account_holder || "Account: Les Ambassadeurs du Bien"}</div>
                                            <div className="text-lg tracking-wider mt-2 border-t pt-2 dark:border-gray-700">{t.bank_details}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            {t.upload_proof}
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {proofFile ? (
                                                <div className="flex items-center justify-center gap-2 text-green-600">
                                                    <FaCheckCircle /> <span className="truncate">{proofFile.name}</span>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400">
                                                    <FaCloudUploadAlt className="text-3xl mx-auto mb-2" />
                                                    <span>Click to upload or drag & drop</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={submitManualPayment}
                                        disabled={loading || !proofFile}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {uploading || loading ? <FaSpinner className="animate-spin" /> : t.confirm_renewal}
                                    </button>
                                </div>
                            )}

                            {paymentMethod === 'online' && (
                                <div>
                                    {clientSecret ? (
                                        <Elements stripe={getStripe()} options={{ clientSecret }}>
                                            <StripeCheckout
                                                amount={MEMBERSHIP_FEE}
                                                onSuccess={handleStripeSuccess}
                                                onError={(err) => console.error(err)}
                                            />
                                        </Elements>
                                    ) : (
                                        <div className="flex justify-center p-8">
                                            <FaSpinner className="animate-spin text-3xl text-purple-600" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {paymentMethod === 'paypal' && (
                                <div className="mt-4">
                                    <PayPalScriptProvider options={{
                                        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
                                        currency: "MAD",
                                        intent: "capture" // Add intent
                                    }}>
                                        <PayPalButtons
                                            style={{ layout: "vertical", shape: "rect", label: "pay" }}
                                            createOrder={(data, actions) => {
                                                return actions.order.create({
                                                    purchase_units: [{
                                                        amount: { value: MEMBERSHIP_FEE, currency_code: "MAD" },
                                                        description: t.renew_modal_title || "Membership Renewal"
                                                    }]
                                                });
                                            }}
                                            onApprove={async (data, actions) => {
                                                const details = await actions.order.capture();
                                                handlePayPalSuccess(details);
                                            }}
                                            onError={(err) => {
                                                console.error("PayPal Error:", err);
                                                toast.error("PayPal Error: " + err.message);
                                            }}
                                        />
                                    </PayPalScriptProvider>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MembershipRenewalModal;
