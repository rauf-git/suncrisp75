# Keep-alive against the new backend

Target: `fguhfdfgyaoxtxrcforc` (`https://fguhfdfgyaoxtxrcforc.supabase.co`), publishable key `sb_publishable_nqgDvpngSlkrm7yD84N6Sw_JZ0uTnRv`.

The repo currently points keep-alive at the old `wpxhailrakxuswzleobh` project, so the ping keeps the wrong database awake.

## Simplest working approach: ping the REST API, no edge function needed

A plain read against the Data API counts as database activity, so nothing has to be deployed into the new project.

Cron URL (works in cron-job.org, UptimeRobot, etc.):

```text
https://fguhfdfgyaoxtxrcforc.supabase.co/rest/v1/page_blocks?select=id&limit=1
```

Header required:

```text
apikey: sb_publishable_nqgDvpngSlkrm7yD84N6Sw_JZ0uTnRv
```

A 200 with `[...]` means the database was touched. If the external cron service can't send headers, use the Vercel route below instead.

## Repo changes

1. `api/keep-alive.ts` — point the fallback at the new project and have it hit the REST endpoint above (with the edge function as an optional path only if one is deployed there). This keeps `https://<your-domain>/api/keep-alive` working with the Vercel env vars you already set.
2. `src/integrations/supabase/safeClient.ts` — replace the stale `wpxhailrakxuswzleobh` fallback URL/key with the new project's, so a missing env var can't silently send the live site to the old backend.
3. `supabase/functions/send-inquiry-email/index.ts` — logo URL host updated to the new project.
4. `vercel.json` — cron stays `0 0 */2 * *` on `/api/keep-alive`.

## Verification

After redeploying on Vercel, open `https://<your-domain>/api/keep-alive` — it should return `{ "ok": true, ... }`. Then confirm the job shows a successful run in whichever scheduler you use.

## If you prefer the edge function URL

`https://fguhfdfgyaoxtxrcforc.supabase.co/functions/v1/keep-alive` only works once you deploy the `keep-alive` function into that project yourself — Lovable can't deploy into an external backend. The REST URL above avoids that step entirely.
