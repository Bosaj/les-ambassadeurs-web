# Payments & Donation Architecture

The application supports three secure donation pathways: **Stripe**, **PayPal**, and **Direct Bank Transfer**.

---

## 💳 1. Stripe Integration

* **Client Layer**: Uses `@stripe/react-stripe-js` and `@stripe/stripe-js` with the `CardElement` component.
* **Backend Layer**: Netlify Serverless Function at `/.netlify/functions/create-payment-intent`.
* **Security**:
  * Only `VITE_STRIPE_PUBLISHABLE_KEY` is bundled in client assets.
  * `STRIPE_SECRET_KEY` is securely stored in Netlify environment variables and never exposed to the browser.
* **Flow**:
  1. User selects donation amount and currency (USD, EUR, MAD).
  2. Client calls `create-payment-intent` function to generate a Stripe `client_secret`.
  3. Stripe processes card payment directly through secure tokenization.
  4. Record is logged to the `donations` table in Supabase.

---

## 🅿️ 2. PayPal Integration

* **Client Layer**: Uses `@paypal/react-paypal-js` with `PayPalButtons`.
* **Environment**: Configurable between Sandbox (for testing) and Live (for production).
* **Flow**:
  1. Client initializes PayPal SDK with `PAYPAL_CLIENT_ID`.
  2. User approves payment in PayPal popup modal.
  3. On successful capture, transaction is logged to `donations` table with payment method `'paypal'`.

---

## 🏦 3. Direct Bank Wire Transfer

* Provides official bank account details (RIB, IBAN, SWIFT code, Beneficiary name).
* Instructions for donor to include their name or email in the transfer reference.
* Admins manually verify incoming wire transfers in the **Admin Dashboard > Donations** tab.

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Official Documentation for Association des Ambassadeurs du Bien — Oujda*

</div>
