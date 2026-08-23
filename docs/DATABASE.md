# Supabase Database and Row Level Security

The repository does not contain a `supabase/` migration directory, so this document is a verification contract rather than an assertion about the live project. Confirm the target Supabase project before applying any SQL. Do not run these checks against an unrelated project.

## Application tables

The client currently expects the following tables or views: `profiles`, `news`, `events`, `event_attendees`, `donations`, `annual_memberships`, `gallery_images`, `images`, `notifications`, `problem_reports`, `event_suggestions`, `badge_definitions`, `branches`, `partners`, `testimonials`, and `receipts`.

## Required RLS posture

Enable Row Level Security on every table exposed through the public Supabase API. Frontend role checks are only a usability guard; they are not an authorization boundary. Policies must use `auth.uid()` and a server-maintained administrator predicate such as an approved `is_admin(auth.uid())` database function. Do not trust a `role` value submitted by the browser.

| Data set | Anonymous access | Authenticated member access | Administrator access |
| --- | --- | --- | --- |
| Published news, events, programs, projects, partners, testimonials, branches, and public gallery metadata | Read only for published/approved rows. | Same public read plus permitted member actions. | Full CRUD. |
| `event_attendees` | Do not expose email addresses or user IDs through public joins. Guest registration, if retained, must be rate-limited and narrowly validated. | Read and delete only the caller’s own rows; insert with `user_id = auth.uid()`. | Read, approve/reject, and delete all rows. |
| `profiles` | No profile listing. | Read/update only the caller’s own profile fields; never allow self-escalation of role, permissions, payment status, or membership status. | Read and update approved administrative fields. |
| `donations` | If anonymous donations are supported, permit only a constrained insert of a pending record; never permit status updates or reads. | Read only rows owned by `user_id = auth.uid()`; insert only pending rows with the caller’s ID. | Read, reconcile, approve, and delete according to an audited policy. |
| `annual_memberships` | No access. | Read own history and submit a pending request for own user ID. Never allow the browser to set `paid` or activate membership. | Review and reconcile records; membership activation must be an audited admin or server-side operation. |
| `notifications` | No access. | Read, mark read, or delete only rows whose `user_id = auth.uid()`. | Create notifications through an approved admin/server path. |
| `event_suggestions` and `problem_reports` | Only allow anonymous submissions if the product explicitly requires them and abuse controls exist. | Insert and read only the caller’s own submissions. | Read and process all submissions. |

The database must also validate numeric donation and membership amounts, permitted status values, supported payment methods, ownership relationships, and required fields. A frontend `min` attribute or JavaScript check is not sufficient.

## Storage buckets

Keep payment proofs and membership receipts in private buckets. The client should store a non-sensitive object path, not a permanent public URL. Administrators should receive short-lived signed URLs only after an RLS-controlled authorization check. Public buckets are appropriate only for deliberately public gallery and avatar assets. Enforce MIME type, size, and path ownership in storage policies; do not rely on the file extension supplied by a browser.

## Payment reconciliation requirement

The Stripe and PayPal browser callbacks are not authoritative settlement records. A production payment design must verify provider signatures server-side, map the provider event to an internal pending record, enforce idempotency, and update payment status in a server-controlled path. Until that exists, this application intentionally keeps online checkout disabled and records manual requests as pending.

## Verification procedure

Run the following checks against a staging project first, using an anonymous client, an ordinary member, and an administrator account. Confirm that anonymous users cannot list profiles, donations, memberships, notifications, or receipts; that a member cannot read or mutate another member’s records; that a member cannot set `status = 'paid'`, `membership_status = 'active'`, or an administrator role; and that an administrator can perform only the documented moderation actions. Test storage access with both a guessed path and a valid signed URL. Record the policy names and migration revision used for the production project in the deployment change record.
