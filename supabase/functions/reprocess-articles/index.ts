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

// Validate Tamil script presence (Unicode U+0B80–U+0BFF)
function hasTamilScript(text: string): boolean {
  if (!text) return false;
  const tamilChars = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
  return tamilChars >= 3;
}

// Use Lovable AI Gateway (Gemini 2.5 Flash) to retranslate the full article into Malaysian Tamil
async function reprocessWithAI(
  originalTitle: string,
  originalContent: string,
  categories: Category[],
  lovableApiKey: string
): Promise<{ title: string; content: string; excerpt: string; categorySlug: string }> {
  const categoryList = categories.map(c => c.slug).join(', ');

  const systemPrompt = `நீங்கள் ஒரு தொழில்முறை மலேசிய தமிழ் செய்தி ஆசிரியர். எல்லா பதில்களையும் மலேசிய தமிழில் (Malaysian Tamil) மட்டுமே எழுதவும். மலாய் (Bahasa Malaysia) அல்லது ஆங்கிலத்தில் எழுத வேண்டாம். JSON வடிவில் மட்டுமே பதிலளிக்கவும்.`;

  const userPrompt = `Translate and rewrite this Malay/English news article into Malaysian Tamil.

ORIGINAL TITLE: ${originalTitle}

ORIGINAL CONTENT: ${originalContent}

INSTRUCTIONS:
1. Write an engaging, SEO-friendly title in Malaysian Tamil (max 80 characters). The title MUST be in Tamil script (தமிழ்).
2. Rewrite the content in 200-300 words in professional, neutral Malaysian Tamil. Split into 3-4 paragraphs separated by \\n\\n.
3. Create a brief excerpt in 1-2 Tamil sentences (max 160 characters).
4. Choose the most appropriate category slug from: ${categoryList}

CRITICAL:
- Title, content, and excerpt MUST be in Tamil script. Do NOT return Malay or English text.
- Third-person neutral perspective. Focus on facts.
- Use Malaysian Tamil terms; avoid Indian Tamil spellings.
- Keep proper nouns (names, places) as-is.

Reply with JSON only:
{
  "title": "தமிழ் தலைப்பு",
  "content": "முதல் பத்தி...\\n\\nஇரண்டாவது பத்தி...\\n\\nமூன்றாவது பத்தி...",
  "excerpt": "சுருக்கமான தமிழ் சுருக்கம்.",
  "category": "category_slug"
}`;

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Lovable AI Gateway error:", response.status, errorText);
    if (response.status === 429) throw new Error("AI rate limit exceeded");
    if (response.status === 402) throw new Error("AI credits exhausted");
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in AI response");
  }

  const result = JSON.parse(jsonMatch[0]);
  const title = (result.title || "").trim();
  const content = (result.content || "").trim();
  const excerpt = (result.excerpt || "").trim();

  if (!hasTamilScript(title)) {
    throw new Error(`Translation produced non-Tamil title: "${title.substring(0, 50)}"`);
  }

  return {
    title,
    content: content || originalContent,
    excerpt: excerpt || content.substring(0, 160),
    categorySlug: result.category || "nasional",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require admin authentication
    const authHeader = req.headers.get("Authorization");
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

    console.log(`Reprocess triggered by admin user: ${claimsData.user.id}`);

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = serviceClient;

    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const requestedLimit = parseInt(body.limit) || 10;
    // Clamp between 1 and 20 to prevent timeouts and resource exhaustion
    const limit = Math.min(Math.max(1, requestedLimit), 20);
    // mode: "malay-leak" (default) targets articles whose title equals original_title
    //       "no-paragraphs" targets articles missing paragraph breaks
    const mode: string = body.mode === "no-paragraphs" ? "no-paragraphs" : "malay-leak";

    // Get categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*");
    if (catError) throw catError;

    // Find articles needing reprocessing based on mode
    let articles: Array<{
      id: string;
      title: string;
      original_title: string | null;
      content: string;
      original_content: string | null;
    }> | null = null;

    if (mode === "malay-leak") {
      // Articles where title equals original_title (translation never happened)
      // We do this client-side since PostgREST can't easily compare two columns
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, original_title, content, original_content")
        .not("original_title", "is", null)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      articles = (data || [])
        .filter(a => a.original_title && a.title.trim() === a.original_title.trim())
        .slice(0, limit);
    } else {
      // Articles without paragraph breaks
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, original_title, content, original_content")
        .not("content", "ilike", "%\n\n%")
        .limit(limit);
      if (error) throw error;
      articles = data;
    }

    if (!articles?.length) {
      return new Response(
        JSON.stringify({ message: "No articles need reprocessing", processed: 0, mode }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${articles.length} articles to reprocess (mode=${mode})`);

    let processed = 0;
    const errors: string[] = [];

    for (const article of articles) {
      try {
        console.log(`Reprocessing: ${(article.original_title || article.title).substring(0, 50)}...`);

        // Use original_content + original_title as source if available
        const sourceTitle = article.original_title || article.title;
        const sourceContent = article.original_content || article.content;

        const result = await reprocessWithAI(
          sourceTitle,
          sourceContent,
          categories as Category[],
          lovableApiKey
        );

        const category = (categories as Category[]).find(c => c.slug === result.categorySlug);

        const { error: updateError } = await supabase
          .from("articles")
          .update({
            title: result.title,
            content: result.content,
            excerpt: result.excerpt,
            category_id: category?.id || null,
            status: "published", // Promote previously-pending articles
            updated_at: new Date().toISOString(),
          })
          .eq("id", article.id);

        if (updateError) {
          console.error(`Update error for ${article.id}:`, updateError);
          errors.push(`Update failed: ${sourceTitle.substring(0, 30)}...`);
        } else {
          processed++;
        }

        // Rate-limit guard
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (articleError) {
        console.error(`Error processing article ${article.id}:`, articleError);
        errors.push(`Failed: ${(article.original_title || article.title).substring(0, 30)}...`);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Reprocessing completed",
        mode,
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
