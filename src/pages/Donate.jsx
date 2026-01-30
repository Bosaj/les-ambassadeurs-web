import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../translations';
import { motion } from 'framer-motion';
import { FaHeart, FaCreditCard, FaPaypal, FaUniversity, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Donate = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const { addDonation } = useData();
    const { user } = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [donationForm, setDonationForm] = useState({
        name: user?.name || '',
        amount: '',
        method: 'online', // 'online', 'paypal', 'transfer'
    });

    const handleDonateClick = (method) => {
        setDonationForm(prev => ({ ...prev, method, name: user?.name || prev.name }));
        setShowModal(true);
    };

    const handleDonateSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDonation(donationForm);
            toast.success("Thank you for your donation pledge! We will contact you shortly.");
            setShowModal(false);
            setDonationForm({ name: '', amount: '', method: 'online' });
        } catch (error) {
            toast.error("Failed to process donation. Please try again.");
        }
    };

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
                                <span>{t.bank_name_value}</span>
                            </p>
                            <p className="flex justify-between border-b dark:border-gray-700 pb-2">
                                <span className="font-semibold">{t.account_name_label}</span>
                                <span>{t.account_name_value}</span>
                            </p>
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-center font-mono text-sm break-all dark:text-white">
                                RIB: 123 456 78901234567890 12
                            </div>
                        </div>
                        <button
                            onClick={() => handleDonateClick('transfer')}
                            className="w-full mt-6 bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-md"
                        >
                            Record Transfer
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
                            onClick={() => handleDonateClick('stripe')}
                            className="w-full bg-red-500 text-white font-bold py-4 rounded-lg hover:bg-red-600 transition shadow-md"
                        >
                            {t.donate_now_btn}
                        </button>
                        <div className="mt-4 flex justify-center gap-4 opacity-60">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
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
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-4">{t.impact_title || "Where does your money go?"}</h2>
                    <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.impact_desc || "100% of your donation goes directly to our programs. We are committed to transparency and will provide you with reports on how your contribution made a difference."}
                    </p>
                </div>
            </div>

            {/* Donation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md relative transition-all duration-300">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                        >
                            <FaTimes size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Make a Donation</h2>
                        <form onSubmit={handleDonateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={donationForm.name}
                                    onChange={e => setDonationForm({ ...donationForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-2">Amount (TND)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={donationForm.amount}
                                    onChange={e => setDonationForm({ ...donationForm, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                                <select
                                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={donationForm.method}
                                    onChange={e => setDonationForm({ ...donationForm, method: e.target.value })}
                                >
                                    <option value="online">Credit Card (Stripe)</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-red-500 text-white font-bold py-4 rounded-lg hover:bg-red-600 transition shadow-lg mt-4">
                                Confirm Donation
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Donate;
