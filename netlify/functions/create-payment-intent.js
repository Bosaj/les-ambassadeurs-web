/* eslint-env node */
import Stripe from 'stripe';

const jsonResponse = (statusCode, payload, origin = '*') => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
    body: JSON.stringify(payload),
});

const getAllowedOrigin = () => process.env.ALLOWED_ORIGIN || '*';
const supportedCurrencies = new Set(['mad', 'eur', 'usd']);

export const handler = async (event) => {
    const origin = getAllowedOrigin();

    if (event.httpMethod === 'OPTIONS') {
        return jsonResponse(204, {}, origin);
    }

    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed.' }, origin);
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        console.error('Missing STRIPE_SECRET_KEY');
        return jsonResponse(503, { error: 'Payments are temporarily unavailable.' }, origin);
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch {
        return jsonResponse(400, { error: 'Request body must be valid JSON.' }, origin);
    }

    const amount = Number(payload.amount);
    const currency = String(payload.currency || 'mad').trim().toLowerCase();

    if (!Number.isFinite(amount) || amount < 1 || amount > 1000000) {
        return jsonResponse(400, { error: 'Amount must be between 1 and 1,000,000.' }, origin);
    }

    if (!supportedCurrencies.has(currency)) {
        return jsonResponse(400, { error: 'Unsupported currency.' }, origin);
    }

    try {
        const stripe = new Stripe(secretKey);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            automatic_payment_methods: { enabled: true },
        });

        return jsonResponse(200, { clientSecret: paymentIntent.client_secret }, origin);
    } catch (error) {
        console.error('Stripe payment intent failed:', {
            code: error?.code,
            type: error?.type,
            message: error?.message,
        });
        return jsonResponse(502, { error: 'Unable to initialize payment. Please try again.' }, origin);
    }
};
