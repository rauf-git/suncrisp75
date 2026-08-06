export const config = { runtime: "nodejs" };

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://wpxhailrakxuswzleobh.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "";

export default async function handler(req: any, res: any) {
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = Boolean(req.headers?.["x-vercel-cron"]);
  const auth = req.headers?.authorization;

  if (cronSecret && !isVercelCron && auth !== `Bearer ${cronSecret}`) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }

  try {
    const upstream = await fetch(`${SUPABASE_URL}/functions/v1/keep-alive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    const text = await upstream.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }

    res.status(upstream.ok ? 200 : 500).json({
      ok: upstream.ok,
      status: upstream.status,
      upstream: payload,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: String(err),
      timestamp: new Date().toISOString(),
    });
  }
}
