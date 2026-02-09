import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  imageUrl: string | null;
}

interface Source {
  id: string;
  name: string;
  rss_url: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Helper function to fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Parse RSS XML to extract items
function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  
  // Extract all <item> elements
  const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
  
  for (const itemXml of itemMatches) {
    // Extract title
    const titleMatch = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const title = titleMatch ? cleanText(titleMatch[1]) : '';
    
    // Extract link
    const linkMatch = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const link = linkMatch ? cleanText(linkMatch[1]) : '';
    
    // Extract description
    const descMatch = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const description = descMatch ? cleanText(descMatch[1]) : '';
    
    // Extract pubDate
    const dateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
    const pubDate = dateMatch ? dateMatch[1].trim() : '';
    
    // Extract image from various possible locations
    let imageUrl: string | null = null;
    
    // Try media:content
    const mediaMatch = itemXml.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/i);
    if (mediaMatch) imageUrl = mediaMatch[1];
    
    // Try enclosure
    if (!imageUrl) {
      const enclosureMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image[^"']*["'][^>]*>/i);
      if (enclosureMatch) imageUrl = enclosureMatch[1];
    }
    
    // Try image tag in description
    if (!imageUrl) {
      const imgMatch = description.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
      if (imgMatch) imageUrl = imgMatch[1];
    }
    
    if (title && link) {
      items.push({
        title,
        link,
        description: stripHtml(description),
        pubDate,
        imageUrl,
      });
    }
  }
  
  return items;
}

// Clean text by removing CDATA markers and trimming
function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .trim();
}

// Strip HTML tags from text
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Use Google Gemini to rewrite article and categorize
async function processWithGemini(
  title: string,
  description: string,
  categories: Category[],
  geminiApiKey: string
): Promise<{ newTitle: string; content: string; excerpt: string; categorySlug: string }> {
  const categoryList = categories.map(c => c.slug).join(', ');
  
  const prompt = `நீங்கள் ஒரு தொழில்முறை மலேசிய தமிழ் செய்தி ஆசிரியர். இந்த செய்தியை மலேசிய தமிழில் மறுபடி எழுதுங்கள்.

ORIGINAL TITLE: ${title}

ORIGINAL CONTENT: ${description}

INSTRUCTIONS:
1. Write an engaging, SEO-friendly title in Malaysian Tamil (maximum 80 characters)
2. Rewrite the content in 200-300 words in professional, neutral Malaysian Tamil. IMPORTANT: Split content into 3-4 paragraphs using \\n\\n between paragraphs.
3. Create a brief excerpt/summary in 1-2 sentences (maximum 160 characters) in Tamil
4. Choose the most appropriate category from this list: ${categoryList}

IMPORTANT: 
- Write in third-person neutral perspective. Focus on facts.
- Use Malaysian Tamil (மலேசிய தமிழ்) - use local Malaysian terms where appropriate
- Do NOT use Indian Tamil spellings/terms - adapt to Malaysian context
- Keep proper nouns (names, places) as they are

Reply in JSON format only:
{
  "title": "தமிழ் தலைப்பு இங்கே",
  "content": "முதல் பத்தி...\\n\\nஇரண்டாவது பத்தி...\\n\\nமூன்றாவது பத்தி...",
  "excerpt": "சுருக்கமான தமிழ் சுருக்கம்...",
  "category": "category_slug"
}`;

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    },
    20000 // 20 second timeout for AI processing
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Gemini response");
  }
  
  const result = JSON.parse(jsonMatch[0]);
  
  return {
    newTitle: result.title || title,
    content: result.content || description,
    excerpt: result.excerpt || description.substring(0, 160),
    categorySlug: result.category || "nasional",
  };
}

// Wrapper with exponential backoff retry logic
async function processWithRetry(
  title: string,
  description: string,
  categories: Category[],
  geminiApiKey: string,
  maxRetries = 2
): Promise<{ newTitle: string; content: string; excerpt: string; categorySlug: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await processWithGemini(title, description, categories, geminiApiKey);
    } catch (error) {
      console.error(`AI processing attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        // Fallback: return original content
        console.log("Max retries exceeded, using fallback content");
        return {
          newTitle: title,
          content: description,
          excerpt: description.substring(0, 160),
          categorySlug: "nasional",
        };
      }
      
      // Exponential backoff: 1s, 2s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Retry ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  // Should never reach here but TypeScript requires it
  return {
    newTitle: title,
    content: description,
    excerpt: description.substring(0, 160),
    categorySlug: "nasional",
  };
}

// Send article to Make.com webhook - returns true if successful
async function sendToMakeWebhook(
  articleData: {
    article_id: string;
    title: string;
    excerpt: string;
    content: string;
    image_url: string | null;
    article_url: string;
    category: string;
    source_name: string;
    published_at: string | null;
  }
): Promise<boolean> {
  const makeWebhookUrl = Deno.env.get("MAKE_WEBHOOK_URL");
  
  if (!makeWebhookUrl) {
    console.log("MAKE_WEBHOOK_URL not configured, skipping webhook");
    return false;
  }

  try {
    console.log(`Sending to Make.com: ${articleData.title.substring(0, 40)}...`);
    
    const response = await fetchWithTimeout(
      makeWebhookUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articleData),
      },
      5000 // 5 second timeout
    );

    if (!response.ok) {
      console.error(`Make.com webhook error: ${response.status}`);
      return false;
    } else {
      console.log(`Successfully sent to Make.com: ${articleData.article_id}`);
      return true;
    }
  } catch (error) {
    // Log but don't throw - webhook failure shouldn't block article processing
    console.error("Make.com webhook failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

serve(async (req) => {
  const startTime = Date.now();
  console.log("=== fetch-rss function started ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Request method:", req.method);

  // Initialize Supabase client for logging
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const logClient = createClient(supabaseUrl, supabaseServiceKey);

  // Create fetch log entry
  let fetchLogId: string | null = null;
  try {
    const { data: logEntry, error: logError } = await logClient
      .from("fetch_logs")
      .insert({
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (!logError && logEntry) {
      fetchLogId = logEntry.id;
      console.log("Created fetch log entry:", fetchLogId);
    }
  } catch (e) {
    console.error("Failed to create fetch log:", e);
  }

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Authentication check - allow cron (no auth header) OR authenticated admin users
  const authHeader = req.headers.get("Authorization");
  // Cron triggers have no Authorization header - trust them since verify_jwt is false in config.toml
  const isCronTrigger = !authHeader;
  
  console.log("Has auth header:", !!authHeader);
  console.log("Is cron trigger:", isCronTrigger);
  
  if (!isCronTrigger) {
    // Manual trigger - require admin authentication
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin role using service role client
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleError } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", claimsData.user.id)
      .in("role", ["admin", "moderator"])
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Manual trigger by admin user: ${claimsData.user.id}`);
  } else {
    console.log("Cron-triggered execution");
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY is not configured");
      throw new Error("GEMINI_API_KEY is not configured");
    }

    console.log("Environment variables loaded successfully");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get active sources
    const { data: sources, error: sourcesError } = await supabase
      .from("sources")
      .select("*")
      .eq("is_active", true);

    if (sourcesError) {
      console.error("Error fetching sources:", sourcesError);
      throw sourcesError;
    }

    console.log(`Found ${sources?.length || 0} active sources`);

    if (!sources?.length) {
      return new Response(
        JSON.stringify({ message: "No active sources found", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get categories for AI categorization
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*");

    if (catError) {
      console.error("Error fetching categories:", catError);
      throw catError;
    }

    console.log(`Found ${categories?.length || 0} categories`);

    let totalProcessed = 0;
    let totalSkipped = 0;
    const errors: string[] = [];
    const MAX_ARTICLES_PER_RUN = 5;
    const TIME_LIMIT_MS = 50000; // 50 seconds - stop before timeout
    let hitTimeLimit = false;

    // Collect all new RSS items from all sources first
    interface PendingArticle {
      item: RSSItem;
      source: Source;
    }
    const pendingArticles: PendingArticle[] = [];

    for (const source of sources as Source[]) {
      console.log(`Fetching RSS from: ${source.name} (${source.rss_url})`);

      try {
        const rssResponse = await fetchWithTimeout(
          source.rss_url,
          {
            headers: {
              "User-Agent": "BeritaMalaysia/1.0",
              "Accept": "application/rss+xml, application/xml, text/xml",
            },
          },
          10000
        );

        if (!rssResponse.ok) {
          const errorMsg = `Failed to fetch ${source.name}: ${rssResponse.status}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          continue;
        }

        const rssXml = await rssResponse.text();
        const items = parseRSS(rssXml);
        console.log(`Found ${items.length} items from ${source.name}`);

        for (const item of items) {
          pendingArticles.push({ item, source });
        }
      } catch (sourceError) {
        const errorMsg = `Error fetching source ${source.name}: ${sourceError instanceof Error ? sourceError.message : sourceError}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`Total RSS items collected: ${pendingArticles.length}`);

    // Process only up to MAX_ARTICLES_PER_RUN new articles
    for (const { item, source } of pendingArticles) {
      // Time guard
      if (Date.now() - startTime > TIME_LIMIT_MS) {
        console.log(`Time limit reached (${TIME_LIMIT_MS}ms), stopping processing`);
        hitTimeLimit = true;
        break;
      }

      // Batch limit
      if (totalProcessed >= MAX_ARTICLES_PER_RUN) {
        console.log(`Batch limit reached (${MAX_ARTICLES_PER_RUN} articles), stopping`);
        break;
      }

      // Check if article already exists
      const { data: existing } = await supabase
        .from("articles")
        .select("id")
        .eq("original_url", item.link)
        .single();

      if (existing) {
        totalSkipped++;
        continue;
      }

      // Process with Gemini AI (with retry logic)
      console.log(`Processing article: ${item.title.substring(0, 50)}...`);
      
      const processed = await processWithRetry(
        item.title,
        item.description,
        categories as Category[],
        geminiApiKey
      );

      // Find category ID
      const category = (categories as Category[]).find(
        (c) => c.slug === processed.categorySlug
      );

      // Parse publish date - always set a value
      let publishDate: string;
      if (item.pubDate) {
        try {
          publishDate = new Date(item.pubDate).toISOString();
        } catch {
          publishDate = new Date().toISOString();
        }
      } else {
        publishDate = new Date().toISOString();
      }

      // Insert article
      const { data: insertedArticle, error: insertError } = await supabase
        .from("articles")
        .insert({
          title: processed.newTitle,
          original_title: item.title,
          content: processed.content,
          original_content: item.description,
          excerpt: processed.excerpt,
          image_url: item.imageUrl,
          source_id: source.id,
          original_url: item.link,
          category_id: category?.id || null,
          status: "published",
          publish_date: publishDate,
          view_count: 0,
          is_breaking: false,
        })
        .select("id, slug")
        .single();

      if (insertError) {
        console.error(`Insert error for ${item.title}:`, insertError);
        errors.push(`Insert failed: ${item.title.substring(0, 30)}...`);
      } else {
        totalProcessed++;
        console.log(`Successfully inserted: ${item.title.substring(0, 40)}...`);

        // Trigger Facebook posting via dedicated function
        if (insertedArticle) {
          try {
            const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
            const response = await fetch(
              `${supabaseUrl}/functions/v1/post-to-facebook`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ article_id: insertedArticle.id }),
              }
            );
            
            if (response.ok) {
              console.log(`Facebook post triggered for: ${insertedArticle.id}`);
            } else {
              console.log(`Facebook post failed (will retry later): ${response.status}`);
            }
          } catch (fbError) {
            console.error("Facebook post trigger failed:", fbError);
          }
        }
      }

      // Delay between articles to avoid rate limiting (1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    const duration = Date.now() - startTime;
    console.log(`=== fetch-rss completed in ${duration}ms ===`);
    console.log(`Processed: ${totalProcessed}, Skipped: ${totalSkipped}, Errors: ${errors.length}`);

    // Update fetch log with success
    if (fetchLogId) {
      await logClient
        .from("fetch_logs")
        .update({
          status: "success",
          completed_at: new Date().toISOString(),
          articles_processed: totalProcessed,
          articles_skipped: totalSkipped,
          error_message: errors.length > 0 ? errors.join("; ") : null,
        })
        .eq("id", fetchLogId);
    }

    return new Response(
      JSON.stringify({
        message: "RSS fetch completed",
        processed: totalProcessed,
        skipped: totalSkipped,
        duration_ms: duration,
        hit_time_limit: hitTimeLimit,
        batch_limit: MAX_ARTICLES_PER_RUN,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Fetch RSS error after ${duration}ms:`, error);

    // Update fetch log with failure
    if (fetchLogId) {
      await logClient
        .from("fetch_logs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", fetchLogId);
    }

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        duration_ms: duration
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
