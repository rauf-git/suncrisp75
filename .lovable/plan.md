# Storage migration + keep-alive URL for the new backend

Destination confirmed: `fguhfdfgyaoxtxrcforc` (`https://fguhfdfgyaoxtxrcforc.supabase.co`), publishable key `sb_publishable_nqgDvpngSlkrm7yD84N6Sw_JZ0uTnRv`. The earlier `wpxhailrakxuswzleobh` references in the repo are stale and get replaced.

## Keep-alive cron URL (new project)

Two options, both pointing at the new project:

- Direct edge function (use this in cron-job.org): `https://fguhfdfgyaoxtxrcforc.supabase.co/functions/v1/keep-alive` — POST, headers `apikey` and `Authorization: Bearer <publishable key>`. Requires the `keep-alive` function to be deployed in the new project first.
- Via Vercel: `https://<your-domain>/api/keep-alive` — already wired with the `0 0 */2 * *` cron. It just needs `SUPABASE_URL` and `SUPABASE_ANON_KEY` set to the new project in Vercel (you've done this) and the hardcoded fallback in `api/keep-alive.ts` updated to the new project.

Config edits for this: `api/keep-alive.ts` fallback URL → new project; `src/integrations/supabase/safeClient.ts` fallback URL + key → new project; `supabase/functions/send-inquiry-email/index.ts` logo host → new project.

## Blocker for the Storage copy

The destination **service role key** is still missing — the earlier message pasted the project URL in that field, and a publishable key cannot write into Storage. I'll open a secure secret form for it (`MIGRATION_DEST_SERVICE_ROLE_KEY`) rather than have you paste it in chat. Everything below step "Copy all objects" waits on that.


## What is in the source today (verified)

| Bucket | Visibility | Files | Size |
| --- | --- | --- | --- |
| content-images | public | 71 | ~62.8 MB |
| project-images | public | 48 | ~52.1 MB |
| database_export_06_08_26 | private | 1 | ~0.36 MB |

Total: 120 objects, ~115 MB. The source is treated as read-only throughout.

Database rows containing storage URLs pointing at the old host: projects (4), construction_projects (3), rentals (1), rental_locations (3), page_content (2), page_blocks (1).

## Plan

**1. Create buckets in the destination**
Create `content-images` (public), `project-images` (public), `database_export_06_08_26` (private) if absent, matching source visibility. The last one is a one-off DB dump — I'll ask whether to skip it.

**2. Copy all objects**
A one-off migration script (run in the sandbox, not committed) lists every object in each source bucket recursively, downloads it, and uploads it to the same bucket and path in the destination with the original content type and `upsert: false`. Folder structure and filenames are preserved byte-for-byte. Uploads run in small batches with retries.

**3. Verify counts and integrity**
Re-list both sides and compare per-bucket object counts and byte sizes; report any mismatch by path instead of declaring success.

**4. Storage RLS policies**
Policies on `storage.objects` do not transfer with files. I'll reproduce the source's upload/read policies in the destination so admin uploads keep working — this needs a migration run against the destination, which is outside Lovable's migration tool, so I'll hand you the exact SQL to run in the new project's SQL editor.

**5. Rewrite stored URLs**
Because the host changes, every stored `https://<old-ref>.supabase.co/storage/v1/object/public/...` URL must become the new host. I'll produce a single idempotent SQL `UPDATE` script (using `replace()` on the affected columns/JSON in the 7 tables above) for you to run against the **destination** database after its data import.

**6. Repoint the app config**
- `src/integrations/supabase/safeClient.ts` — fallback URL and key set to `fguhfdfgyaoxtxrcforc`.
- `api/keep-alive.ts` — fallback URL set to `fguhfdfgyaoxtxrcforc`.
- `supabase/functions/send-inquiry-email/index.ts` — logo URL to the new storage host.
- Vercel env (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`) — you've already switched these; redeploy to apply.

Note: this Lovable preview stays wired to the Lovable Cloud backend — Lovable cannot point its own preview at an external project. The repointing above affects the GitHub repo and the Vercel deployment, which is what the live site uses.

**7. Verify in the browser**
After the Vercel redeploy, check homepage, portfolio, a project detail page, and an admin image upload against the new host.

## What you must do manually

- Provide the destination service role key via the secure form.
- Run the storage-policy SQL and the URL-rewrite SQL in the new project (I supply both, ready to paste).
- Add the Vercel env vars and redeploy.
- Rotate the service role key after migration, since keys previously appeared in chat.
