import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from './LoadingSpinner';

// Which roles may open each protected area. Members (paid, approved) use the
// volunteer dashboard; admins can open both.
const ROUTE_ACCESS = {
    volunteer: ['volunteer', 'member', 'admin'],
    admin: ['admin'],
};

const homeFor = (role) => (role === 'admin' ? '/dashboard/admin' : '/dashboard/volunteer');

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
        return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
        const allowed = ROUTE_ACCESS[requiredRole] || [requiredRole];
        if (!allowed.includes(user.role)) {
            // Send people to the dashboard they are allowed to use
            return <Navigate to={homeFor(user.role)} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
