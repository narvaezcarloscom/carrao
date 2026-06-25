import { list, put } from "@vercel/blob";
import Parser from "rss-parser";
import { SOURCES, isRelevant, type SourceType } from "./sources";
import { summarize } from "./summarize";

export type FeedItem = {
  url: string;
  sourceName: string;
  sourceType: SourceType;
  headline: string;
  summary: string;
  publishedAt: number; // epoch ms
};

export type Feed = {
  updatedAt: number; // último ciclo exitoso, epoch ms
  items: FeedItem[];
};

const BLOB_PATH = "feed.json";
const MAX_ITEMS = 40;
const MAX_NEW_PER_SOURCE = 6; // tope de costo por ciclo

const EMPTY: Feed = { updatedAt: 0, items: [] };

// Lee el feed actual desde Blob (para dedup y para servirlo).
export async function readFeed(): Promise<Feed> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
    if (!blobs.length) return EMPTY;
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return EMPTY;
    return (await res.json()) as Feed;
  } catch {
    return EMPTY;
  }
}

async function writeFeed(feed: Feed): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(feed), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

// El ciclo del cron: ingesta RSS -> filtro -> resumen extractivo -> merge.
export async function refreshFeed(): Promise<{ added: number; total: number }> {
  const existing = await readFeed();
  const seen = new Set(existing.items.map((i) => i.url));
  const parser = new Parser({ timeout: 15000 });
  const fresh: FeedItem[] = [];

  for (const source of SOURCES) {
    try {
      const channel = await parser.parseURL(source.feedUrl);
      let usedFromSource = 0;
      for (const entry of channel.items ?? []) {
        if (usedFromSource >= MAX_NEW_PER_SOURCE) break;
        const url = entry.link?.trim();
        if (!url || seen.has(url)) continue;

        const blob = `${entry.title ?? ""} ${entry.contentSnippet ?? entry.content ?? ""}`;
        if (!isRelevant(blob)) continue; // primer cedazo barato

        const result = await summarize({
          sourceName: source.name,
          title: entry.title ?? "",
          content: entry.contentSnippet ?? entry.content ?? entry.title ?? "",
        });
        if (!result || !result.relevant) {
          seen.add(url); // evita re-evaluarlo el próximo ciclo
          continue;
        }

        seen.add(url);
        usedFromSource++;
        fresh.push({
          url,
          sourceName: source.name,
          sourceType: source.type,
          headline: result.headline,
          summary: result.summary,
          publishedAt: entry.isoDate ? Date.parse(entry.isoDate) : Date.now(),
        });
      }
    } catch {
      continue; // una fuente caída no rompe el ciclo
    }
  }

  const merged = [...fresh, ...existing.items]
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, MAX_ITEMS);

  const feed: Feed = { updatedAt: Date.now(), items: merged };
  await writeFeed(feed);
  return { added: fresh.length, total: merged.length };
}
