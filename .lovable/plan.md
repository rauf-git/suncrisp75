## Plan: Keep-Alive Endpoint for Lovable Cloud

Lovable Cloud (Supabase) pauses after ~1 week of inactivity. To prevent this, we'll add a tiny public edge function that runs a lightweight DB query on every hit. You then point any free external cron service at its URL (e.g. cron-job.org, UptimeRobot, GitHub Actions) on a weekly schedule.

### What I'll build

**New edge function: `keep-alive`**
- Path: `supabase/functions/keep-alive/index.ts`
- Public (no JWT required) — so a cron pinger can call it without auth
- Runs a minimal `SELECT` (e.g. `count` from `page_blocks` with `head: true`) — this is enough activity to reset the inactivity timer
- Returns `{ ok: true, timestamp }` as JSON
- Includes CORS headers + basic error handling

**Config update**
- Add `[functions.keep-alive]` block with `verify_jwt = false` in `supabase/config.toml`

### The URL you'll use for the cron job

```
https://oxoaoyvvgddqksvdmrkd.supabase.co/functions/v1/keep-alive
```

Method: `GET` (or `POST`, both will work)
No auth header needed.

### How to set up the cron (external, free options)

1. **cron-job.org** (recommended, free, simple)
   - Sign up → Create cronjob → paste the URL above → schedule: every 3 days or weekly
2. **UptimeRobot** (also keeps an uptime log)
   - Add monitor → HTTP(s) → paste URL → interval 5 min or any
3. **GitHub Actions** (if you have a repo)
   - Scheduled workflow that `curl`s the URL

I recommend pinging at least **once every 5 days** to stay safely under the 1-week pause window.

### Why not Supabase's own pg_cron?

`pg_cron` runs inside the database, but if the project is already paused, the cron stops too — so it can't wake itself. The keep-alive must be triggered **externally**.

### Files changed
- `supabase/functions/keep-alive/index.ts` (new)
- `supabase/config.toml` (add function config block)