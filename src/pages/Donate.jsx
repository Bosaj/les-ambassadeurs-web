import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { motion } from 'framer-motion';
import { FaHeart, FaCreditCard, FaPaypal, FaUniversity } from 'react-icons/fa';

const Donate = () => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-20 bg-gray-50 min-h-screen"
        >
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-blue-900 mb-6">{t.donate_title || "Make a Difference Today"}</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {t.donate_hero_desc || "Your contribution helps us provide essential support to families in need, educate children, and build a better future for our community."}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Bank Transfer */}
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border-t-4 border-blue-900">
                        <div className="text-blue-900 text-4xl mb-6 flex justify-center">
                            <FaUniversity />
                        </div>
                        <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">{t.bank_transfer || "Bank Transfer"}</h3>
                        <div className="space-y-4 text-gray-600">
                            <p className="flex justify-between border-b pb-2">
                                <span className="font-semibold">Bank:</span>
                                <span>Attijariwafa Bank</span>
                            </p>
                            <p className="flex justify-between border-b pb-2">
                                <span className="font-semibold">Account Name:</span>
                                <span>Ambassadors of Good</span>
                            </p>
                            <div className="bg-gray-100 p-3 rounded text-center font-mono text-sm break-all">
                                RIB: 123 456 78901234567890 12
                            </div>
                        </div>
                    </div>

                    {/* Online Payment */}
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border-t-4 border-red-500 transform md:-translate-y-4">
                        <div className="text-red-500 text-4xl mb-6 flex justify-center">
                            <FaCreditCard />
                        </div>
                        <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">{t.online_payment || "Online Payment"}</h3>
                        <p className="text-gray-600 text-center mb-8">
                            {t.online_payment_desc || "Securely donate using your credit card. We support Visa, Mastercard, and CMI."}
                        </p>
                        <button className="w-full bg-red-500 text-white font-bold py-4 rounded-lg hover:bg-red-600 transition shadow-md">
                            {t.donate_now_btn || "Donate Securely"}
                        </button>
                        <div className="mt-4 flex justify-center gap-4 opacity-60">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                        </div>
                    </div>

                    {/* PayPal */}
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border-t-4 border-blue-600">
                        <div className="text-blue-600 text-4xl mb-6 flex justify-center">
                            <FaPaypal />
                        </div>
                        <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">PayPal</h3>
                        <p className="text-gray-600 text-center mb-8">
                            {t.paypal_desc || "Fast and safe donation via PayPal. You can set up recurring monthly donations."}
                        </p>
                        <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition shadow-md">
                            {t.donate_paypal || "Donate with PayPal"}
                        </button>
                    </div>
                </div>

                <div className="mt-20 text-center bg-blue-50 p-10 rounded-2xl max-w-4xl mx-auto">
                    <FaHeart className="text-red-500 text-5xl mx-auto mb-6 animate-pulse" />
                    <h2 className="text-3xl font-bold text-blue-900 mb-4">{t.impact_title || "Where does your money go?"}</h2>
                    <p className="text-gray-700 max-w-2xl mx-auto">
                        {t.impact_desc || "100% of your donation goes directly to our programs. We are committed to transparency and will provide you with reports on how your contribution made a difference."}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Donate;
