import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Redirect based on their actul role if they try to access wrong dashboard
        if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
        if (user.role === 'volunteer') return <Navigate to="/dashboard/volunteer" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
