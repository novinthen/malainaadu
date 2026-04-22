

## Fix Malay Titles in Published Articles

### Why this happened

When Gemini AI translation fails or returns an empty title, `fetch-rss` silently falls back to the **original Malay title** and still publishes the article. There is no Tamil-script validation, so 28 articles slipped through with Malay titles like *"Hidroponik kampung jadi sumber rezeki"* instead of being translated.

Also, the `reprocess-articles` function is written in **Bahasa Malaysia** (not Tamil) and only touches content — it can't fix titles.

### What will be fixed

**1. Harden `fetch-rss` so Malay titles never reach the site again**
- After Gemini returns, validate that the new title contains Tamil characters (Unicode range `\u0B80-\u0BFF`).
- If validation fails on all retries, insert the article with `status: 'pending'` (not `published`) so an admin can review it instead of it appearing on the homepage.
- Upgrade model to `google/gemini-2.5-flash` via Lovable AI Gateway (already used elsewhere, no API key needed) and remove the direct Google API call. This is more reliable and matches the project's standard.

**2. Rewrite `reprocess-articles` to also retranslate titles into Tamil**
- Change the prompt from Bahasa Malaysia to Malaysian Tamil (matching `fetch-rss`).
- Update the function to also retranslate `title` and `excerpt`, not just `content`.
- Add an option to target articles where `title = original_title` (the Malay-leak signature) so we can backfill the 28 broken ones in batches.
- Switch to Lovable AI Gateway as well.

**3. Backfill the 28 existing Malay-titled articles**
- After deploying the fixed `reprocess-articles`, trigger it from the admin Settings page in batches of 10 to retranslate titles, excerpts, and content into proper Tamil.

**4. Admin UI tweak**
- On the admin Settings page (`SettingsPage.tsx`), add a "Reprocess Malay-leaked articles" button that calls the updated function with the new filter, so you can fix this yourself any time it recurs.

### Files affected

- `supabase/functions/fetch-rss/index.ts` — Tamil-script validation + Lovable AI Gateway + pending fallback
- `supabase/functions/reprocess-articles/index.ts` — Tamil prompt + retranslate title/excerpt + Malay-leak filter
- `src/pages/admin/SettingsPage.tsx` — new button to trigger Malay-title backfill
- One-time invocation of `reprocess-articles` to clean up the existing 28 articles

No database schema changes required.

