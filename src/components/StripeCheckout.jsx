import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { FaLock, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const StripeCheckout = ({ amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const { t } = useLanguage();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // Make sure to change this to your payment completion page
                    return_url: `${window.location.origin}/donate`, // or a specific success page
                },
                redirect: "if_required", // Important: Avoid redirect if 3DS not needed
            });

            if (error) {
                setErrorMessage(error.message);
                onError(error.message);
                toast.error(error.message);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent);
            } else {
                // Handle other statuses (processing, requires_action, etc.) if needed
                console.log("Payment status:", paymentIntent?.status);
                if (paymentIntent?.status === 'processing') {
                    toast.loading(t.processing || "Payment processing...");
                }
            }
        } catch (err) {
            setErrorMessage(t.error_occurred || "An unexpected error occurred.");
            onError(err);
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg hover:bg-indigo-700 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? (
                    <>
                        <FaSpinner className="animate-spin" /> {t.processing || "Processing..."}
                    </>
                ) : (
                    <>
                        <FaLock /> {t.pay_now} {amount} {t.currency_mad}
                    </>
                )}
            </button>

            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                <FaLock className="inline mr-1" /> {t.secure_payment_desc}
            </div>
        </form>
    );
};

export default StripeCheckout;
