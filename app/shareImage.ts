// Genera la imagen compartible de la tarjeta sísmica para historias (IG y otras).
// Cliente puro: canvas + fuentes del sistema (sin webfonts), $0, tolerante a red.
// Solo retransmite el veredicto en palabras ya calculado — no agrega datos.

export type StoryData = {
  verdict: { level: "ok" | "elevated" | "danger"; headline: string; message: string };
  latest: { mag: string; meaning: string; place: string; depthText: string | null; agoText: string };
  largest: { mag: string; agoText: string };
  last24h: number;
  tsunamiFlag: boolean;
  horaText: string;
};

// Mismos tokens que app/globals.css — la imagen se ve idéntica a la tarjeta.
const C = {
  bg: "#f7f4ec",
  surface: "#fffdf8",
  ink: "#1b1a17",
  inkSoft: "#57534b",
  line: "#e4ded0",
  accent: "#b45309",
  danger: "#b91c1c",
};
const VERDICT = {
  ok: { bg: "#e8f3ec", head: "#14532d", msg: "#1f5135" },
  elevated: { bg: "#fdf0dd", head: "#7c2d12", msg: "#7c2d12" },
  danger: { bg: "#fbe9e9", head: "#7f1d1d", msg: "#7f1d1d" },
} as const;

const W = 1080;
const H = 1920;
const PAD = 80;
const FAMILY = `-apple-system, system-ui, "Segoe UI", Roboto, sans-serif`;
const font = (weight: number, size: number) => `${weight} ${size}px ${FAMILY}`;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Parte el texto en líneas según el ancho disponible (la fuente ya debe estar fijada).
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && cur) {
      out.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) out.push(cur);
  return out;
}

export async function drawStoryImage(data: StoryData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas no disponible");

  const inner = W - PAD * 2;
  ctx.textBaseline = "top";

  // Fondo
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  let y = PAD + 12;

  // Marca
  ctx.fillStyle = C.ink;
  ctx.font = font(800, 72);
  ctx.fillText("Carrao", PAD, y);
  y += 86;
  ctx.fillStyle = C.accent;
  roundRect(ctx, PAD, y, 88, 7, 3.5);
  ctx.fill();
  y += 7;
  ctx.fillStyle = C.inkSoft;
  ctx.font = font(600, 26);
  ctx.fillText("Puente de emergencia · Venezuela", PAD, y + 18);
  y += 18 + 38;

  // En vivo · USGS · hora
  ctx.fillStyle = C.inkSoft;
  ctx.font = font(700, 26);
  ctx.fillText(`EN VIVO · USGS · ${data.horaText}`, PAD, y);
  y += 56;

  // Bloque veredicto (mide el mensaje antes de pintar el rect)
  const vc = VERDICT[data.verdict.level];
  const vPadX = 40;
  const vPadY = 38;
  ctx.font = font(800, 48);
  const headLines = wrap(ctx, data.verdict.headline, inner - vPadX * 2);
  ctx.font = font(500, 34);
  const msgLines = wrap(ctx, data.verdict.message, inner - vPadX * 2);
  const headLH = 58;
  const msgLH = 46;
  const vH = vPadY * 2 + headLines.length * headLH + 16 + msgLines.length * msgLH;
  roundRect(ctx, PAD, y, inner, vH, 22);
  ctx.fillStyle = vc.bg;
  ctx.fill();
  let vy = y + vPadY;
  ctx.fillStyle = vc.head;
  ctx.font = font(800, 48);
  for (const line of headLines) {
    ctx.fillText(line, PAD + vPadX, vy);
    vy += headLH;
  }
  vy += 16;
  ctx.fillStyle = vc.msg;
  ctx.font = font(500, 34);
  for (const line of msgLines) {
    ctx.fillText(line, PAD + vPadX, vy);
    vy += msgLH;
  }
  y += vH + 40;

  // Tsunami: solo si hay aviso
  if (data.tsunamiFlag) {
    ctx.fillStyle = C.danger;
    ctx.font = font(700, 32);
    const tLines = wrap(ctx, "Si estás cerca de la costa, aléjate a un lugar alto. Confirma en tsunami.gov", inner);
    for (const line of tLines) {
      ctx.fillText(line, PAD, y);
      y += 44;
    }
    y += 18;
  }

  // Divisor
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 40;

  // Último temblor
  ctx.fillStyle = C.inkSoft;
  ctx.font = font(700, 28);
  ctx.fillText(`ÚLTIMO TEMBLOR · ${data.latest.agoText}`.toUpperCase(), PAD, y);
  y += 46;
  ctx.fillStyle = C.ink;
  ctx.font = font(800, 200);
  ctx.fillText(data.latest.mag, PAD, y);
  y += 210;
  ctx.font = font(600, 38);
  ctx.fillText(data.latest.meaning, PAD, y);
  y += 56;
  ctx.fillStyle = C.ink;
  ctx.font = font(700, 40);
  for (const line of wrap(ctx, data.latest.place, inner)) {
    ctx.fillText(line, PAD, y);
    y += 50;
  }
  if (data.latest.depthText) {
    ctx.fillStyle = C.inkSoft;
    ctx.font = font(500, 30);
    ctx.fillText(data.latest.depthText, PAD, y + 4);
    y += 44;
  }
  y += 28;

  // Dos stats
  const gap = 24;
  const boxW = (inner - gap) / 2;
  const boxH = 150;
  const stats = [
    { num: String(data.last24h), cap: data.last24h === 1 ? "réplica en 24 h" : "réplicas en 24 h" },
    { num: data.largest.mag, cap: `el sismo principal · ${data.largest.agoText}` },
  ];
  stats.forEach((s, i) => {
    const bx = PAD + i * (boxW + gap);
    roundRect(ctx, bx, y, boxW, boxH, 16);
    ctx.fillStyle = C.surface;
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    roundRect(ctx, bx, y, boxW, boxH, 16);
    ctx.stroke();
    ctx.fillStyle = C.ink;
    ctx.font = font(800, 64);
    ctx.fillText(s.num, bx + 28, y + 24);
    ctx.fillStyle = C.inkSoft;
    ctx.font = font(500, 26);
    for (const line of wrap(ctx, s.cap, boxW - 56)) {
      ctx.fillText(line, bx + 28, y + 98);
      break; // una línea: la caption es corta
    }
  });

  // Pie: la atribución (USGS + enlace) es regla dura y debe quedar visible aun
  // bajo la barra de respuesta de una historia (~150 px). Por eso se ancla más
  // arriba del borde, no pegado al fondo.
  ctx.fillStyle = C.accent;
  ctx.font = font(800, 44);
  ctx.fillText("carraocanta.com", PAD, H - PAD - 196);
  ctx.fillStyle = C.inkSoft;
  ctx.font = font(500, 26);
  ctx.fillText("No se puede predecir un sismo. Datos: U.S. Geological Survey (USGS).", PAD, H - PAD - 134);
  ctx.fillText("Información verificada, sin postura política.", PAD, H - PAD - 98);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("no se pudo generar la imagen"))),
      "image/png"
    );
  });
}
