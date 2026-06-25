"use client";

import { useEffect, useState } from "react";

type FeedItem = {
  url: string;
  sourceName: string;
  sourceType: "intl" | "ve";
  headline: string;
  summary: string;
  publishedAt: number;
};
type Feed = { updatedAt: number; items: FeedItem[] };

const POLL_MS = 120_000; // el teléfono revisa el feed cada 2 min

function ago(ms: number, now: number): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return `hace ${s} s`;
  const min = Math.round(s / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} ${d === 1 ? "día" : "días"}`;
}

const PILL: Record<string, { cls: string; label: string }> = {
  intl: { cls: "pill-intl", label: "Internacional" },
  ve: { cls: "pill-ve", label: "Venezolana" },
};

// Fallback cuando el feed resumido aún no tiene ítems: enlaces curados directos.
const FALLBACK = [
  { pill: "pill-sci", label: "Científica", name: "ReliefWeb — Venezuela", meta: "ONU/OCHA: respuesta humanitaria", url: "https://reliefweb.int/country/ven" },
  { pill: "pill-intl", label: "Internacional", name: "BBC Mundo", meta: "En español", url: "https://www.bbc.com/mundo" },
  { pill: "pill-ve", label: "Venezolana", name: "Efecto Cocuyo", meta: "Independiente, fuerte en verificación", url: "https://efectococuyo.com/" },
  { pill: "pill-ve", label: "Venezolana", name: "El Pitazo", meta: "Investigativo, red de corresponsales", url: "https://elpitazo.net/" },
  { pill: "pill-ve", label: "Venezolana", name: "Runrun.es", meta: "Credibilidad alta", url: "https://runrun.es/" },
];

function SourceLinks() {
  return (
    <>
      <p className="soon">Ve directo a las fuentes verificadas:</p>
      <div className="links">
        {FALLBACK.map((s) => (
          <a key={s.url} className="link-card" href={s.url} target="_blank" rel="noopener">
            <div className="lc-title">
              <span className={`src-pill ${s.pill}`}>{s.label}</span>
              {s.name} <span className="arrow">→</span>
            </div>
            <div className="lc-meta">{s.meta}</div>
          </a>
        ))}
      </div>
    </>
  );
}

export default function NewsFeed() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/feed", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as Feed;
        if (alive) setFeed(data);
      } catch {
        /* mantiene lo último que cargó */
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const poll = setInterval(load, POLL_MS);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      alive = false;
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  if (loading && !feed) {
    return <p className="soon">Cargando lo que ya verificaron las fuentes…</p>;
  }

  if (!feed || feed.items.length === 0) {
    // Degradación con gracia: si aún no hay resúmenes, mostramos la lista
    // curada de fuentes para que el usuario igual llegue a información confiable.
    return <SourceLinks />;
  }

  return (
    <>
      {feed.updatedAt > 0 && (
        <p className="feed-updated">
          Actualizado {ago(feed.updatedAt, now)} · se revisa cada 15 min
        </p>
      )}
      <div className="news">
        {feed.items.map((it) => {
          const pill = PILL[it.sourceType] ?? PILL.intl;
          return (
            <a
              key={it.url}
              className="news-card"
              href={it.url}
              target="_blank"
              rel="noopener"
            >
              <div className="news-meta">
                <span className={`src-pill ${pill.cls}`}>{pill.label}</span>
                {it.sourceName} · {ago(it.publishedAt, now)}
              </div>
              <div className="news-headline">{it.headline}</div>
              <div className="news-summary">{it.summary}</div>
              <div className="news-link">Leer en la fuente →</div>
            </a>
          );
        })}
      </div>
      <p className="feed-note">
        Algunos enlaces pueden estar bloqueados por tu proveedor de internet
        dentro de Venezuela y no abrir. Por eso te dejamos el resumen aquí: es
        lo esencial de lo que dice la fuente.
      </p>
    </>
  );
}
