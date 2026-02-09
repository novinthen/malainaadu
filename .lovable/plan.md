

## Plan: Fix RSS Fetch Failures (Root Cause: Gemini Timeouts)

### Problem Summary

| Issue | Detail |
|-------|--------|
| Last fetch | Feb 3, 2026 (6 days ago) |
| Function status | Timing out on manual trigger |
| Cron status | Not executing (likely disabled after repeated timeouts) |
| Root cause | Gemini API rate limits (429) cause retries, which push execution past Edge Function timeout |
| Data issue | All recent articles have `publish_date = NULL` |

### Root Cause Chain

```text
Gemini 429 Rate Limit
  --> Retry logic adds 1s + 2s + 4s delays per article
  --> 25 articles x (processing + retries + 1s delay) = exceeds timeout
  --> Edge Function killed (context canceled)
  --> Cron scheduler sees failure, stops retrying
```

### Solution: Process in Small Batches

Instead of processing all articles in one function call, limit each run to a small batch (5 articles max). This keeps execution time well within limits.

---

### Phase 1: Batch Processing in fetch-rss

**File: `supabase/functions/fetch-rss/index.ts`**

1. **Limit articles per run to 5** - After collecting RSS items from all sources, only process the first 5 unprocessed articles per execution
2. **Reduce retry attempts from 3 to 2** - Less retry overhead per run
3. **Add total execution time guard** - If approaching 50 seconds, stop processing and return partial results
4. **Graceful fallback** - If Gemini fails after retries, insert article with original content (no AI rewrite) rather than skipping entirely

### Phase 2: Fix publish_date NULL Issue

**Database migration:**

Update all published articles that have `publish_date = NULL` to use their `created_at` timestamp instead. Also ensure the insert logic in `fetch-rss` always sets `publish_date`.

**SQL:**
```sql
UPDATE articles 
SET publish_date = created_at 
WHERE publish_date IS NULL AND status = 'published';
```

### Phase 3: Redeploy to Reset Cron

Redeploying the edge function will re-register the cron schedule, which should restart the 15-minute cycle.

---

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/fetch-rss/index.ts` | Add batch limit (5 articles), execution time guard, always set publish_date |
| Database migration | Fix existing NULL publish_date values |

### Expected Outcome

- Each cron run processes max 5 articles in ~25 seconds (well within timeout)
- Over 3 cron runs (45 minutes), all 15+ new articles get processed
- No more timeouts, cron stays active
- All articles get proper publish_date values

