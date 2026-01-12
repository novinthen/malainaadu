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

// Use Gemini to rewrite article and categorize
async function processWithGemini(
  title: string,
  description: string,
  categories: Category[],
  geminiApiKey: string
): Promise<{ newTitle: string; content: string; excerpt: string; categorySlug: string }> {
  const categoryList = categories.map(c => c.slug).join(', ');
  
  const prompt = `Anda adalah editor berita profesional Malaysia. Tulis semula artikel berita ini dalam Bahasa Malaysia yang neutral dan profesional.

TAJUK ASAL: ${title}

KANDUNGAN ASAL: ${description}

ARAHAN:
1. Tulis semula tajuk yang lebih menarik dan SEO-friendly dalam Bahasa Malaysia (maksimum 80 aksara)
2. Tulis semula kandungan dalam 200-300 perkataan dalam Bahasa Malaysia yang neutral, profesional, dan orang ketiga. PENTING: Pisahkan kandungan kepada 3-4 perenggan. Gunakan \\n\\n untuk memisahkan setiap perenggan.
3. Buat ringkasan/excerpt dalam 1-2 ayat (maksimum 160 aksara)
4. Pilih kategori yang paling sesuai dari senarai ini: ${categoryList}

PENTING: Tulis dalam perspektif orang ketiga yang neutral. Jangan gunakan "kami" atau "saya". Fokus pada fakta.

Balas dalam format JSON sahaja:
{
  "title": "Tajuk baharu",
  "content": "Perenggan pertama...\\n\\nPerenggan kedua...\\n\\nPerenggan ketiga...",
  "excerpt": "Ringkasan pendek...",
  "category": "slug_kategori"
}`;

  try {
    const response = await fetch(
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
      }
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
  } catch (error) {
    console.error("Gemini processing error:", error);
    // Fallback: return original content
    return {
      newTitle: title,
      content: description,
      excerpt: description.substring(0, 160),
      categorySlug: "nasional",
    };
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get active sources
    const { data: sources, error: sourcesError } = await supabase
      .from("sources")
      .select("*")
      .eq("is_active", true);

    if (sourcesError) throw sourcesError;
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

    if (catError) throw catError;

    let totalProcessed = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    // Process each source
    for (const source of sources as Source[]) {
      console.log(`Fetching RSS from: ${source.name} (${source.rss_url})`);

      try {
        // Fetch RSS feed
        const rssResponse = await fetch(source.rss_url, {
          headers: {
            "User-Agent": "BeritaMalaysia/1.0",
            "Accept": "application/rss+xml, application/xml, text/xml",
          },
        });

        if (!rssResponse.ok) {
          errors.push(`Failed to fetch ${source.name}: ${rssResponse.status}`);
          continue;
        }

        const rssXml = await rssResponse.text();
        const items = parseRSS(rssXml);

        console.log(`Found ${items.length} items from ${source.name}`);

        // Process each item
        for (const item of items.slice(0, 10)) { // Limit to 10 items per source per run
          // Check if article already exists (by original URL)
          const { data: existing } = await supabase
            .from("articles")
            .select("id")
            .eq("original_url", item.link)
            .single();

          if (existing) {
            totalSkipped++;
            continue;
          }

          // Process with Gemini AI
          console.log(`Processing article: ${item.title.substring(0, 50)}...`);
          
          const processed = await processWithGemini(
            item.title,
            item.description,
            categories as Category[],
            geminiApiKey
          );

          // Find category ID
          const category = (categories as Category[]).find(
            (c) => c.slug === processed.categorySlug
          );

          // Parse publish date
          let publishDate: string | null = null;
          if (item.pubDate) {
            try {
              publishDate = new Date(item.pubDate).toISOString();
            } catch {
              publishDate = new Date().toISOString();
            }
          }

          // Insert article
          const { error: insertError } = await supabase.from("articles").insert({
            title: processed.newTitle,
            original_title: item.title,
            content: processed.content,
            original_content: item.description,
            excerpt: processed.excerpt,
            image_url: item.imageUrl,
            source_id: source.id,
            original_url: item.link,
            category_id: category?.id || null,
            status: "pending", // Goes to moderation queue
            publish_date: publishDate,
            view_count: 0,
            is_featured: false,
            is_breaking: false,
          });

          if (insertError) {
            console.error(`Insert error for ${item.title}:`, insertError);
            errors.push(`Insert failed: ${item.title.substring(0, 30)}...`);
          } else {
            totalProcessed++;
          }

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (sourceError) {
        console.error(`Error processing source ${source.name}:`, sourceError);
        errors.push(`Source error ${source.name}: ${sourceError}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: "RSS fetch completed",
        processed: totalProcessed,
        skipped: totalSkipped,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Fetch RSS error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
