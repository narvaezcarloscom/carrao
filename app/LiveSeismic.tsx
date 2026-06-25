"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Region Venezuela (caja aproximada) para filtrar el feed de USGS.
const BBOX = {
  minlatitude: 0.5,
  maxlatitude: 13.5,
  minlongitude: -74,
  maxlongitude: -59,
};
const MIN_MAG = 2.5;
const WINDOW_DAYS = 7;
const POLL_MS = 90_000; // 90 s: se siente en vivo sin castigar el plan de datos.

type Quake = {
  id: string;
  mag: number | null;
  magType: string | null;
  place: string;
  time: number;
  depth: number | null;
  tsunami: number;
};

type State = {
  quakes: Quake[];
  lastSuccess: number | null;
  error: boolean;
  loading: boolean;
};

const DIR: Record<string, string> = { W: "O" }; // norte/sur/este iguales; oeste = O

function translatePlace(place: string): string {
  // "16 km SSW of Morón, Venezuela" -> "16 km al SSO de Morón, Venezuela"
  const m = place.match(/^(\d+\s*km)\s+([NSEW]+)\s+of\s+(.+)$/i);
  if (m) {
    const dir = m[2].toUpperCase().split("").map((c) => DIR[c] ?? c).join("");
    return `${m[1]} al ${dir} de ${m[3]}`;
  }
  return place.replace(/\bof\b/i, "de").replace(/\bregion\b/i, "región");
}

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

// Qué significa el número para una persona, no para un sismólogo.
function magMeaning(m: number | null): string {
  if (m == null) return "";
  if (m < 3) return "casi no se siente";
  if (m < 4) return "se siente leve, sin daños";
  if (m < 5) return "se siente, rara vez causa daños";
  if (m < 6) return "fuerte, puede causar daños menores";
  if (m < 7) return "muy fuerte, puede causar daños";
  return "violento, puede causar daños serios";
}

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

export default function LiveSeismic() {
  const [state, setState] = useState<State>({
    quakes: [],
    lastSuccess: null,
    error: false,
    loading: true,
  });
  const [now, setNow] = useState(() => Date.now());
  const lastQuakes = useRef<Quake[]>([]);

  const load = useCallback(async () => {
    try {
      const start = new Date(Date.now() - WINDOW_DAYS * 86_400_000)
        .toISOString()
        .slice(0, 10);
      const url =
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
        `&starttime=${start}&minmagnitude=${MIN_MAG}&orderby=time` +
        `&minlatitude=${BBOX.minlatitude}&maxlatitude=${BBOX.maxlatitude}` +
        `&minlongitude=${BBOX.minlongitude}&maxlongitude=${BBOX.maxlongitude}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const quakes: Quake[] = (data.features ?? []).map((f: any) => ({
        id: f.id,
        mag: f.properties?.mag ?? null,
        magType: f.properties?.magType ?? null,
        place: f.properties?.place ?? "Venezuela",
        time: f.properties?.time ?? 0,
        depth: f.geometry?.coordinates?.[2] ?? null,
        tsunami: f.properties?.tsunami ?? 0,
      }));
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
    const tick = setInterval(() => setNow(Date.now()), 1000);
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
    </div>
  );
}
