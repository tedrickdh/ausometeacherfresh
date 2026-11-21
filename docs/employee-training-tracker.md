# Employee training tracker — implementation staging

**Status:** Development branch only. Not deployed. Database not migrated.

## Architecture
- Supabase Auth: admin-invited employee accounts; disable public signups.
- Supabase Postgres: staff, courses, assignments, progress, attempts, certificates.
- RLS: employees see only their own records; admins can see assignments, progress, scores, certificates.
- Trusted server-side assessment scorer required before launch. Never trust scores from browser JavaScript.
- Certificates must be issued by the trusted scorer only after an 80% pass.
- Existing course is still browser-local; it is **not yet connected** to this schema.

## Setup checklist
1. Confirm intended Supabase project. The connected project `cyadhbwjfhdolaszbviw` is currently INACTIVE and its name does not explicitly identify this website.
2. Review `supabase/employee_training_schema.sql`, then apply to the correct project.
3. Disable self-signup in Supabase Auth; invite employees and set training_admin in **app_metadata** for administrator accounts only.
4. Add Supabase publishable key and URL to client configuration (never a secret/service_role key).
5. Implement secure scorer using a Supabase Edge Function and server-only answer key, with rate limits and atomic attempt count.
6. Connect the existing 36-screen course to auth, assignments, module progress, assessment submissions and certificates.
7. Build admin dashboard, learner view, CSV export, reminders and accessibility checks.
8. Test with a test employee and test admin before merging to main and checking GitHub Actions / Hostinger.

The training route remains unlisted; unlisted does **not** mean access-controlled.
