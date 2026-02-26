// Separate file so Vite Fast Refresh doesn't complain about
// a context file exporting both a component (AuthProvider) and a hook.
export { useAuth } from './AuthContext';
