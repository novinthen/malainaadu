import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-platform, x-device-token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    total_pages?: number;
    query?: string;
    redirected_from?: string;
  };
}

function jsonResponse(data: ApiResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ success: false, error: message }, status);
}

// Calculate estimated read time (words per minute)
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// Transform article for mobile response
function transformArticle(article: any) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    image_url: article.image_url,
    category: article.category ? {
      id: article.category.id,
      name: article.category.name,
      slug: article.category.slug,
    } : null,
    source: article.source ? {
      name: article.source.name,
      logo_url: article.source.logo_url,
    } : null,
    is_featured: article.is_featured,
    is_breaking: article.is_breaking,
    view_count: article.view_count,
    publish_date: article.publish_date,
    read_time: calculateReadTime(article.content || ''),
  };
}

// Transform article detail (includes full content)
function transformArticleDetail(article: any) {
  return {
    ...transformArticle(article),
    content: article.content,
    original_url: article.original_url,
    created_at: article.created_at,
    updated_at: article.updated_at,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Remove 'mobile-api' from path if present
    const apiIndex = pathParts.indexOf('mobile-api');
    const path = apiIndex >= 0 ? pathParts.slice(apiIndex + 1) : pathParts;
    
    // Parse common query params
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get('per_page') || '20')));
    const since = url.searchParams.get('since');
    const sort = url.searchParams.get('sort') || 'publish_date';
    const order = url.searchParams.get('order') === 'asc' ? true : false;

    console.log(`[Mobile API] ${req.method} /${path.join('/')} - Page: ${page}, PerPage: ${perPage}`);

    // ============================================
    // GET /categories - List all categories
    // ============================================
    if (path[0] === 'categories' && req.method === 'GET') {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;

      return jsonResponse({
        success: true,
        data: categories,
      });
    }

    // ============================================
    // GET /news/featured - Featured & latest articles
    // ============================================
    if (path[0] === 'news' && path[1] === 'featured' && req.method === 'GET') {
      // Get total count
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      let query = supabase
        .from('articles')
        .select(`
          id, slug, title, excerpt, image_url, is_featured, is_breaking, view_count, publish_date, content,
          category:categories(id, name, slug),
          source:sources(name, logo_url)
        `)
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('publish_date', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

      if (since) {
        query = query.gte('publish_date', since);
      }

      const { data: articles, error } = await query;
      if (error) throw error;

      return jsonResponse({
        success: true,
        data: articles?.map(transformArticle) || [],
        meta: {
          page,
          per_page: perPage,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / perPage),
        },
      });
    }

    // ============================================
    // GET /news/trending - Trending by view count
    // ============================================
    if (path[0] === 'news' && path[1] === 'trending' && req.method === 'GET') {
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      const { data: articles, error } = await supabase
        .from('articles')
        .select(`
          id, slug, title, excerpt, image_url, is_featured, is_breaking, view_count, publish_date, content,
          category:categories(id, name, slug),
          source:sources(name, logo_url)
        `)
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .order('publish_date', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

      if (error) throw error;

      return jsonResponse({
        success: true,
        data: articles?.map(transformArticle) || [],
        meta: {
          page,
          per_page: perPage,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / perPage),
        },
      });
    }

    // ============================================
    // GET /news/breaking - Breaking news
    // ============================================
    if (path[0] === 'news' && path[1] === 'breaking' && req.method === 'GET') {
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .eq('is_breaking', true);

      const { data: articles, error } = await supabase
        .from('articles')
        .select(`
          id, slug, title, excerpt, image_url, is_featured, is_breaking, view_count, publish_date, content,
          category:categories(id, name, slug),
          source:sources(name, logo_url)
        `)
        .eq('status', 'published')
        .eq('is_breaking', true)
        .order('publish_date', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

      if (error) throw error;

      return jsonResponse({
        success: true,
        data: articles?.map(transformArticle) || [],
        meta: {
          page,
          per_page: perPage,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / perPage),
        },
      });
    }

    // ============================================
    // GET /news/category/:slug - Articles by category
    // ============================================
    if (path[0] === 'news' && path[1] === 'category' && path[2] && req.method === 'GET') {
      const categorySlug = path[2];

      // First get the category
      const { data: category, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', categorySlug)
        .single();

      if (catError || !category) {
        return errorResponse('Category not found', 404);
      }

      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .eq('category_id', category.id);

      let query = supabase
        .from('articles')
        .select(`
          id, slug, title, excerpt, image_url, is_featured, is_breaking, view_count, publish_date, content,
          category:categories(id, name, slug),
          source:sources(name, logo_url)
        `)
        .eq('status', 'published')
        .eq('category_id', category.id)
        .order('publish_date', { ascending: order })
        .range((page - 1) * perPage, page * perPage - 1);

      if (since) {
        query = query.gte('publish_date', since);
      }

      const { data: articles, error } = await query;
      if (error) throw error;

      return jsonResponse({
        success: true,
        data: {
          category,
          articles: articles?.map(transformArticle) || [],
        },
        meta: {
          page,
          per_page: perPage,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / perPage),
        },
      });
    }

    // ============================================
    // GET /news/search?q=query - Search articles
    // ============================================
    if (path[0] === 'news' && path[1] === 'search' && req.method === 'GET') {
      const query = url.searchParams.get('q');

      if (!query || query.trim().length < 2) {
        return errorResponse('Search query must be at least 2 characters', 400);
      }

      const searchTerm = `%${query.trim()}%`;

      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm},excerpt.ilike.${searchTerm}`);

      const { data: articles, error } = await supabase
        .from('articles')
        .select(`
          id, slug, title, excerpt, image_url, is_featured, is_breaking, view_count, publish_date, content,
          category:categories(id, name, slug),
          source:sources(name, logo_url)
        `)
        .eq('status', 'published')
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
        .order('publish_date', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

      if (error) throw error;

      return jsonResponse({
        success: true,
        data: articles?.map(transformArticle) || [],
        meta: {
          page,
          per_page: perPage,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / perPage),
          query: query.trim(),
        },
      });
    }

    // ============================================
    // GET /news/:slug - Single article detail
    // ============================================
    if (path[0] === 'news' && path[1] && !['featured', 'trending', 'breaking', 'category', 'search'].includes(path[1]) && req.method === 'GET') {
      const slug = path[1];

      const { data: article, error } = await supabase
        .from('articles')
        .select(`
          id, slug, title, content, excerpt, image_url, is_featured, is_breaking, view_count, 
          publish_date, original_url, created_at, updated_at,
          category:categories(id, name, slug),
          source:sources(name, logo_url)
        `)
        .eq('status', 'published')
        .eq('slug', slug)
        .single();

      if (error || !article) {
        // Try to find by previous slug (redirect)
        const { data: redirectArticle } = await supabase
          .from('articles')
          .select(`
            id, slug, title, content, excerpt, image_url, is_featured, is_breaking, view_count, 
            publish_date, original_url, created_at, updated_at,
            category:categories(id, name, slug),
            source:sources(name, logo_url)
          `)
          .eq('status', 'published')
          .contains('previous_slugs', [slug])
          .single();

        if (redirectArticle) {
          return jsonResponse({
            success: true,
            data: transformArticleDetail(redirectArticle),
            meta: {
              redirected_from: slug,
            },
          });
        }

        return errorResponse('Article not found', 404);
      }

      // Record view
      await supabase.from('article_views').insert({ article_id: article.id });

      // Update view count
      await supabase
        .from('articles')
        .update({ view_count: (article.view_count || 0) + 1 })
        .eq('id', article.id);

      return jsonResponse({
        success: true,
        data: transformArticleDetail(article),
      });
    }

    // ============================================
    // POST /notifications/subscribe - Subscribe to push
    // ============================================
    if (path[0] === 'notifications' && path[1] === 'subscribe' && req.method === 'POST') {
      const body = await req.json();
      const { device_token, platform, device_info, categories } = body;

      if (!device_token || !platform) {
        return errorResponse('device_token and platform are required', 400);
      }

      if (!['android', 'ios'].includes(platform)) {
        return errorResponse('platform must be android or ios', 400);
      }

      // Upsert subscriber
      const { data, error } = await supabase
        .from('push_subscribers')
        .upsert({
          device_token,
          platform,
          device_info: device_info || {},
          categories: categories || [],
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'device_token',
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`[Push] Subscribed device: ${platform} - ${device_token.substring(0, 20)}...`);

      return jsonResponse({
        success: true,
        data: {
          id: data.id,
          subscribed: true,
          categories: data.categories,
        },
      });
    }

    // ============================================
    // POST /notifications/unsubscribe - Unsubscribe
    // ============================================
    if (path[0] === 'notifications' && path[1] === 'unsubscribe' && req.method === 'POST') {
      const body = await req.json();
      const { device_token } = body;

      if (!device_token) {
        return errorResponse('device_token is required', 400);
      }

      const { error } = await supabase
        .from('push_subscribers')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('device_token', device_token);

      if (error) throw error;

      console.log(`[Push] Unsubscribed device: ${device_token.substring(0, 20)}...`);

      return jsonResponse({
        success: true,
        data: { unsubscribed: true },
      });
    }

    // ============================================
    // GET /stats - API stats (optional)
    // ============================================
    if (path[0] === 'stats' && req.method === 'GET') {
      const [articlesResult, categoriesResult, subscribersResult] = await Promise.all([
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('push_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      return jsonResponse({
        success: true,
        data: {
          total_articles: articlesResult.count || 0,
          total_categories: categoriesResult.count || 0,
          active_subscribers: subscribersResult.count || 0,
          api_version: '1.0.0',
        },
      });
    }

    // ============================================
    // Health check
    // ============================================
    if (path[0] === 'health' || path.length === 0) {
      return jsonResponse({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    // Not found
    return errorResponse(`Endpoint not found: /${path.join('/')}`, 404);

  } catch (error: unknown) {
    console.error('[Mobile API Error]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 500);
  }
});
