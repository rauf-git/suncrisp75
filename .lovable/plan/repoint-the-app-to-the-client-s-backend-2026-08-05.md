# Repoint the app to the client's backend

Goal: make the code in the client's GitHub repo talk to the new backend project (`wpxhailrakxuswzleobh`) with no leftover references to the old one.

## Security first

The service role key was pasted in chat. Rotate it in the new backend project's API settings after the handover is done, and never place it in the repo or in any browser-facing variable. It is only needed as a server-side secret for edge functions.

## 1. Code changes in the repo

- `src/integrations/supabase/safeClient.ts` — replace the hardcoded fallback URL and anon key with the new project URL and new anon key.
- `.env` — set `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` to the new values (this file is regenerated inside Lovable, so the values that matter for the live site are the Vercel env vars in step 3).
- `supabase/config.toml` — set `project_id` to the new ref, keep the three `verify_jwt = false` blocks.
- `supabase/functions/send-inquiry-email/index.ts` — update the logo URL to the new project's storage host, and swap the old `*.lovableproject.com` origin in `ALLOWED_ORIGINS` for the live domains.
- `supabase/functions/send-contact-email/index.ts` — same allowed-origins update.

Both functions' CORS lists will be set to: `https://suncrisphospitality.com`, `https://www.suncrisphospitality.com`, plus the `.vercel.app` and `.lovable.app` suffix matches already handled in code.

## 2. Backend work the client must do (outside the repo)

- Confirm the schema, tables, RLS policies, triggers, and the `has_role` / `handle_new_user` functions came across with the project transfer.
- Storage: recreate the public buckets `project-images` and `content-images` if they did not transfer, and re-upload `brand/suncrisp-logo-orange.png` plus all project images. Any image URLs stored in the database still point at the old project host and will need to be updated if the files moved.
- Edge function secrets in the new project: `RESEND_API_KEY` (and `GMAIL_USER` / `GMAIL_APP_PASSWORD` if still used). `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically.
- Deploy the three functions (`send-contact-email`, `send-inquiry-email`, `keep-alive`) to the new project.
- Auth: the admin allowlist in `handle_new_user` uses `suncrisphospitality@gmail.com`; the client must sign up with that email in the new project to get admin, or you add a role row manually.
- Keep-alive cron: repoint it to `https://wpxhailrakxuswzleobh.supabase.co/functions/v1/keep-alive`.

## 3. Vercel

Set these environment variables on the client's Vercel project and redeploy:

- `VITE_SUPABASE_URL` = new project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` = new anon key
- `VITE_SUPABASE_PROJECT_ID` = new project ref

## 4. Verification checklist

- Homepage and portfolio load data from the new backend
- Admin login works and the dashboard can create/edit an item
- Image upload to storage works
- Contact form and a project inquiry form both send email and record a submission
- Keep-alive URL returns `{ ok: true }`

## What I need from you before/while building

Whether the storage buckets and their files already exist in the new project, and whether `RESEND_API_KEY` has been added there. If not, the emails and images will fail even though the code is correct.
