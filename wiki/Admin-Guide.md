# Administrator Guide & RBAC

The **Admin Dashboard** (`/dashboard/admin`) provides full administrative control over all content, users, and association operations.

---

## 🔑 Role-Based Access Control (RBAC) Matrix

Permissions are stored as a JSONB array in `profiles.permissions`. The app evaluates access using `hasPermission(permissionName)`:

| Permission Name | Authorized Capabilities |
|---|---|
| `manage_news` | Create, edit, delete news articles; toggle pinned status. |
| `manage_events` | Create, edit, delete events; manage attendee registrations. |
| `manage_programs` | Create, edit, delete community programs and beneficiary lists. |
| `manage_projects` | Create, edit, delete development projects and supporter records. |
| `manage_gallery` | Upload photos to Supabase Storage, manage trilingual captions, toggle featured status. |
| `manage_testimonials` | Moderate, approve, or reject user-submitted testimonials. |
| `manage_partners` | Add, update, and remove sponsor and partner logos. |
| `manage_users` | View full user directory, verify membership applications, award gamification points. |
| `manage_donations` | View financial records from Stripe and PayPal; manually verify bank transfers. |
| `manage_branches` | Create and edit branch locations, addresses, and map GPS coordinates. |
| `manage_admins` | Grant or revoke administrative privileges for other volunteer accounts. |
| `super_admin` | Unrestricted global access across all administrative panels. |

---

## 📑 Admin Dashboard Tabs

1. **Overview**: Key metrics (total volunteers, active projects, donations, pending member requests).
2. **News**: Article publisher with multilingual title/content fields and image URL input.
3. **Programs & Projects**: Manage goals, execution dates, and participant rosters.
4. **Events**: Schedule association events, assign venues, and view attendee lists.
5. **Gallery**: Image manager with trilingual captions (`ar`, `fr`, `en`) and category selection.
6. **Partners**: Manage partner organization profiles and logos.
7. **Users**: User account management and role promotions.
8. **Memberships**: Approval queue for new volunteer membership requests.
9. **Donations**: Financial ledger tracking Stripe, PayPal, and bank wire contributions.
10. **Testimonials**: Community review moderation.
11. **Branches**: Branch chapter manager with Leaflet GPS coordinates.
12. **Admins**: RBAC permission management for administrative team members.
