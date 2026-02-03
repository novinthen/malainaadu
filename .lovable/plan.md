

## Plan: Fix RSS Fetching & Add Reliability Improvements

### Problem Analysis

Based on investigation:

| Finding | Detail |
|---------|--------|
| **Last Gap** | Jan 22 - Feb 3 (12 days no articles) |
| **Current Status** | Function IS working now (25 articles fetched today) |
| **Rate Limits** | Frequent Gemini API 429 errors during processing |
| **Cron Issue** | Schedule configured but wasn't executing reliably |

### Solution Overview

```text
+------------------+     +-------------------+     +------------------+
|  Fix Rate Limits |---->| Improve Resilience|---->| Add Monitoring   |
|  - Use Lovable AI|     | - Retry logic     |     | - Health alerts  |
|  - Add delays    |     | - Better timeouts |     | - Admin dashboard|
+------------------+     +-------------------+     +------------------+
```

---

### Phase 1: Replace Gemini with Lovable AI

**Why**: Lovable AI is built-in, requires no API key, and avoids external rate limits.

**Changes to `supabase/functions/fetch-rss/index.ts`:**

1. Replace Gemini API call with Lovable AI endpoint
2. Use `google/gemini-2.5-flash` model (balanced speed/quality)
3. Remove dependency on GEMINI_API_KEY secret

```typescript
// Before: External Gemini API
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
  ...
);

// After: Lovable AI (no API key needed)
const response = await fetch(
  'https://dwopahjycvaocermgesw.supabase.co/functions/v1/lovable-ai',
  {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }]
    })
  }
);
```

---

### Phase 2: Add Rate Limit Handling & Retry Logic

**Add exponential backoff for API calls:**

```typescript
async function processWithRetry(
  title: string,
  description: string,
  categories: Category[],
  maxRetries = 3
): Promise<ProcessedArticle> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await processWithAI(title, description, categories);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Retry ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Increase delay between articles:**

```typescript
// Before: 300ms delay
await new Promise((resolve) => setTimeout(resolve, 300));

// After: 1000ms delay (1 second) to avoid rate limits
await new Promise((resolve) => setTimeout(resolve, 1000));
```

---

### Phase 3: Add Fetch Health Monitoring to Admin Dashboard

**Create admin dashboard component showing:**

1. Last successful fetch time
2. Articles processed today
3. System health status (healthy/warning/error)
4. Recent fetch logs with errors

**New file: `src/components/admin/FetchHealthCard.tsx`**

```typescript
// Shows:
// - ✅ "Healthy" if last fetch < 30 min ago
// - ⚠️ "Warning" if last fetch 30-60 min ago  
// - ❌ "Error" if last fetch > 60 min ago or failed
// - Articles processed today
// - Button to manually trigger fetch
```

**Update admin dashboard page to include the health card.**

---

### Phase 4: Improve Health Check Alerts

**Enhance `check-fetch-health` edge function:**

1. Add more detailed alert messages
2. Include link to admin dashboard
3. Track alert history to prevent spam

---

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/fetch-rss/index.ts` | Replace Gemini with Lovable AI, add retry logic, increase delays |
| `src/hooks/useFetchHealth.ts` | Already exists - enhance with more metrics |
| `src/components/admin/FetchHealthCard.tsx` | Create - health status card for dashboard |
| `src/pages/admin/AdminDashboard.tsx` | Add FetchHealthCard component |
| `supabase/functions/check-fetch-health/index.ts` | Improve alert messages |

---

### Expected Outcomes

| Improvement | Benefit |
|-------------|---------|
| **Lovable AI** | No external API key dependency, no rate limits |
| **Retry Logic** | Resilient to temporary failures |
| **Slower Processing** | Reduces rate limit hits |
| **Health Dashboard** | Immediate visibility into system status |
| **Better Alerts** | Faster detection of failures |

---

### Technical Notes

- The cron schedule (`*/15 * * * *`) in config.toml is correct
- Lovable Cloud handles Edge Function scheduling automatically
- The 12-day gap was likely due to deployment issues, not configuration
- Current function is working - these changes prevent future issues

