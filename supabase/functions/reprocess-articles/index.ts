import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Use Gemini to rewrite article content with proper paragraphs
async function reprocessWithGemini(
  title: string,
  originalContent: string,
  categories: Category[],
  geminiApiKey: string
): Promise<{ content: string; excerpt: string }> {
  const categoryList = categories.map(c => c.slug).join(', ');
  
  const prompt = `Anda adalah editor berita profesional Malaysia. Tulis semula artikel berita ini dalam Bahasa Malaysia yang neutral dan profesional.

TAJUK: ${title}

KANDUNGAN ASAL: ${originalContent}

ARAHAN:
1. Tulis semula kandungan dalam 200-300 perkataan dalam Bahasa Malaysia yang neutral, profesional, dan orang ketiga. 
2. PENTING: Pisahkan kandungan kepada 3-4 perenggan yang jelas. Gunakan \\n\\n untuk memisahkan setiap perenggan.
3. Buat ringkasan/excerpt dalam 1-2 ayat (maksimum 160 aksara)

PENTING: Tulis dalam perspektif orang ketiga yang neutral. Jangan gunakan "kami" atau "saya". Fokus pada fakta.

Balas dalam format JSON sahaja:
{
  "content": "Perenggan pertama...\\n\\nPerenggan kedua...\\n\\nPerenggan ketiga...",
  "excerpt": "Ringkasan pendek..."
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
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    return {
      content: result.content || originalContent,
      excerpt: result.excerpt || originalContent.substring(0, 160),
    };
  } catch (error) {
    console.error("Gemini processing error:", error);
    throw error;
  }
}

serve(async (req) => {
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

    // Get request body for optional filters
    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 50; // Process in batches

    // Get categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*");

    if (catError) throw catError;

    // Get articles that need reprocessing (content without paragraph breaks)
    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("id, title, content, original_content")
      .not("content", "ilike", "%\n\n%") // Articles without proper paragraph breaks
      .limit(limit);

    if (articlesError) throw articlesError;

    if (!articles?.length) {
      return new Response(
        JSON.stringify({ message: "No articles need reprocessing", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${articles.length} articles to reprocess`);

    let processed = 0;
    const errors: string[] = [];

    for (const article of articles) {
      try {
        console.log(`Reprocessing: ${article.title.substring(0, 50)}...`);

        // Use original content if available, otherwise use current content
        const sourceContent = article.original_content || article.content;

        const result = await reprocessWithGemini(
          article.title,
          sourceContent,
          categories as Category[],
          geminiApiKey
        );

        // Update the article
        const { error: updateError } = await supabase
          .from("articles")
          .update({
            content: result.content,
            excerpt: result.excerpt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", article.id);

        if (updateError) {
          console.error(`Update error for ${article.id}:`, updateError);
          errors.push(`Update failed: ${article.title.substring(0, 30)}...`);
        } else {
          processed++;
        }

        // Delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (articleError) {
        console.error(`Error processing article ${article.id}:`, articleError);
        errors.push(`Failed: ${article.title.substring(0, 30)}...`);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Reprocessing completed",
        processed,
        total: articles.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Reprocess error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
