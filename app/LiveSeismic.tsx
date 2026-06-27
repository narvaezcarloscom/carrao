"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchVenezuelaQuakes,
  MIN_MAG,
  WINDOW_DAYS,
  type Quake,
} from "@/lib/usgs";
import { drawStoryImage } from "./shareImage";
import { ago, magMeaning, translatePlace } from "@/lib/quake-format";

const POLL_MS = 90_000; // 90 s: se siente en vivo sin castigar el plan de datos.

const SHARE_URL = "https://carraocanta.com";
const SHARE_TEXT =
  "Sismos en Venezuela ahora mismo, según USGS — info verificada, liviana y sin postura política:";

type State = {
  quakes: Quake[];
  lastSuccess: number | null;
  error: boolean;
  loading: boolean;
};

type Verdict = { level: "ok" | "elevated" | "danger"; headline: string; message: string };

// La respuesta en palabras a "¿estoy a salvo de otro suceso?".
// Honesto: describe el estado actual, nunca promete que no habrá más sismos.
function computeVerdict(
  quakes: Quake[],
  now: number,
  tsunamiFlag: boolean
): Verdict {
  const last24h = quakes.filter((q) => now - q.time < 86_400_000).length;
  const recentStrong = quakes.some(
    (q) => (q.mag ?? 0) >= 4.5 && now - q.time < 3 * 3_600_000
  );

  if (tsunamiFlag) {
    return {
      level: "danger",
      headline: "Revisa el aviso de tsunami",
      message:
        "Un sismo reciente pudo generar tsunami. Si estás cerca de la costa, aléjate hacia un lugar alto y confirma el estado oficial ahora mismo.",
    };
  }
  if (recentStrong) {
    return {
      level: "elevated",
      headline: "La tierra sigue muy activa",
      message:
        "Siguen ocurriendo movimientos fuertes. Mantente alerta, lejos de ventanas y de estructuras con daños, y ten lista tu salida.",
    };
  }
  if (last24h > 0) {
    return {
      level: "ok",
      headline: "El movimiento fuerte ya pasó",
      message:
        "El temblor más fuerte quedó atrás. Las réplicas que siguen son más débiles y son normales; pueden durar días. Por ahora, con calma, pero mantente atento.",
    };
  }
  return {
    level: "ok",
    headline: "Con calma por ahora",
    message:
      "No hay movimientos en las últimas 24 horas. Las réplicas pueden volver, así que ten tu plan a la mano.",
  };
}

export default function LiveSeismic({
  initialQuakes,
}: {
  initialQuakes?: Quake[];
}) {
  // Estado inicial desde el servidor (ISR) → la tarjeta nace a su altura
  // completa en el HTML, sin crecer al cargar (elimina el CLS).
  const [state, setState] = useState<State>({
    quakes: initialQuakes ?? [],
    lastSuccess: null,
    error: false,
    loading: initialQuakes === undefined,
  });
  const [now, setNow] = useState(() => Date.now());
  const lastQuakes = useRef<Quake[]>(initialQuakes ?? []);

  // Compartir: segmentación por capacidad, no por sniffing. Init en false para que
  // el render del servidor (ISR) y el primer render del cliente coincidan (sin botones,
  // sin hydration mismatch); useEffect los revela donde el dispositivo es capaz.
  const [cap, setCap] = useState({ link: false, image: false });
  const [imgBusy, setImgBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const link = typeof navigator.share === "function";
    let image = false;
    try {
      const probe = new File([new Uint8Array(0)], "probe.png", { type: "image/png" });
      const fileCapable =
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [probe] });
      // navigator.connection no existe en iOS: ahí el filtro no aplica y el botón
      // de imagen sí aparece (iOS es teléfono capaz por definición). En Android
      // suprime la imagen si la red es lenta o el usuario activó ahorro de datos.
      const conn = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      const saveData = conn?.saveData === true;
      const slow = conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g";
      image = !!fileCapable && !saveData && !slow;
    } catch {
      image = false;
    }
    setCap({ link, image });
  }, []);

  const load = useCallback(async () => {
    try {
      const quakes = await fetchVenezuelaQuakes();
      lastQuakes.current = quakes;
      setState({
        quakes,
        lastSuccess: Date.now(),
        error: false,
        loading: false,
      });
    } catch {
      setState((s) => ({
        ...s,
        quakes: lastQuakes.current,
        error: true,
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, POLL_MS);
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [load]);

  const { quakes, lastSuccess, error, loading } = state;

  if (loading && quakes.length === 0) {
    return (
      <div className="card">
        <span className="updated">Consultando datos oficiales de USGS…</span>
      </div>
    );
  }

  if (quakes.length === 0) {
    return (
      <div className="card">
        <div className="live-row">
          <span className="live-dot">En vivo · USGS</span>
          {lastSuccess && (
            <span className="updated">actualizado {ago(lastSuccess, now)}</span>
          )}
        </div>
        <p className="banner banner-ok">
          Sin sismos de magnitud {MIN_MAG}+ registrados en Venezuela en los
          últimos {WINDOW_DAYS} días.
        </p>
      </div>
    );
  }

  const latest = quakes[0];
  const largest = quakes.reduce((a, b) =>
    (b.mag ?? 0) > (a.mag ?? 0) ? b : a
  );
  const last24h = quakes.filter((q) => now - q.time < 86_400_000).length;
  const tsunamiFlag = largest.tsunami === 1;
  const verdict = computeVerdict(quakes, now, tsunamiFlag);

  const horaText = lastSuccess ? `actualizado ${ago(lastSuccess, now)}` : "en vivo";

  const onShareLink = async () => {
    try {
      if (cap.link) {
        await navigator.share({ title: "Carrao", text: SHARE_TEXT, url: SHARE_URL });
      } else {
        await navigator.clipboard?.writeText(`${SHARE_TEXT} ${SHARE_URL}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Usuario canceló o no soportado: silencioso, no romper la página.
    }
  };

  const onShareImage = async () => {
    if (imgBusy) return;
    setImgBusy(true);
    try {
      const blob = await drawStoryImage({
        verdict,
        latest: {
          mag: latest.mag != null ? latest.mag.toFixed(1) : "—",
          meaning: magMeaning(latest.mag),
          place: translatePlace(latest.place),
          depthText:
            latest.depth != null ? `${Math.round(latest.depth)} km de profundidad` : null,
          agoText: ago(latest.time, now),
        },
        largest: {
          mag: largest.mag != null ? largest.mag.toFixed(1) : "—",
          agoText: ago(largest.time, now),
        },
        last24h,
        tsunamiFlag,
        horaText,
      });
      const file = new File([blob], "carrao-sismo.png", { type: "image/png" });
      await navigator.share({ files: [file], title: "Carrao", text: SHARE_TEXT });
    } catch {
      // AbortError (canceló) o fallo de canvas: silencioso, no romper la página.
    } finally {
      setImgBusy(false);
    }
  };

  return (
    <div className="card">
      <div className="live-row">
        <span className="live-dot">En vivo · USGS</span>
        <span className="updated">
          {error ? (
            <span className="retry">reintentando…</span>
          ) : lastSuccess ? (
            `actualizado ${ago(lastSuccess, now)}`
          ) : null}
        </span>
      </div>

      {/* La respuesta, en palabras: ¿estoy a salvo de otro suceso? */}
      <div className={`verdict verdict-${verdict.level}`}>
        <div className="verdict-headline">{verdict.headline}</div>
        <div className="verdict-message">{verdict.message}</div>
      </div>

      {/* Tsunami: respuesta directa */}
      <div className={`banner ${tsunamiFlag ? "banner-danger" : "banner-ok"}`}>
        {tsunamiFlag ? (
          <>
            Si estás cerca de la costa, aléjate hacia un lugar alto. Confirma el
            aviso oficial en{" "}
            <a href="https://www.tsunami.gov" target="_blank" rel="noopener">
              tsunami.gov
            </a>
            .
          </>
        ) : (
          <>
            No hay alerta de tsunami activa por estos sismos. Estado oficial:{" "}
            <a href="https://www.tsunami.gov" target="_blank" rel="noopener">
              tsunami.gov
            </a>
            .
          </>
        )}
      </div>

      {/* Detalle interpretado: el número ya significa algo */}
      <div className="quake-detail">
        <span className="mag-label">Último temblor · {ago(latest.time, now)}</span>
        <div className="mag">
          {latest.mag != null ? latest.mag.toFixed(1) : "—"}
        </div>
        <div className="mag-meaning">{magMeaning(latest.mag)}</div>
        <div className="quake-place">{translatePlace(latest.place)}</div>
        {latest.depth != null && (
          <div className="quake-meta">
            {Math.round(latest.depth)} km de profundidad
          </div>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-num">{last24h}</div>
          <div className="stat-cap">
            {last24h === 1 ? "réplica en 24 h" : "réplicas en 24 h"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-num">
            {largest.mag != null ? largest.mag.toFixed(1) : "—"}
          </div>
          <div className="stat-cap">
            el sismo principal · {ago(largest.time, now)}
          </div>
        </div>
      </div>

      <p className="updated" style={{ marginTop: 12 }}>
        No se puede predecir un sismo. Te mostramos lo que ya ocurrió, según el
        U.S. Geological Survey (USGS) para la región Venezuela.
      </p>

      <div className="share-row">
        <button type="button" className="share-btn" onClick={onShareLink}>
          {cap.link ? "Compartir" : copied ? "Enlace copiado ✓" : "Copiar enlace"}
        </button>
        {cap.image && (
          <button
            type="button"
            className="share-btn share-btn-story"
            onClick={onShareImage}
            disabled={imgBusy}
          >
            {imgBusy ? "Generando…" : "Imagen para tu historia"}
          </button>
        )}
      </div>
    </div>
  );
}
