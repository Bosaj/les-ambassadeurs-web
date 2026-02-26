// Separate file so Vite Fast Refresh doesn't complain about
// a context file exporting both a component (DataProvider) and a hook.
export { useData } from './DataContext';
