# Payments

## Stripe
- Client: @stripe/react-stripe-js with CardElement
- Server: Netlify function creates PaymentIntent
- Test card: 4242 4242 4242 4242 (any future expiry, any CVV)

## PayPal
- @paypal/react-paypal-js PayPalButtons component
- Sandbox environment for testing

## Bank Transfer
- Bank details displayed to user
- Admin manually confirms receipt

## Security
- Stripe publishable key is client-safe (VITE_ prefix)
- Secret keys are server-side only (Netlify functions)
- No card data touches our servers
