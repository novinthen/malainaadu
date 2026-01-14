/**
 * useArticleRedirect Hook
 * Handles redirecting old URLs to new slug-based URLs:
 * - UUID-based URLs -> current slug
 * - Old slugs (from previous_slugs) -> current slug
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ROUTES } from '@/constants/routes';
import { isUUID } from '@/lib/article-utils';

export function useArticleRedirect(slug: string | undefined) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;

    const checkAndRedirect = async () => {
      // Case 1: UUID-based URL - redirect to slug
      if (isUUID(slug)) {
        const { data } = await supabase
          .from('articles')
          .select('slug')
          .eq('id', slug)
          .single();

        if (data?.slug) {
          navigate(ROUTES.ARTICLE(data.slug), { replace: true });
        }
        return;
      }

      // Case 2: Check if this is an old slug that needs redirect
      // First check if current slug exists
      const { data: currentArticle } = await supabase
        .from('articles')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      // If article found with current slug, no redirect needed
      if (currentArticle) return;

      // Check if slug exists in previous_slugs
      const { data: redirectArticle } = await supabase
        .from('articles')
        .select('slug')
        .contains('previous_slugs', [slug])
        .maybeSingle();

      if (redirectArticle?.slug && redirectArticle.slug !== slug) {
        // Redirect to the new slug (replace to mimic 301 behavior)
        navigate(ROUTES.ARTICLE(redirectArticle.slug), { replace: true });
      }
    };

    checkAndRedirect();
  }, [slug, navigate]);
}
