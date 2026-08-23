import { loadStripe } from '@stripe/stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
let stripePromise;

export const isStripeConfigured = Boolean(stripeKey);

export const getStripe = () => {
    if (!stripeKey) return null;

    if (!stripePromise) {
        stripePromise = loadStripe(stripeKey).catch((error) => {
            if (import.meta.env.DEV) console.warn('[Stripe] Unable to load Stripe.js:', error);
            return null;
        });
    }

    return stripePromise;
};

export default getStripe;
