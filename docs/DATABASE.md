Database Schema

See Supabase project for full schema.

Key Tables:
- profiles: user accounts with role/permissions
- gallery_images: photos with JSONB multilingual captions
- news/events/programs/projects: content with JSONB titles
- donations: payment records (Stripe/PayPal/bank)
- notifications: real-time user notifications
- branches: association branches with map coordinates