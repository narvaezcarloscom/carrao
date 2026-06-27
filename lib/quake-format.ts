// Helpers de formato sísmico compartidos entre el cliente (app/LiveSeismic.tsx)
// y el publicador a Telegram (lib/seismicPush.ts). Funciones puras, sin deps.

const DIR: Record<string, string> = { W: "O" }; // norte/sur/este iguales; oeste = O

// "16 km SSW of Morón, Venezuela" -> "16 km al SSO de Morón, Venezuela"
export function translatePlace(place: string): string {
  const m = place.match(/^(\d+\s*km)\s+([NSEW]+)\s+of\s+(.+)$/i);
  if (m) {
    const dir = m[2].toUpperCase().split("").map((c) => DIR[c] ?? c).join("");
    return `${m[1]} al ${dir} de ${m[3]}`;
  }
  return place.replace(/\bof\b/i, "de").replace(/\bregion\b/i, "región");
}

export function ago(ms: number, now: number): string {
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
export function magMeaning(m: number | null): string {
  if (m == null) return "";
  if (m < 3) return "casi no se siente";
  if (m < 4) return "se siente leve, sin daños";
  if (m < 5) return "se siente, rara vez causa daños";
  if (m < 6) return "fuerte, puede causar daños menores";
  if (m < 7) return "muy fuerte, puede causar daños";
  return "violento, puede causar daños serios";
}
