import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    const { t } = useLanguage();

    // Still waiting for session validation (e.g. token refresh on slow network)
    // AND we have no cached user yet — show a minimal spinner
    if (loading && !user) {
        return <LoadingSpinner fullScreen={true} message={t.loading || 'Loading...'} />;
    }

    // Auth resolved: no user → redirect to login
    if (!user) {
        if (import.meta.env.DEV) console.debug('[ProtectedRoute] No user found; redirecting to login.');
        return <Navigate to="/login" replace />;
    }

    // Role check
    if (requiredRole && user.role !== requiredRole) {
        if (import.meta.env.DEV) console.debug(`[ProtectedRoute] Role mismatch; required: ${requiredRole}, actual: ${user.role}`);
        // Admin can access volunteer routes
        if (user.role === 'admin' && requiredRole === 'volunteer') {
            return children;
        }
        // Redirect to their correct dashboard
        if (user.role === 'admin') {
            if (import.meta.env.DEV) console.debug('[ProtectedRoute] Sending admin back to dashboard/admin.');
            return <Navigate to="/dashboard/admin" replace />;
        }
        if (user.role === 'volunteer') {
            if (import.meta.env.DEV) console.debug('[ProtectedRoute] Sending volunteer back to dashboard/volunteer.');
            return <Navigate to="/dashboard/volunteer" replace />;
        }

        if (import.meta.env.DEV) console.debug('[ProtectedRoute] Sending unknown role back to root.');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
