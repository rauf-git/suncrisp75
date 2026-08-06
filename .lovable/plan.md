# Verify the Vercel Cron for `/api/keep-alive`

Goal: confirm the Vercel cron is scheduled correctly and actually invoking the `/api/keep-alive` endpoint.

## 1. Confirm `vercel.json` is valid and deployed

- Check the project root for `vercel.json`.
- Verify it contains a `crons` array with a path of `/api/keep-alive` and the schedule `0 0 */2 * *`.
- If the file is missing or has syntax errors, the cron will not be registered.

## 2. Deploy to Vercel

- Push the current repo to the linked Vercel project.
- Wait for the production build to finish.
- A deployment must be live before the cron is active; local/preview builds do not run Vercel crons.

## 3. Check the Vercel dashboard for the cron

- Open Vercel → select the project → **Settings** → **Cron Jobs**.
- Look for the job pointing to `/api/keep-alive`.
- Confirm the schedule is shown as `0 0 */2 * *` (every 2 days at 00:00 UTC).
- If it is not listed, the `vercel.json` was not parsed or deployed.

## 4. Manually test the endpoint once

- Make a `GET` request to the production URL: `https://<your-domain>/api/keep-alive`.
- Expected: a 200 response with a body that says the Supabase Edge Function was called successfully.
- If it returns an error, check the function logs for the failure reason.

## 5. Watch the cron run

- Vercel crons on Hobby plans can only run once per day at most, and multi-day schedules are best-effort.
- After the scheduled time, open **Vercel → project → Logs → Cron Jobs**.
- Look for the execution of `/api/keep-alive`.
- If it shows success and the timestamp matches the schedule, the cron is working.

## 6. Verify the Supabase Edge Function receives the ping

- Open the Supabase/Lovable Cloud Edge Function logs for `keep-alive`.
- Look for successful invocations that occur shortly after the Vercel cron runs.
- This confirms the full pipeline is alive: Vercel cron → `/api/keep-alive` → Supabase Edge Function → database query.

## 7. Long-term check

- If the project stays deployed and the cron logs show repeated success, Supabase will not pause due to inactivity.
- If any cron execution fails, Vercel will retry; check the failure reason in the cron logs.