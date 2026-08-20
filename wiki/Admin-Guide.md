# Administrator Guide & RBAC

The **Admin Dashboard** (`/dashboard/admin`) is the central control panel for managing all association content, user memberships, financial records, and administrative privileges.

---

## 🔑 Role-Based Access Control (RBAC) Matrix

Permissions are stored as a JSON array (`permissions`) in the `profiles` table. The application enforces permissions using the `hasPermission(permName)` helper:

| Permission Name | Accessible Tabs / Capabilities |
|---|---|
| `manage_news` | Full CRUD for News articles and pinning. |
| `manage_events` | Create, edit, delete events; manage attendee lists. |
| `manage_programs` | Create, edit, delete community programs and registrants. |
| `manage_projects` | Create, edit, delete social projects and supporters. |
| `manage_gallery` | Upload photos, edit captions in 3 languages, toggle featured status. |
| `manage_testimonials`| Approve, reject, or delete user-submitted testimonials. |
| `manage_partners` | Add and manage partner logos and URLs. |
| `manage_users` | View all profiles, verify member requests, award gamification points. |
| `manage_donations` | View donation transactions, confirm bank transfers. |
| `manage_branches` | Add, edit, and delete branch locations and map coordinates. |
| `manage_admins` | Grant or revoke administrative permissions for other users. |
| `super_admin` | Unrestricted access across all tabs and operations. |

---

## 📑 Dashboard Tabs Overview

1. **Overview**: Executive summary with total volunteer counts, active programs, donation totals, and pending approvals.
2. **News**: Article editor with multilingual title/content fields and image URL input.
3. **Programs & Projects**: Program goal trackers, start/end dates, and participant rosters.
4. **Events**: Event scheduling, venue details, and attendee export tools.
5. **Gallery**: Image uploader with trilingual captions (`ar`, `fr`, `en`) and category tagging.
6. **Partners**: Partner logos grid and external website links.
7. **Users**: Complete community database with role assignment (`volunteer`, `admin`).
8. **Memberships**: Approval queue for membership applications and commitment forms.
9. **Donations**: Financial records from Stripe, PayPal, and offline wire transfers.
10. **Testimonials**: Moderation queue for community reviews.
11. **Admins**: Security tab for assigning granular permissions to staff members.

---

<div align="center">

**[Les Ambassadeurs du Bien](https://a-a-b-v.netlify.app/)** |
[Repository](https://github.com/Bosaj/les-ambassadeurs-web) |
[Issues](https://github.com/Bosaj/les-ambassadeurs-web/issues) |
[Changelog](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/CHANGELOG.md) |
[Security](https://github.com/Bosaj/les-ambassadeurs-web/blob/main/SECURITY.md)

*Official Documentation for Association des Ambassadeurs du Bien — Oujda*

</div>
