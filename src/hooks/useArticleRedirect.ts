/**
 * useArticleRedirect Hook
 * Handles redirecting old UUID-based URLs to new slug-based URLs
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ROUTES } from '@/constants/routes';
import { isUUID } from '@/lib/article-utils';

export function useArticleRedirect(slug: string | undefined) {
  const navigate = useNavigate();

  useEffect(() => {
    if (slug && isUUID(slug)) {
      // Fetch article by ID to get the slug
      supabase
        .from('articles')
        .select('slug')
        .eq('id', slug)
        .single()
        .then(({ data }) => {
          if (data?.slug) {
            // Navigate to the new slug URL (replace to mimic 301)
            navigate(ROUTES.ARTICLE(data.slug), { replace: true });
          }
        });
    }
  }, [slug, navigate]);
}
