// Tipos y fetch de USGS (región Venezuela), compartidos entre el servidor
// (HTML inicial vía ISR → evita CLS) y el cliente (poll en vivo cada 90s).

export type Quake = {
  id: string;
  mag: number | null;
  magType: string | null;
  place: string;
  time: number;
  depth: number | null;
  tsunami: number;
};

// Caja aproximada de Venezuela para filtrar el feed de USGS.
const BBOX = {
  minlatitude: 0.5,
  maxlatitude: 13.5,
  minlongitude: -74,
  maxlongitude: -59,
};
export const MIN_MAG = 2.5;
export const WINDOW_DAYS = 7;

export async function fetchVenezuelaQuakes(): Promise<Quake[]> {
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
    }): Quake => ({
      id: f.id,
      mag: f.properties?.mag ?? null,
      magType: f.properties?.magType ?? null,
      place: f.properties?.place ?? "Venezuela",
      time: f.properties?.time ?? 0,
      depth: f.geometry?.coordinates?.[2] ?? null,
      tsunami: f.properties?.tsunami ?? 0,
    })
  );
}
