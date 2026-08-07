# Storage migration to the new client backend

## Blockers — I need these before anything can run

1. **The destination service role key is missing.** In your message the "Service Role Key" field contains the project URL (`https://fguhfdfgyaoxtxrcforc.supabase.co`), not a key. Copying files into the new project's Storage requires the real service role key of `fguhfdfgyaoxtxrcforc`.
   - Do **not** paste it in chat. I will open a secure secret form for it (`MIGRATION_DEST_SERVICE_ROLE_KEY`) once you confirm.
2. **Which project is the final destination?** The repo was previously repointed to `wpxhailrakxuswzleobh`. This request names `fguhfdfgyaoxtxrcforc`. I need one confirmed destination before updating any config.

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
- `src/integrations/supabase/safeClient.ts` — fallback URL and anon key set to the confirmed destination.
- `supabase/functions/send-inquiry-email/index.ts` — logo URL to the new storage host.
- `api/keep-alive.ts` / Vercel env — `SUPABASE_URL`, `SUPABASE_ANON_KEY` to the new project.
- You set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` in Vercel and redeploy.

Note: this Lovable preview stays wired to the Lovable Cloud backend — Lovable cannot point its own preview at an external project. The repointing above affects the GitHub repo and the Vercel deployment, which is what the live site uses.

**7. Verify in the browser**
After the Vercel redeploy, check homepage, portfolio, a project detail page, and an admin image upload against the new host.

## What you must do manually

- Provide the destination service role key via the secure form.
- Run the storage-policy SQL and the URL-rewrite SQL in the new project (I supply both, ready to paste).
- Add the Vercel env vars and redeploy.
- Rotate the service role key after migration, since keys previously appeared in chat.
