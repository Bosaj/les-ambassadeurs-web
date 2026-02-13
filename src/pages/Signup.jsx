
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaGoogle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Signup = () => {
    const { loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/dashboard/volunteer', { replace: true });
        }
    }, [user, navigate]);

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            // Redirect is handled by Supabase automatically
        } catch (error) {
            console.error(error);
            toast.error(t.error_occurred);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg transition-colors duration-300">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        {t.signup_title}
                    </h2>
                    <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                        {t.signup_with_google_message || "Sign up quickly and securely with your Google account"}
                    </p>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium text-lg shadow-md hover:shadow-lg"
                    >
                        <FaGoogle className="text-red-500 text-xl" />
                        <span>{t.signup_with_google || "Sign up with Google"}</span>
                    </button>
                </div>

                <div className="text-center text-sm mt-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        {t.have_account}{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            {t.sign_in_link}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
