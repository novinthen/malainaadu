import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PostRequest {
  article_id: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  slug: string;
  publish_date: string | null;
  source: { name: string } | null;
  category: { name: string; slug: string } | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const makeWebhookUrl = Deno.env.get('MAKE_WEBHOOK_URL');
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { article_id }: PostRequest = await req.json();

    if (!article_id) {
      return new Response(
        JSON.stringify({ error: 'article_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[post-to-facebook] Processing article: ${article_id}`);

    // Fetch article details
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        image_url,
        slug,
        publish_date,
        source:sources(name),
        category:categories(name, slug)
      `)
      .eq('id', article_id)
      .single();

    if (fetchError || !article) {
      console.error('[post-to-facebook] Article not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const typedArticle = article as unknown as Article;

    // Check if already posted
    const { data: existingLog } = await supabase
      .from('facebook_post_logs')
      .select('id, status')
      .eq('article_id', article_id)
      .eq('status', 'success')
      .maybeSingle();

    if (existingLog) {
      console.log('[post-to-facebook] Article already posted successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Already posted', log_id: existingLog.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create pending log entry
    const { data: logEntry, error: logError } = await supabase
      .from('facebook_post_logs')
      .insert({
        article_id,
        status: 'pending',
      })
      .select()
      .single();

    if (logError) {
      console.error('[post-to-facebook] Failed to create log entry:', logError);
    }

    // Check if Make.com webhook is configured
    if (!makeWebhookUrl) {
      const errorMsg = 'MAKE_WEBHOOK_URL not configured';
      console.error(`[post-to-facebook] ${errorMsg}`);
      
      // Update log as failed
      if (logEntry) {
        await supabase
          .from('facebook_post_logs')
          .update({ status: 'failed', error_message: errorMsg })
          .eq('id', logEntry.id);
      }

      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build article URL
    const siteUrl = 'https://malainaadu.com';
    const articleUrl = `${siteUrl}/berita/${typedArticle.slug}`;

    // Prepare payload for Make.com
    const payload = {
      article_id: typedArticle.id,
      title: typedArticle.title,
      excerpt: typedArticle.excerpt || '',
      image_url: typedArticle.image_url || '',
      article_url: articleUrl,
      category: typedArticle.category?.name || 'Berita',
      category_slug: typedArticle.category?.slug || 'berita',
      publish_date: typedArticle.publish_date || new Date().toISOString(),
      source_name: typedArticle.source?.name || 'Berita Malaysia',
      action: 'facebook_post',
    };

    console.log('[post-to-facebook] Sending to Make.com:', JSON.stringify(payload));

    // Send to Make.com webhook
    const webhookResponse = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Key': Deno.env.get('PUBLISH_WEBHOOK_KEY') || '',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await webhookResponse.text();
    let responseData: unknown = {};
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    console.log(`[post-to-facebook] Make.com response: ${webhookResponse.status}`, responseData);

    if (webhookResponse.ok) {
      // Success - update log and article
      if (logEntry) {
        await supabase
          .from('facebook_post_logs')
          .update({
            status: 'success',
            response_data: responseData,
          })
          .eq('id', logEntry.id);
      }

      // Mark article as posted
      await supabase
        .from('articles')
        .update({ posted_to_facebook: true })
        .eq('id', article_id);

      console.log('[post-to-facebook] Successfully posted to Facebook');

      return new Response(
        JSON.stringify({ success: true, log_id: logEntry?.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Failed - update log and send alert
      const errorMsg = `Make.com webhook failed: ${webhookResponse.status} - ${responseText}`;
      console.error(`[post-to-facebook] ${errorMsg}`);

      if (logEntry) {
        await supabase
          .from('facebook_post_logs')
          .update({
            status: 'failed',
            error_message: errorMsg,
            response_data: responseData,
          })
          .eq('id', logEntry.id);
      }

      // Send admin alert email
      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          
          // Get admin emails from email_alerts table
          const { data: adminAlerts } = await supabase
            .from('email_alerts')
            .select('email')
            .eq('processing_errors', true);

          const adminEmails = adminAlerts?.map(r => r.email) || [];

          if (adminEmails.length > 0) {
            await resend.emails.send({
              from: 'MalaiNaadu <alerts@malainaadu.com>',
              to: adminEmails,
              subject: `⚠️ Facebook Post Failed - ${typedArticle.title.substring(0, 50)}...`,
              html: `
                <h2>Facebook Posting Failed</h2>
                <p><strong>Article:</strong> ${typedArticle.title}</p>
                <p><strong>Error:</strong> ${errorMsg}</p>
                <p><strong>Article URL:</strong> <a href="${articleUrl}">${articleUrl}</a></p>
                <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                <hr>
                <p>You can retry posting from the <a href="${siteUrl}/admin/facebook">Admin Panel</a>.</p>
              `,
            });
            console.log('[post-to-facebook] Alert email sent to admins');
          }
        } catch (emailError) {
          console.error('[post-to-facebook] Failed to send alert email:', emailError);
        }
      }

      return new Response(
        JSON.stringify({ error: errorMsg, log_id: logEntry?.id }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[post-to-facebook] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
