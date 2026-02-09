import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { FaGoogle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const { login, loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { language, t } = useLanguage();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Get the redirect path from location state or default to dashboard
    const from = location.state?.from || (user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/volunteer');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(t.welcome_back);

            // Redirect to the original destination or dashboard
            const redirectPath = location.state?.from || (user.role === 'admin' ? '/dashboard/admin' : '/dashboard/volunteer');
            navigate(redirectPath, { replace: true });
        } catch {
            toast.error(t.invalid_credentials);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            // Redirect is handled by Supabase automatically (to the URL config in Supabase dashboard)
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
                        {t.login_title}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder={t.email_placeholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                                placeholder={t.password_placeholder}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 z-20"
                            >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? t.signing_in : t.sign_in_btn}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-center text-gray-500 mb-4">{t.or_login_with}</p>
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium"
                        >
                            <FaGoogle className="text-red-500" />
                            <span>Google</span>
                        </button>
                    </div>

                    <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
                        {t.no_account}{' '}
                        <Link to="/signup" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                            {t.sign_up_link}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
