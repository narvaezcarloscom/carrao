// Tipos y fetch sísmico (región Venezuela), compartidos entre el servidor
// (HTML inicial vía ISR → evita CLS) y el cliente (poll en vivo cada 90s).
//
// Dos fuentes oficiales fusionadas: USGS (FDSN) y EMSC (seismicportal.eu).
// Ambas mandan CORS `*`, así que el teléfono las consulta directo — sin pasar
// por nuestro servidor (resiliencia: si carrao cae, el dato igual llega).
// Se prefiere USGS en duplicados (trae flag de tsunami y mejor formato de lugar);
// EMSC suma los locales que USGS laguea o no reporta.

export type Quake = {
  id: string;
  mag: number | null;
  magType: string | null;
  place: string;
  time: number;
  depth: number | null;
  tsunami: number;
};

type RawQuake = Quake & { lat: number; lon: number };

// Caja aproximada de Venezuela para filtrar ambos feeds.
const BBOX = {
  minlatitude: 0.5,
  maxlatitude: 13.5,
  minlongitude: -74,
  maxlongitude: -59,
};
export const MIN_MAG = 2.5;
export const WINDOW_DAYS = 7;

function startDate(): string {
  return new Date(Date.now() - WINDOW_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

async function fetchUSGS(): Promise<RawQuake[]> {
  const url =
    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
    `&starttime=${startDate()}&minmagnitude=${MIN_MAG}&orderby=time` +
    `&minlatitude=${BBOX.minlatitude}&maxlatitude=${BBOX.maxlatitude}` +
    `&minlongitude=${BBOX.minlongitude}&maxlongitude=${BBOX.maxlongitude}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`USGS ${res.status}`);
  const data = await res.json();
  return (data.features ?? []).map(
    (f: {
      id: string;
      properties?: {
        mag?: number | null;
        magType?: string | null;
        place?: string;
        time?: number;
        tsunami?: number;
      };
      geometry?: { coordinates?: number[] };
    }): RawQuake => ({
      id: f.id,
      mag: f.properties?.mag ?? null,
      magType: f.properties?.magType ?? null,
      place: f.properties?.place ?? "Venezuela",
      time: f.properties?.time ?? 0,
      depth: f.geometry?.coordinates?.[2] ?? null,
      tsunami: f.properties?.tsunami ?? 0,
      lat: f.geometry?.coordinates?.[1] ?? 0,
      lon: f.geometry?.coordinates?.[0] ?? 0,
    })
  );
}

// "OFFSHORE ARAGUA, VENEZUELA" -> "Offshore Aragua, Venezuela"
function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchEMSC(): Promise<RawQuake[]> {
  const url =
    `https://www.seismicportal.eu/fdsnws/event/1/query?format=json` +
    `&start=${startDate()}&minmag=${MIN_MAG}&orderby=time&limit=200` +
    `&minlat=${BBOX.minlatitude}&maxlat=${BBOX.maxlatitude}` +
    `&minlon=${BBOX.minlongitude}&maxlon=${BBOX.maxlongitude}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`EMSC ${res.status}`);
  const data = await res.json();
  return (data.features ?? []).map(
    (f: {
      id?: string;
      properties?: {
        unid?: string;
        mag?: number | null;
        magtype?: string | null;
        flynn_region?: string;
        time?: string;
        depth?: number | null;
        lat?: number;
        lon?: number;
      };
    }): RawQuake => {
      const p = f.properties ?? {};
      return {
        id: `emsc-${p.unid ?? f.id ?? p.time}`,
        mag: p.mag ?? null,
        magType: p.magtype ?? null,
        place: p.flynn_region ? titleCase(p.flynn_region) : "Venezuela",
        time: p.time ? Date.parse(p.time) : 0,
        depth: p.depth ?? null,
        tsunami: 0, // EMSC no expone flag de tsunami; se prefiere USGS si coincide
        lat: p.lat ?? 0,
        lon: p.lon ?? 0,
      };
    }
  );
}

// Distancia aproximada en km entre dos coordenadas (haversine).
function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Mismo sismo reportado por dos agencias: cercano en tiempo y espacio.
// Las magnitudes difieren entre agencias, así que no se cierra sobre mag.
function isSameEvent(a: RawQuake, b: RawQuake): boolean {
  return Math.abs(a.time - b.time) < 100_000 && distanceKm(a.lat, a.lon, b.lat, b.lon) < 70;
}

export async function fetchVenezuelaQuakes(): Promise<Quake[]> {
  const [usgs, emsc] = await Promise.allSettled([fetchUSGS(), fetchEMSC()]);
  const fromUSGS = usgs.status === "fulfilled" ? usgs.value : [];
  const fromEMSC = emsc.status === "fulfilled" ? emsc.value : [];

  // Si ambas fuentes fallan, propaga el error (el llamador ya maneja el fallo).
  if (usgs.status === "rejected" && emsc.status === "rejected") {
    throw new Error("USGS y EMSC no respondieron");
  }

  // USGS manda; EMSC suma solo lo que USGS no tiene.
  const merged: RawQuake[] = [...fromUSGS];
  for (const e of fromEMSC) {
    if (!merged.some((m) => isSameEvent(m, e))) merged.push(e);
  }
  merged.sort((a, b) => b.time - a.time);

  return merged.map(({ lat: _lat, lon: _lon, ...q }) => q);
}
