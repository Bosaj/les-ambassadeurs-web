import { useContext } from 'react';
import { AuthContext } from '../context/contexts';

// Separate file so Vite Fast Refresh doesn't complain about
// AuthContext.jsx exporting both a component and non-component values.
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
