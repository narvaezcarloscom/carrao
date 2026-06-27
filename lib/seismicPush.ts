// Push de alertas sísmicas significativas al canal de Telegram.
// DORMIDO si Telegram no está configurado (telegramEnabled() === false).
//
// Anti-spam: estado en Blob con los ids ya enviados. En la PRIMERA activación
// solo registra los sismos significativos actuales como baseline (NO los postea),
// para no disparar la historia entera de golpe; de ahí en adelante solo empuja
// eventos nuevos. Cron cada 5 min (vercel.json).

import { list, put } from "@vercel/blob";
import { fetchVenezuelaQuakes, type Quake } from "./usgs";
import { postToTelegram, telegramEnabled, escapeHtml } from "./telegram";
import { ago, magMeaning, translatePlace } from "./quake-format";

const STATE_PATH = "seismic-pushed.json";
const PUSH_MIN_MAG = 4.0; // umbral: se siente y puede preocupar
const RECENT_WINDOW_MS = 6 * 3_600_000; // no alertar de eventos viejos
const MAX_PER_RUN = 5; // tope por corrida (anti-spam si algo se acumula)
const KEEP_IDS = 200; // memoria de ids enviados

type PushState = { ids: string[] };

// Significativo = potencial tsunami o magnitud sobre el umbral.
const isSignificant = (q: Quake): boolean =>
  q.tsunami === 1 || (q.mag ?? 0) >= PUSH_MIN_MAG;

async function readState(): Promise<PushState | null> {
  try {
    const { blobs } = await list({ prefix: STATE_PATH, limit: 1 });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PushState;
  } catch {
    return null;
  }
}

async function writeState(state: PushState): Promise<void> {
  await put(STATE_PATH, JSON.stringify(state), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function formatSeismic(q: Quake, now: number): string {
  const mag = q.mag != null ? q.mag.toFixed(1) : "—";
  const emoji = q.tsunami === 1 ? "🔴" : (q.mag ?? 0) >= 5 ? "🟠" : "🟡";
  const depth = q.depth != null ? `${Math.round(q.depth)} km prof` : null;
  const lines = [
    `${emoji} <b>Sismo M${mag}</b>`,
    escapeHtml(translatePlace(q.place)),
    [magMeaning(q.mag), depth, ago(q.time, now)].filter(Boolean).join(" · "),
  ];
  if (q.tsunami === 1) {
    lines.push("⚠️ Posible tsunami: aléjate de la costa. Estado oficial: tsunami.gov");
  }
  lines.push("Estado y qué hacer → https://carraocanta.com");
  return lines.join("\n");
}

export async function pushSeismicAlerts(): Promise<{
  status: string;
  sent?: number;
  candidates?: number;
  seeded?: number;
}> {
  if (!telegramEnabled()) return { status: "dormido" };

  const quakes = await fetchVenezuelaQuakes();
  const now = Date.now();
  const state = await readState();

  // Primera activación: baseline sin postear.
  if (state === null) {
    const ids = quakes.filter(isSignificant).map((q) => q.id);
    await writeState({ ids: ids.slice(-KEEP_IDS) });
    return { status: "baseline", seeded: ids.length };
  }

  const pushed = new Set(state.ids);
  const candidates = quakes
    .filter(isSignificant)
    .filter((q) => now - q.time < RECENT_WINDOW_MS)
    .filter((q) => !pushed.has(q.id))
    .sort((a, b) => a.time - b.time) // del más viejo al más nuevo
    .slice(0, MAX_PER_RUN);

  let sent = 0;
  for (const q of candidates) {
    const ok = await postToTelegram(formatSeismic(q, now), { silent: false });
    if (ok) {
      pushed.add(q.id);
      sent++;
    }
  }

  if (sent > 0) await writeState({ ids: [...pushed].slice(-KEEP_IDS) });
  return { status: "ok", sent, candidates: candidates.length };
}
