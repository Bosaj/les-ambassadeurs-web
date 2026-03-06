import { useContext } from 'react';
import { DataContext } from '../context/contexts';

// Separate file so Vite Fast Refresh doesn't complain about
// DataContext.jsx exporting both a component and non-component values.
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};
