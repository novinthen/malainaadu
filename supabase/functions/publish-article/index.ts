import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-key",
};

interface ArticlePayload {
  title: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  category_slug?: string;
  publish_date?: string;
  original_url?: string;
  original_title?: string;
  original_content?: string;
  is_featured?: boolean;
  is_breaking?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Validate webhook key
    const webhookKey = req.headers.get("X-Webhook-Key");
    const expectedKey = Deno.env.get("PUBLISH_WEBHOOK_KEY");

    if (!expectedKey) {
      console.error("PUBLISH_WEBHOOK_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!webhookKey || webhookKey !== expectedKey) {
      console.error("Invalid or missing webhook key");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate payload
    const payload: ArticlePayload = await req.json();

    if (!payload.title || typeof payload.title !== "string" || payload.title.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.content || typeof payload.content !== "string" || payload.content.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate title and content length
    if (payload.title.length > 500) {
      return new Response(
        JSON.stringify({ success: false, error: "Title must be less than 500 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (payload.content.length > 100000) {
      return new Response(
        JSON.stringify({ success: false, error: "Content must be less than 100,000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up category by slug if provided
    let categoryId: string | null = null;
    if (payload.category_slug) {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", payload.category_slug)
        .single();

      if (categoryError) {
        console.warn(`Category not found for slug: ${payload.category_slug}`);
      } else {
        categoryId = category.id;
      }
    }

    // Parse publish date
    let publishDate: string;
    if (payload.publish_date) {
      const parsedDate = new Date(payload.publish_date);
      if (isNaN(parsedDate.getTime())) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid publish_date format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      publishDate = parsedDate.toISOString();
    } else {
      publishDate = new Date().toISOString();
    }

    // Insert the article
    const { data: article, error: insertError } = await supabase
      .from("articles")
      .insert({
        title: payload.title.trim(),
        content: payload.content.trim(),
        excerpt: payload.excerpt?.trim() || null,
        image_url: payload.image_url || null,
        category_id: categoryId,
        original_url: payload.original_url || null,
        original_title: payload.original_title || null,
        original_content: payload.original_content || null,
        is_featured: payload.is_featured || false,
        is_breaking: payload.is_breaking || false,
        status: "published",
        publish_date: publishDate,
      })
      .select("id, slug")
      .single();

    if (insertError) {
      console.error("Error inserting article:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create article" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Article created successfully: ${article.id} (${article.slug})`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        article: {
          id: article.id,
          slug: article.slug,
          url: `/article/${article.slug}`,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
