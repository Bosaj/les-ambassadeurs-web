// Utility to load Stripe and suppress ad blocker console errors
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Silence Stripe errors caused by ad blockers
let stripePromise = null;

export const getStripe = () => {
    if (!STRIPE_KEY) {
        console.info('Stripe Publishable Key is missing. Online payments are disabled.');
        return null;
    }

    if (!stripePromise) {
        // Wrap in try-catch and suppress console errors
        const originalError = console.error;
        const originalWarn = console.warn;

        // Temporarily override console.error and console.warn during Stripe initialization
        console.error = (...args) => {
            const errorStr = args.join(' ');
            // Only suppress Stripe-related ad blocker errors
            if (!errorStr.includes('stripe.com') && !errorStr.includes('ERR_BLOCKED_BY_CLIENT')) {
                originalError(...args);
            }
        };

        console.warn = (...args) => {
            const warnStr = args.join(' ');
            // Suppress Stripe HTTP warnings in development
            if (!warnStr.includes('Stripe.js') && !warnStr.includes('HTTPS')) {
                originalWarn(...args);
            }
        };

        stripePromise = loadStripe(STRIPE_KEY).catch(() => {
            // Silently fail if Stripe is blocked
            console.info('Stripe is unavailable (likely blocked by ad blocker). Online payments are disabled.');
            return null;
        });

        // Restore original console methods (after a short delay to catch immediate init errors)
        setTimeout(() => {
            console.error = originalError;
            console.warn = originalWarn;
        }, 1000);
    }

    return stripePromise;
};

export default getStripe;
