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

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Wiki last updated: 2026-08-20*

</div>
