# Vercel cron for the keep-alive function

Add a small serverless endpoint on Vercel that pings the backend keep-alive function, and schedule it with Vercel Cron. The React + Vite app is not touched.

## What gets added

1. **`api/keep-alive.ts`** — a Vercel serverless function that:
   - Calls `https://wpxhailrakxuswzleobh.supabase.co/functions/v1/keep-alive` with the anon key in the `apikey`/`Authorization` headers (read from env, with the project URL as fallback).
   - Returns the upstream JSON plus a timestamp, `200` on success and `500` on failure.
   - Optionally verifies Vercel's `x-vercel-cron` header / a `CRON_SECRET` so the endpoint isn't trivially spammable.

2. **`vercel.json`** — keep the existing SPA rewrite but exclude `/api/*` so the rewrite doesn't swallow the endpoint, and add the cron entry:

```text
rewrites: /((?!api/).*)  ->  /index.html
crons:    /api/keep-alive  every 6 hours  ("0 */6 * * *")
```

## Schedule: every ~1.5 days

Cron has no way to express "every 36 hours" — intervals must divide evenly into days. The closest practical option is **every 2 days at midnight**: `0 0 */2 * *`. That's well inside the 7-day inactivity window.

Note: on the Vercel **Hobby** plan, cron schedules are limited to once per day, so `0 0 */2 * *` may be coerced to a daily run. Either way the backend stays awake.

The plan ships `0 0 */2 * *`.


## Environment variables (Vercel project settings)

- `SUPABASE_URL` (or reuse `VITE_SUPABASE_URL`) — `https://wpxhailrakxuswzleobh.supabase.co`
- `SUPABASE_ANON_KEY` (or reuse `VITE_SUPABASE_PUBLISHABLE_KEY`) — new anon key
- `CRON_SECRET` (optional) — auto-sent by Vercel Cron as a bearer token if defined

## Verification

- Deploy, then open `https://<domain>/api/keep-alive` → should return `{ ok: true, ... }`.
- Confirm the cron appears under Vercel → Project → Cron Jobs and shows a successful run.
- App routes (`/`, `/portfolio`, deep links) still load — the rewrite change is regex-only.
