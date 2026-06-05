import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const ALLOWED_ORIGINS = [
  "https://oxoaoyvvgddqksvdmrkd.lovableproject.com",
  "https://suncrisphospitality.com",
  "https://www.suncrisphospitality.com",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin =
    origin &&
    ALLOWED_ORIGINS.some(
      (a) =>
        origin === a ||
        origin.endsWith(".lovableproject.com") ||
        origin.endsWith(".lovable.app") ||
        origin.endsWith(".vercel.app"),
    )
      ? origin
      : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

const LOGO_URL =
  "https://oxoaoyvvgddqksvdmrkd.supabase.co/storage/v1/object/public/project-images/brand%2Fsuncrisp-logo-orange.png";

interface InquiryFieldValue {
  label: string;
  value: string;
}

interface InquiryEmailRequest {
  projectId?: string;
  projectTitle: string;
  fields: InquiryFieldValue[];
  submissionId?: string;
}

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const sanitize = (s: unknown, max = 5000): string => {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, max);
};

const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const r = rateLimitMap.get(ip);
  if (!r || now > r.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (r.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.ceil((r.resetTime - now) / 1000) };
  }
  r.count++;
  return { allowed: true };
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rl.retryAfter),
          ...corsHeaders,
        },
      },
    );
  }

  try {
    const body = (await req.json()) as InquiryEmailRequest;
    const projectTitle = sanitize(body.projectTitle, 300);
    const fields = Array.isArray(body.fields) ? body.fields : [];

    if (!projectTitle || fields.length === 0) {
      return new Response(JSON.stringify({ error: "Missing project or fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const cleanFields = fields
      .map((f) => ({
        label: sanitize(f?.label, 200),
        value: sanitize(f?.value, 5000),
      }))
      .filter((f) => f.label);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const recipientEmail = "suncrisphospitality@gmail.com";

    const fieldsHtml = cleanFields
      .map(
        (f) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:600;color:#333;width:35%;vertical-align:top;">${escapeHtml(
            f.label,
          )}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#555;white-space:pre-wrap;">${escapeHtml(
            f.value || "—",
          )}</td>
        </tr>`,
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;">
        <div style="background:#f14b36;padding:24px;text-align:center;">
          <img src="${LOGO_URL}" alt="SunCrisp Hospitality" style="max-height:64px;height:auto;display:inline-block;" />
        </div>
        <div style="padding:24px;">
          <h2 style="color:#f14b36;margin:0 0 8px 0;">New Inquiry</h2>
          <p style="color:#555;margin:0 0 16px 0;">Property: <strong>${escapeHtml(projectTitle)}</strong></p>
          <table style="width:100%;border-collapse:collapse;background:#fafafa;border:1px solid #eee;border-radius:6px;overflow:hidden;">
            ${fieldsHtml}
          </table>
          <p style="color:#888;font-size:12px;margin-top:24px;">Sent from the SunCrisp Hospitality website inquiry form.</p>
        </div>
      </div>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SunCrisp Inquiry <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `New Inquiry: ${projectTitle}`,
        html,
      }),
    });

    const responseData = await emailRes.json();
    if (!emailRes.ok) {
      console.error("Resend error", responseData);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Best-effort: update submission status if provided
    if (body.submissionId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (supabaseUrl && serviceKey) {
          await fetch(
            `${supabaseUrl}/rest/v1/inquiry_submissions?id=eq.${body.submissionId}`,
            {
              method: "PATCH",
              headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
              },
              body: JSON.stringify({ email_status: "sent" }),
            },
          );
        }
      } catch (e) {
        console.warn("Failed to update submission status", e);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in send-inquiry-email:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
