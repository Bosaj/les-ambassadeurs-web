# Payments & Donation Architecture

The application provides a multi-channel donation processing system supporting credit cards, PayPal, and direct bank transfers.

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
  4. Stripe confirms card transaction client-side and saves record in Supabase `donations` table.

---

## 🅿️ 2. PayPal Smart Buttons

* **Frontend**: `@paypal/react-paypal-js` using standard `PayPalButtons`.
* **Integration**: Captures order on client approval and logs transaction to `donations` table with method `'paypal'`.

---

## 🏦 3. Direct Bank Wire Transfer

* Displays official Moroccan Bank Account details (RIB, IBAN, SWIFT, Beneficiary Name).
* Donor enters transfer reference or email.
* Administrator verifies incoming wire in the **Admin Dashboard > Donations** tab.
