import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://malainaadu.com";
const SITE_NAME = "மலேசியா செய்தி "; // or 'MalaiNaadu'
const NEWS_LANGUAGE = "ta";
const NEWS_LOCALE = "ta_MY";

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Check if article was published within last 48 hours (for Google News)
 */
function isRecentArticle(publishDate: string | null): boolean {
  if (!publishDate) return false;
  const articleDate = new Date(publishDate);
  const now = new Date();
  const hoursDiff = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 48;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch published articles with titles for Google News sitemap
    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("id, slug, title, updated_at, publish_date")
      .eq("status", "published")
      .order("publish_date", { ascending: false })
      .limit(1000);

    if (articlesError) {
      console.error("Error fetching articles:", articlesError);
      throw articlesError;
    }

    // Fetch categories
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("slug, created_at");

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      throw categoriesError;
    }

    // Build XML sitemap with Google News support
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terkini</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/trending</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/kategori</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/cari</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/tentang</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privasi</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terma</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
`;

    // Add category pages
    for (const category of categories || []) {
      xml += `  <url>
    <loc>${SITE_URL}/kategori/${category.slug}</loc>
    <lastmod>${category.created_at || now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // Add article pages with Google News tags for recent articles
    for (const article of articles || []) {
      const lastmod = article.updated_at || article.publish_date || now;
      const articleSlug = article.slug || article.id;
      const isRecent = isRecentArticle(article.publish_date);

      xml += `  <url>
    <loc>${SITE_URL}/berita/${articleSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

      // Add Google News tags for recent articles (last 48 hours)
      if (isRecent && article.title) {
        xml += `
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>ms</news:language>
      </news:publication>
      <news:publication_date>${article.publish_date}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>`;
      }

      xml += `
  </url>
`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
