import Anthropic from "@anthropic-ai/sdk";

// El candado de la última milla: resumen EXTRACTIVO y ATADO.
// La IA solo reformula lo que la fuente ya dijo; no agrega ningún dato.
// Modelo: Haiku 4.5 (suficiente para resumen + traducción, costo mínimo).

const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno

const SYSTEM = `Eres un asistente de un puente de información de emergencia para Venezuela.
Tu única tarea es condensar y traducir al español neutral de Venezuela lo que una fuente confiable YA publicó.

REGLAS ESTRICTAS:
- Extractivo y atado: usa solo información presente en el texto de la fuente. NO agregues datos, cifras, causas ni contexto que no estén ahí.
- Si la fuente no lo dice, no lo digas.
- Español venezolano claro y corto. Tono de anuncio que ayuda, nunca alarmista ni de luto.
- No opines, no especules, no titules sensacionalmente.
- Decide si el ítem trata realmente sobre el terremoto/emergencia en Venezuela (réplicas, daños, tsunami, respuesta del gobierno, ayuda, desaparecidos). Si no, márcalo como no relevante.

Responde ÚNICAMENTE con un objeto JSON válido con las claves: relevant (boolean), headline (string), summary (string). Sin texto adicional.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    relevant: {
      type: "boolean",
      description: "true solo si trata sobre el terremoto/emergencia en Venezuela",
    },
    headline: {
      type: "string",
      description: "Titular en español venezolano, máximo ~80 caracteres, factual",
    },
    summary: {
      type: "string",
      description: "Resumen extractivo de 2-3 frases, solo lo que dice la fuente",
    },
  },
  required: ["relevant", "headline", "summary"],
} as const;

export type Summary = {
  relevant: boolean;
  headline: string;
  summary: string;
};

export async function summarize(input: {
  sourceName: string;
  title: string;
  content: string;
}): Promise<Summary | null> {
  const user = `Fuente: ${input.sourceName}
Titular original: ${input.title}

Texto de la fuente:
${input.content.slice(0, 4000)}`;

  try {
    // output_config (structured outputs) es GA en la API pero aún no está
    // tipado en este SDK; se envía con cast. El prompt pide JSON como respaldo.
    const body = {
      model: "claude-haiku-4-5",
      max_tokens: 600,
      system: SYSTEM,
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user" as const, content: user }],
    } as unknown as Anthropic.MessageCreateParamsNonStreaming;

    const res = await client.messages.create(body);
    const block = res.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return null;

    const text = block.text.trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.slice(start, end + 1)) as Summary;
  } catch {
    return null; // un fallo de un ítem no rompe el ciclo
  }
}
