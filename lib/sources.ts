// Lista blanca de fuentes (allowlist). La garantía de veracidad: solo
// entran fuentes que hacen su propio protocolo de validación. Curada a mano.
// Reuters/AP no exponen RSS público estable; se incorporan luego por otra vía.

export type SourceType = "intl" | "ve";

export type Source = {
  name: string;
  feedUrl: string;
  type: SourceType;
};

export const SOURCES: Source[] = [
  // Internacionales (wire / humanitaria)
  { name: "BBC Mundo", feedUrl: "https://feeds.bbci.co.uk/mundo/rss.xml", type: "intl" },
  { name: "ReliefWeb", feedUrl: "https://reliefweb.int/updates/rss.xml?primary_country=240", type: "intl" },
  // Venezolanas independientes (curaduría de Carlos)
  { name: "Efecto Cocuyo", feedUrl: "https://efectococuyo.com/feed/", type: "ve" },
  { name: "El Pitazo", feedUrl: "https://elpitazo.net/feed/", type: "ve" },
  { name: "Runrun.es", feedUrl: "https://runrun.es/feed/", type: "ve" },
];

// Filtro de relevancia: solo pasan ítems sobre el evento de emergencia.
// La IA hace un segundo filtro semántico después; esto es el primer cedazo barato.
const KEYWORDS = [
  "sismo", "terremoto", "réplica", "replica", "tsunami", "temblor",
  "magnitud", "epicentro", "funvisis", "protección civil", "proteccion civil",
  "damnificad", "carabobo", "yumare", "morón", "moron", "puerto cabello",
  "derrumbe", "colaps", "sismológic", "sismologic",
];

export function isRelevant(text: string): boolean {
  const t = text.toLowerCase();
  return KEYWORDS.some((k) => t.includes(k));
}
