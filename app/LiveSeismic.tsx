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

      <div style={{ marginTop: 14 }}>
        <span className="mag-label">Último movimiento registrado</span>
        <div className="live-row" style={{ alignItems: "flex-end" }}>
          <span className="mag">
            {latest.mag != null ? latest.mag.toFixed(1) : "—"}
          </span>
          <span className="updated">{ago(latest.time, now)}</span>
        </div>
        <div className="quake-place">{translatePlace(latest.place)}</div>
        <div className="quake-meta">
          {latest.depth != null
            ? `${Math.round(latest.depth)} km de profundidad`
            : "Profundidad no disponible"}
          {latest.magType ? ` · ${latest.magType}` : ""}
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-num">{last24h}</div>
          <div className="stat-cap">movimientos en 24 h</div>
        </div>
        <div className="stat">
          <div className="stat-num">
            {largest.mag != null ? largest.mag.toFixed(1) : "—"}
          </div>
          <div className="stat-cap">mayor en {WINDOW_DAYS} días</div>
        </div>
      </div>

      <div className={`banner ${tsunamiFlag ? "banner-neutral" : "banner-ok"}`}>
        {tsunamiFlag ? (
          <>
            Un sismo reciente activó revisión de tsunami. Confirma el aviso
            oficial vigente en{" "}
            <a href="https://www.tsunami.gov" target="_blank" rel="noopener">
              tsunami.gov
            </a>
            .
          </>
        ) : (
          <>
            Sin alerta de tsunami activa por estos sismos. Estado oficial:{" "}
            <a href="https://www.tsunami.gov" target="_blank" rel="noopener">
              tsunami.gov
            </a>
            .
          </>
        )}
      </div>

      <p className="updated" style={{ marginTop: 12 }}>
        Las réplicas son normales tras un sismo fuerte y pueden seguir días o
        semanas. Datos: U.S. Geological Survey (USGS), región Venezuela,
        magnitud {MIN_MAG}+.
      </p>
    </div>
  );
}
