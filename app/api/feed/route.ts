import { readFeed } from "@/lib/feed";

export const runtime = "nodejs";

export async function GET() {
  const feed = await readFeed();
  return Response.json(feed, {
    headers: {
      // CDN sirve el JSON ~60s entre ciclos de cron; barato y ligero.
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
