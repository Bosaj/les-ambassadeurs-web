import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { FaFilePdf, FaCheckCircle, FaLock, FaUserShield, FaFileUpload, FaBuilding, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

const MembershipPage = () => {
    const { user, upgradeToMember } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [readLaw, setReadLaw] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('office'); // 'office' or 'online'

    // Dropzone configuration
    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            setUploadedFile(acceptedFiles[0]);
            toast.success("File attached successfully!");
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxFiles: 1
    });

    if (!user) {
        navigate('/login');
        return null;
    }

    if (user.membership_status === 'pending' || user.membership_status === 'active') {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
                    <FaUserShield className="text-6xl text-green-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-4 dark:text-white">
                        {user.membership_status === 'active' ? (t.already_member || "You are a Member!") : (t.status_pending || "Application Pending")}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {user.membership_status === 'active'
                            ? (t.member_active_msg || "Welcome to the official members circle.")
                            : (t.member_pending_msg || "Your application is under review by the administration. Please proceed with payment if not done.")}
                    </p>
                    <button onClick={() => navigate('/dashboard/volunteer')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                        {t.go_dashboard || "Go to Dashboard"}
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!readLaw) {
            toast.error(t.error_agree_docs || "Please agree to all documents.");
            return;
        }

        // Verification logic
        if (paymentMethod === 'online' && !uploadedFile) {
            toast.error("Please upload the legalized commitment form for online verification.");
            return;
        }

        setProcessing(true);
        // Simulate file upload delay if file exists
        if (uploadedFile) {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        const result = await upgradeToMember(user.id, {
            paymentMethod,
            hasUploadedFile: !!uploadedFile
            // In a real app, we would pass the file URL here after upload
        });
        setProcessing(false);

        if (result.success) {
            toast.success(t.application_submitted || "Application submitted successfully!");
        } else {
            toast.error(t.error_occurred || "Something went wrong.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-900 text-white p-8 text-center">
                    <FaUserShield className="text-5xl mx-auto mb-4 animate-bounce-slow" />
                    <h1 className="text-3xl font-bold mb-2">{t.become_member_title || "Official Membership Application"}</h1>
                    <p className="opacity-90">{t.become_member_subtitle || "Join our dedicated core team."}</p>
                </div>

                <div className="p-8">
                    {/* Steps */}
                    <div className="mb-10 bg-blue-50 dark:bg-gray-700/30 p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4 dark:text-white border-b border-blue-200 dark:border-gray-600 pb-2">{t.steps_to_join || "Steps to Join"}</h3>
                        <ol className="list-decimal pl-5 space-y-4 text-gray-700 dark:text-gray-300">
                            <li><span className="font-semibold">{t.step_read_law}</span></li>
                            <li>
                                <span className="font-semibold">{t.step_sign_commitment}</span>
                                <p className="text-sm text-red-500 mt-1 italic">{t.legalization_warning || "* Warning: The signature must be legalized at the local municipality/district."}</p>
                            </li>
                            <li><span className="font-semibold">{t.step_pay_fee}</span></li>
                            <li><span className="font-semibold">{t.step_upload_payment}</span></li>
                        </ol>
                    </div>

                    {/* Documents Download */}
                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        <a href="/assets/docs/internal_law.pdf" target="_blank" className="flex items-center gap-4 p-4 border rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition group border-gray-200 dark:border-gray-600">
                            <div className="bg-red-100 p-3 rounded-lg text-red-600 group-hover:bg-red-200">
                                <FaFilePdf className="text-2xl" />
                            </div>
                            <div>
                                <h4 className="font-bold dark:text-white text-lg">{t.internal_law}</h4>
                                <span className="text-sm text-blue-600 group-hover:underline">{t.click_to_read}</span>
                            </div>
                        </a>
                        <a href="/assets/docs/commitment.pdf" target="_blank" className="flex items-center gap-4 p-4 border rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition group border-gray-200 dark:border-gray-600">
                            <div className="bg-red-100 p-3 rounded-lg text-red-600 group-hover:bg-red-200">
                                <FaFilePdf className="text-2xl" />
                            </div>
                            <div>
                                <h4 className="font-bold dark:text-white text-lg">{t.commitment_form}</h4>
                                <span className="text-sm text-blue-600 group-hover:underline">{t.click_to_read}</span>
                            </div>
                        </a>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Checkboxes */}
                        <div className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    checked={readLaw}
                                    onChange={(e) => setReadLaw(e.target.checked)}
                                />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    {t.agree_internal_law}
                                </span>
                            </label>
                        </div>

                        {/* Payment & Submission Method */}
                        <div className="border-t pt-6 dark:border-gray-700">
                            <h3 className="text-lg font-bold mb-4 dark:text-white">{t.payment_check}</h3>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('office')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition ${paymentMethod === 'office'
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <FaBuilding className="text-3xl" />
                                    <div className="text-center">
                                        <div className="font-bold">{t.payment_in_person || "In-Person (Office)"}</div>
                                        <div className="text-xs mt-1">{t.payment_in_person_desc || "Pay cash & submit physical form"}</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('online')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition ${paymentMethod === 'online'
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <FaGlobe className="text-3xl" />
                                    <div className="text-center">
                                        <div className="font-bold">{t.payment_online || "Online / Remote"}</div>
                                        <div className="text-xs mt-1">{t.payment_online_desc || "Check bank details & upload file"}</div>
                                    </div>
                                </button>
                            </div>

                            {/* Conditional Content based on Method */}
                            {paymentMethod === 'office' ? (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded text-sm text-yellow-800 dark:text-yellow-200 animate-fade-in">
                                    <p>{t.agree_commitment}</p>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded text-sm text-blue-800 dark:text-blue-200">
                                        <p className="font-bold mb-2">Bank Details for Transfer:</p>
                                        <p>Bank: Attijariwafa Bank</p>
                                        <p>Account: 1234-5678-9012-3456</p>
                                        <p>Ref: Membership-{user.id.slice(0, 6)}</p>
                                    </div>

                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer" {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        {uploadedFile ? (
                                            <div className="text-green-600 flex flex-col items-center">
                                                <FaCheckCircle className="text-4xl mb-2" />
                                                <p className="font-bold">{uploadedFile.name}</p>
                                                <p className="text-sm">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center">
                                                <FaFileUpload className="text-4xl mb-2" />
                                                <p className="font-bold">{t.upload_commitment}</p>
                                                <p className="text-sm mt-1">{t.drag_drop_commitment}</p>
                                                <p className="text-xs mt-2 text-gray-400">{t.supported_formats}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!readLaw || processing || (paymentMethod === 'online' && !uploadedFile)}
                            className={`w-full py-4 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 text-lg shadow-lg
                                ${(!readLaw || processing || (paymentMethod === 'online' && !uploadedFile))
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 transform hover:-translate-y-1'}`}
                        >
                            {processing ? (t.processing || "Processing...") : (
                                <>
                                    <FaCheckCircle /> {t.submit_application}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MembershipPage;
