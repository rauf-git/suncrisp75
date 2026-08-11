export const config = { runtime: "nodejs" };

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://fguhfdfgyaoxtxrcforc.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_nqgDvpngSlkrm7yD84N6Sw_JZ0uTnRv";

export default async function handler(req: any, res: any) {
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = Boolean(req.headers?.["x-vercel-cron"]);
  const auth = req.headers?.authorization;

  if (cronSecret && !isVercelCron && auth !== `Bearer ${cronSecret}`) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }

  try {
    // Plain Data API read — counts as database activity, requires no edge
    // function to be deployed in the backend project.
    const upstream = await fetch(
      `${SUPABASE_URL}/rest/v1/page_blocks?select=id&limit=1`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );

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
