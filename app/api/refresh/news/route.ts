import { refreshFeed } from "@/lib/feed";

export const runtime = "nodejs";
export const maxDuration = 300; // el ciclo puede tardar (varias llamadas a la IA)

export async function GET(req: Request) {
  // Protección: Vercel Cron envía Authorization: Bearer <CRON_SECRET>.
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await refreshFeed();
    return Response.json({ ok: true, ...result });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
