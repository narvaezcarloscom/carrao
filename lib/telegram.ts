// Publicador a Telegram (Bot API) — el canal de difusión push/anti-bloqueo.
//
// DORMIDO por defecto: si faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHANNEL,
// `postToTelegram` es un no-op silencioso (devuelve false) y nunca lanza, para
// no romper el pipeline. Se activa cuando esas env vars existan en Vercel.
//
// Setup (2 min): crear bot con @BotFather → token; crear canal; agregar el bot
// como administrador del canal; TELEGRAM_CHANNEL = "@handle" del canal (o el id
// numérico). Redeploy para que las env tomen efecto.

export function telegramEnabled(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL);
}

type PostOptions = {
  silent?: boolean; // sin sonido/vibración (para items de baja urgencia)
  preview?: boolean; // mostrar vista previa del enlace (default: no, por ligereza)
};

// Envía un mensaje al canal. Devuelve true si Telegram aceptó, false si está
// dormido o si falló (el llamador decide si reintentar o ignorar).
export async function postToTelegram(text: string, opts: PostOptions = {}): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channel = process.env.TELEGRAM_CHANNEL;
  if (!token || !channel) return false; // dormido

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: channel,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: opts.preview !== true,
        disable_notification: opts.silent === true,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
