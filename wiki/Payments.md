# Payments & Donation Architecture

The application provides bank-transfer donation intake today. Stripe and PayPal integration code is retained for a future release, but online payment controls remain disabled until server-side provider reconciliation and Supabase RLS verification are complete.

---

## 💳 1. Stripe Card Checkout

* **Frontend**: `@stripe/react-stripe-js` and `@stripe/stripe-js` with `CardElement`.
* **Backend**: Netlify Serverless Function at `/.netlify/functions/create-payment-intent`.
* **Security**:
  * Client bundle only contains the public `VITE_STRIPE_PUBLISHABLE_KEY`.
  * `STRIPE_SECRET_KEY` is securely stored in Netlify environment variables and never exposed to the browser.
* **Process**:
  1. Donor selects donation amount and currency (USD, EUR, MAD).
  2. Frontend sends request to `create-payment-intent` serverless endpoint.
  3. Server creates Stripe `PaymentIntent` and returns `client_secret`.
  4. Stripe can confirm the payment method client-side, but this browser callback must not be treated as authoritative settlement. A signed server-side webhook or reconciliation path must update the internal record before online checkout is enabled.

---

## 🅿️ 2. PayPal Smart Buttons

* **Frontend**: `@paypal/react-paypal-js` using standard `PayPalButtons`.
* **Integration**: The client-side capture code is retained but the production UI is disabled until PayPal approval is verified server-side and mapped to an idempotent internal record.

---

## 🏦 3. Direct Bank Wire Transfer

* Displays official Moroccan Bank Account details (RIB, IBAN, SWIFT, Beneficiary Name).
* Donor uploads a proof file to the private `donations` bucket; the database stores the object path and the request remains pending.
* Administrator verifies incoming wire in the **Admin Dashboard > Donations** tab.
