import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    const { t } = useLanguage();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">{t.loading}</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Allow admin to access volunteer routes (since admins are also volunteers)
        if (user.role === 'admin' && requiredRole === 'volunteer') {
            return children;
        }

        // Redirect based on their actul role if they try to access wrong dashboard
        if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
        if (user.role === 'volunteer') return <Navigate to="/dashboard/volunteer" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
