import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FetchLog {
  id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  articles_processed: number | null;
  error_message: string | null;
}

interface EmailAlert {
  id: string;
  email: string;
  user_id: string;
  new_articles: boolean;
  processing_errors: boolean;
  last_alert_sent: string | null;
  alert_cooldown_minutes: number;
}

interface AlertInfo {
  type: 'fetch_failure' | 'no_recent_fetch' | 'no_articles';
  message: string;
  details: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const resend = new Resend(resendApiKey);

  try {
    console.log("Starting fetch health check...");

    // Get the latest fetch log
    const { data: latestFetch, error: fetchError } = await supabase
      .from("fetch_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching logs:", fetchError);
    }

    // Count articles published in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentArticles, error: articleError } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneHourAgo);

    if (articleError) {
      console.error("Error counting articles:", articleError);
    }

    // Check for issues
    const alerts: AlertInfo[] = [];
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    if (latestFetch) {
      const fetchLog = latestFetch as FetchLog;

      // Check if last fetch failed
      if (fetchLog.status === "failed") {
        alerts.push({
          type: "fetch_failure",
          message: "Pengambilan RSS gagal",
          details: fetchLog.error_message || "Tiada maklumat ralat",
        });
      }

      // Check if no fetch in the last 30 minutes
      const lastFetchTime = new Date(fetchLog.completed_at || fetchLog.started_at);
      if (lastFetchTime < thirtyMinutesAgo && fetchLog.status !== "running") {
        alerts.push({
          type: "no_recent_fetch",
          message: "Tiada pengambilan RSS dalam 30 minit",
          details: `Fetch terakhir: ${lastFetchTime.toLocaleString("ms-MY")}`,
        });
      }
    } else {
      // No fetch logs at all
      alerts.push({
        type: "no_recent_fetch",
        message: "Tiada rekod pengambilan RSS",
        details: "Sistem pengambilan mungkin tidak dikonfigurasi",
      });
    }

    // Check if no articles in the last hour
    if ((recentArticles ?? 0) === 0) {
      alerts.push({
        type: "no_articles",
        message: "Tiada artikel baharu dalam 1 jam",
        details: `Artikel terakhir: Tiada dalam tempoh 1 jam`,
      });
    }

    console.log(`Found ${alerts.length} alert(s)`);

    if (alerts.length === 0) {
      return new Response(
        JSON.stringify({ status: "healthy", message: "No issues detected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get email subscribers who have processing_errors enabled
    const { data: subscribers, error: subError } = await supabase
      .from("email_alerts")
      .select("*")
      .eq("processing_errors", true);

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      throw subError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers configured for alerts");
      return new Response(
        JSON.stringify({
          status: "unhealthy",
          alerts: alerts.length,
          message: "Issues detected but no subscribers configured",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter subscribers based on cooldown
    const now = new Date();
    const eligibleSubscribers = (subscribers as EmailAlert[]).filter((sub) => {
      if (!sub.last_alert_sent) return true;
      const lastSent = new Date(sub.last_alert_sent);
      const cooldownMs = (sub.alert_cooldown_minutes || 60) * 60 * 1000;
      return now.getTime() - lastSent.getTime() > cooldownMs;
    });

    if (eligibleSubscribers.length === 0) {
      console.log("All subscribers are in cooldown period");
      return new Response(
        JSON.stringify({
          status: "unhealthy",
          alerts: alerts.length,
          message: "Issues detected but all subscribers in cooldown",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare email content
    const alertMessages = alerts.map((a) => `• ${a.message}\n  ${a.details}`).join("\n\n");
    const emailRecipients = eligibleSubscribers.map((s) => s.email);

    const lastFetchInfo = latestFetch
      ? `${new Date(latestFetch.completed_at || latestFetch.started_at).toLocaleString("ms-MY")} (${latestFetch.status})`
      : "Tiada rekod";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">⚠️ Amaran Sistem MalaiNaadu</h1>
        
        <p style="font-size: 16px;">Sistem pengambilan berita menghadapi masalah:</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
          <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${alertMessages}</pre>
        </div>
        
        <h3 style="margin-top: 24px;">Status Sistem:</h3>
        <ul style="line-height: 1.8;">
          <li><strong>Fetch terakhir:</strong> ${lastFetchInfo}</li>
          <li><strong>Artikel (1 jam):</strong> ${recentArticles ?? 0}</li>
          <li><strong>Masa amaran:</strong> ${now.toLocaleString("ms-MY")}</li>
        </ul>
        
        <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
          Sila periksa sistem segera di panel admin.
        </p>
        
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px;">
          Amaran automatik dari MalaiNaadu<br>
          Untuk berhenti menerima amaran, sila kemas kini tetapan di panel admin.
        </p>
      </div>
    `;

    // Send email
    console.log(`Sending alert email to ${emailRecipients.length} recipient(s)`);

    const emailResponse = await resend.emails.send({
      from: "MalaiNaadu <alerts@malainaadu.com>",
      to: emailRecipients,
      subject: "⚠️ Amaran Sistem MalaiNaadu - Masalah Pengambilan Berita",
      html: emailHtml,
    });

    console.log("Email sent:", emailResponse);

    // Update last_alert_sent for all eligible subscribers
    for (const sub of eligibleSubscribers) {
      await supabase
        .from("email_alerts")
        .update({ last_alert_sent: now.toISOString() })
        .eq("id", sub.id);
    }

    // Log the alert
    await supabase.from("alert_logs").insert({
      alert_type: alerts.map((a) => a.type).join(", "),
      message: alertMessages,
      recipients: emailRecipients,
    });

    return new Response(
      JSON.stringify({
        status: "alert_sent",
        alerts: alerts.length,
        recipients: emailRecipients.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in check-fetch-health:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
