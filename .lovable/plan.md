

## Fix RSS Auto-Fetch Schedule

The RSS fetch stopped because there is no active cron job in the database. The `config.toml` schedule definition doesn't apply in Lovable Cloud -- we need a `pg_cron` job that calls the edge function via `pg_net`.

### What Will Be Done

1. **Create a `pg_cron` job** that runs every 15 minutes, calling the `fetch-rss` edge function via `pg_net`
2. **Create a second cron job** for `check-fetch-health` every 30 minutes (also missing)
3. **Trigger an immediate manual fetch** to get articles flowing right away

### Technical Details

We'll run SQL (not via migration, since it contains project-specific URLs/keys) to create two cron jobs:

- **`fetch-rss-every-15min`**: Calls `https://dwopahjycvaocermgesw.supabase.co/functions/v1/fetch-rss` every 15 minutes
- **`check-fetch-health-every-30min`**: Calls `https://dwopahjycvaocermgesw.supabase.co/functions/v1/check-fetch-health` every 30 minutes

Both use `pg_net.http_post()` with the anon key for authorization.

After creating the jobs, we'll manually invoke `fetch-rss` once to immediately start pulling new articles.

