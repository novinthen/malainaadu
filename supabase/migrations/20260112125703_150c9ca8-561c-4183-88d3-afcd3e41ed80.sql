-- Remove unnecessary tracking columns to minimize data collection
-- Keep only article_id and viewed_at for simple view counting

-- First drop the columns
ALTER TABLE public.article_views 
DROP COLUMN IF EXISTS ip_hash,
DROP COLUMN IF EXISTS user_agent;

-- Add comment documenting the privacy-focused approach
COMMENT ON TABLE public.article_views IS 
'Stores anonymous article view records for analytics. 
Privacy-focused: Only stores article reference and timestamp - no user tracking data.
Data retention: Records older than 90 days are automatically cleaned via cleanup_old_article_views().';