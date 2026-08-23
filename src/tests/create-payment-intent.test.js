import { beforeEach, describe, expect, it, vi } from 'vitest';

const createPaymentIntent = vi.hoisted(() => vi.fn());

vi.mock('stripe', () => ({
    default: class StripeMock {
        constructor() {
            this.paymentIntents = { create: createPaymentIntent };
        }
    },
}));

import { handler } from '../../netlify/functions/create-payment-intent';

const request = (body, overrides = {}) => ({
    httpMethod: 'POST',
    body: JSON.stringify(body),
    ...overrides,
});

describe('create-payment-intent', () => {
    beforeEach(() => {
        process.env.STRIPE_SECRET_KEY = 'sk_test_example';
        delete process.env.ALLOWED_ORIGIN;
        createPaymentIntent.mockReset();
    });

    it('answers preflight requests with safe headers', async () => {
        const response = await handler({ httpMethod: 'OPTIONS' });

        expect(response.statusCode).toBe(204);
        expect(response.headers['Cache-Control']).toBe('no-store');
        expect(response.headers['Access-Control-Allow-Methods']).toContain('POST');
    });

    it('rejects unsupported methods', async () => {
        const response = await handler({ httpMethod: 'GET' });

        expect(response.statusCode).toBe(405);
        expect(JSON.parse(response.body).error).toBe('Method not allowed.');
    });

    it.each([
        [{ amount: 0 }, 'Amount must be between 1 and 1,000,000.'],
        [{ amount: 'not-a-number' }, 'Amount must be between 1 and 1,000,000.'],
        [{ amount: 1000001 }, 'Amount must be between 1 and 1,000,000.'],
        [{ amount: 10, currency: 'gbp' }, 'Unsupported currency.'],
    ])('rejects invalid payloads', async (body, message) => {
        const response = await handler(request(body));

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error).toBe(message);
        expect(createPaymentIntent).not.toHaveBeenCalled();
    });

    it('rejects malformed JSON', async () => {
        const response = await handler({ httpMethod: 'POST', body: '{' });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error).toBe('Request body must be valid JSON.');
    });

    it('returns an unavailable response when the Stripe secret is missing', async () => {
        delete process.env.STRIPE_SECRET_KEY;

        const response = await handler(request({ amount: 10 }));

        expect(response.statusCode).toBe(503);
        expect(JSON.parse(response.body).error).toBe('Payments are temporarily unavailable.');
    });

    it('creates a payment intent with normalized currency and cents', async () => {
        createPaymentIntent.mockResolvedValue({ client_secret: 'pi_secret_example' });
        process.env.ALLOWED_ORIGIN = 'https://les-ambassadeurs.example';

        const response = await handler(request({ amount: '12.50', currency: 'MAD' }));

        expect(response.statusCode).toBe(200);
        expect(response.headers['Access-Control-Allow-Origin']).toBe('https://les-ambassadeurs.example');
        expect(JSON.parse(response.body)).toEqual({ clientSecret: 'pi_secret_example' });
        expect(createPaymentIntent).toHaveBeenCalledWith({
            amount: 1250,
            currency: 'mad',
            automatic_payment_methods: { enabled: true },
        });
    });

    it('does not leak provider errors to clients', async () => {
        createPaymentIntent.mockRejectedValue(Object.assign(new Error('secret provider details'), { code: 'card_error', type: 'StripeCardError' }));

        const response = await handler(request({ amount: 10 }));

        expect(response.statusCode).toBe(502);
        expect(JSON.parse(response.body).error).toBe('Unable to initialize payment. Please try again.');
    });
});
