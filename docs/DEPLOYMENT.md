# Production Deployment Guide

This project is a Vite single-page application with a Netlify Function for Stripe PaymentIntents. The browser must receive only public `VITE_*` values. Stripe secret keys, PayPal secrets, service-role keys, and deployment tokens belong only in Netlify or CI secret storage.

## 1. Required runtime configuration

Create the following values in the Netlify site environment settings. Use the production context for live deploys and the deploy-preview context for safe test credentials.

| Variable | Context | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser | Public Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Browser | Public Supabase anonymous key protected by Supabase RLS. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Browser | Stripe.js publishable key. |
| `VITE_PAYPAL_CLIENT_ID` | Browser | PayPal browser client ID. The PayPal UI stays disabled if it is absent. |
| `STRIPE_SECRET_KEY` | Netlify Function only | Server-side Stripe PaymentIntent creation. Never prefix it with `VITE_`. |
| `ALLOWED_ORIGIN` | Netlify Function only | Exact production site origin, for example `https://a-a-b-v.netlify.app`. |

Do not commit `.env`, Netlify tokens, Supabase service-role keys, Stripe secret keys, or PayPal client secrets. Public Supabase and payment publishable keys are intentionally bundled into the browser, but the database must enforce authorization with Row Level Security.

## 2. Supabase setup

Before the first production deploy, confirm the target Supabase project and apply the schema expected by the application. Verify the following tables and policies against the live project before accepting donations, registrations, profile updates, or admin actions:

`profiles`, `news`, `events`, `event_attendees`, `donations`, `annual_memberships`, `gallery_images`, `images`, `notifications`, `problem_reports`, `event_suggestions`, `badge_definitions`, `branches`, `partners`, `testimonials`, and `receipts`.

Apply migrations through the Supabase project’s approved migration process. Never apply a migration to an unrelated project. Test both an anonymous browser session and an authenticated member session after migration. Confirm that an ordinary member cannot read administrative records or update another user’s profile.

## 3. Local production check

Use Node.js 20 or newer, then run the same commands used by CI:

```bash
npm ci
npm run lint
npm test
npm run build
npm audit --audit-level=high
```

The build output is written to `dist/`. The Netlify configuration includes the SPA fallback in `netlify.toml` and the function is discovered from `netlify/functions/`.

To test the Netlify Function locally, use the Netlify CLI with the local environment loaded:

```bash
netlify dev
```

Send a `POST` request with a JSON body such as `{"amount":50,"currency":"mad"}`. Verify that malformed JSON, unsupported currencies, amounts outside the allowed range, missing secrets, and non-POST methods receive safe error responses. Never use a real payment amount while testing locally.

## 4. Netlify deploy

Connect the GitHub repository to Netlify with these build settings:

```text
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
Node version: 20
```

The production deploy should use the Netlify dashboard or the Netlify CLI:

```bash
npm ci
npm run lint
npm test
npm run build
netlify deploy --prod --dir=dist
```

After deployment, verify the home page, deep links such as `/donate` and `/profile`, Supabase auth redirects, donation method availability, and the `/.netlify/functions/create-payment-intent` endpoint. Confirm that payment provider errors are not displayed with raw provider details.

## 5. Payment readiness

The public donation page currently exposes bank transfer only, and the membership modal keeps Stripe and PayPal disabled until server-side payment reconciliation is implemented. This is intentional: a browser callback alone must not be treated as final settlement. The Netlify Stripe Function still validates amount and currency and returns a generic client-safe error when Stripe cannot initialize.

Before enabling online payments, implement and deploy a signed webhook or other server-side reconciliation path that records the provider event against the intended donation or membership request. Then complete provider tests in the approved test environment, verify that records are created only after authoritative confirmation, and confirm the associated Supabase RLS policies. At that point, enable the guarded payment flags in `MembershipRenewalModal.jsx` and expose the corresponding donation options only after a review of the new flow.

## 6. CI and release workflow

Pull requests and pushes to `main` run `.github/workflows/ci.yml`, which performs dependency installation, strict linting, unit tests, a production build, and a high-severity dependency audit. Security scanning is handled by `.github/workflows/security-scan.yml`. Version tags matching `vX.Y.Z` or `vX.Y.Z-*` trigger `.github/workflows/release.yml`.

Create a release only after the production branch is green:

```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

Review the generated GitHub Release, build artifact, and Netlify deploy status after tagging. Keep the changelog aligned with user-visible changes.

## 7. Rollback and incident response

If a deploy is unhealthy, use Netlify’s deploy history to restore the last known-good deploy, then open an incident issue with the failing commit, route, environment context, and provider error category. Rotate any credential that may have been exposed. Do not paste secrets or payment data into issues, logs, pull requests, or support tickets.
