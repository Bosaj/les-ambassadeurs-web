// Single source of truth for React Context objects.
// Kept in a dedicated file so that AuthContext.jsx and DataContext.jsx
// can export ONLY their Provider components — making them compatible
// with Vite Fast Refresh (which requires files to export only React components).
import { createContext } from 'react';

export const AuthContext = createContext(null);
export const DataContext = createContext(null);
