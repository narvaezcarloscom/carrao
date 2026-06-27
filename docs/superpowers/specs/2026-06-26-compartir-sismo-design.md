# Compartir tarjeta sísmica — diseño

**Fecha:** 2026-06-26 · **Componente:** `app/LiveSeismic.tsx`
**Origen:** réplica M4.7 al N de El Limón (26 jun 2026); la gente quiere avisar a su familia.

## Objetivo

Permitir compartir el estado sísmico actual desde la tarjeta en vivo, en dos canales
que NO son el mismo problema técnico:

1. **Enlace/texto** (WhatsApp, Telegram, copiar) — canal real de quien está *dentro*.
2. **Imagen para historia de Instagram** — una historia solo acepta imagen, no texto;
   sirve a la *diáspora* / buena conexión que quiere amplificar info verificada.

## Principio rector: segmentación por capacidad, no por sniffing

No se identifica al usuario ni se lee user-agent. El dispositivo **se autoselecciona**
por detección de capacidad. Esto respeta la promesa 2G: el teléfono viejo dentro de
Venezuela nunca descarga ni ejecuta el generador de imagen.

| Capacidad detectada | Qué se muestra |
|---|---|
| `navigator.share` existe | botón **Compartir** (enlace + texto) |
| sin `navigator.share` | botón **Copiar enlace** (clipboard) |
| `navigator.canShare({files})` y NO `saveData` y NO `effectiveType` 2g | + botón **Imagen para tu historia** |

`navigator.connection` no existe en iOS; por eso el filtro de conexión solo *suprime*
el botón de imagen en Android lento/ahorro de datos. En iOS el botón de imagen aparece
porque iOS sí soporta compartir archivos (es teléfono capaz por definición).

Flags inicializan en `false` → el render del servidor (ISR) y el primer render del
cliente coinciden (sin botones) → sin hydration mismatch. `useEffect` los activa.

## Reglas duras que hereda la imagen

- **Sin webfonts:** canvas dibuja con **fuentes del sistema** (`system-ui, -apple-system,
  Roboto`). Mismo look que la tarjeta, cero descarga.
- **$0 y offline-tolerante:** la imagen se genera **en el cliente con canvas**, no en
  servidor (ni función ni costo; funciona aunque la red parpadee).
- **Atada a la fuente:** la imagen lleva siempre `según USGS · {hora}` y `carraocanta.com`.
- **Apolítica, sin alarmismo:** retransmite el veredicto en palabras ya calculado, no
  agrega datos. Pie: "Información verificada, sin postura política."

## Implementación

### `app/shareImage.ts` (nuevo, cliente)

Función pura `drawStoryImage(data): Promise<Blob>`:
- Canvas **1080×1920** (9:16, historia IG).
- Fondo ivory `#f7f4ec`. Helpers locales: `roundRect`, `wrapText`.
- Bloques (de arriba a abajo): marca "Carrao" + regla acento · "EN VIVO · USGS · {hora}"
  · bloque veredicto (rect con color de nivel: ok/elevated/danger, mismos tokens del CSS)
  · línea tsunami solo si `danger` · ÚLTIMO TEMBLOR: mag grande + significado + lugar +
  profundidad · dos stats (réplicas 24h / sismo principal) · pie con USGS + carraocanta.com
  + nota apolítica.
- Export `image/png` (texto nítido sobre colores planos; PNG comprime bien).

Recibe un objeto compacto ya calculado por el componente (verdict, latest{mag, meaning,
place, depth, agoText}, largest{mag, agoText}, last24h, tsunamiFlag, horaText). No vuelve
a calcular nada.

### `app/LiveSeismic.tsx`

- Estado `cap`: `{ link: boolean; image: boolean }`, init `false`, set en `useEffect`.
- `.share-row` al final de la tarjeta principal (tras el disclaimer USGS).
- Botón compartir → `navigator.share({ title, text, url })` con texto atado/apolítico.
  Fallback copiar enlace si no hay `navigator.share`.
- Botón "Imagen para tu historia" (si `cap.image`) → estado "Generando…" → `drawStoryImage`
  → `new File([blob], 'carrao-sismo.png')` → `navigator.share({ files })`. Ignora
  `AbortError` (usuario canceló). Si falla, vuelve al label normal sin romper la página.
- Solo en la tarjeta con datos (la calma/sin-sismos no entra en alcance v1).

### `app/globals.css`

`.share-row` (flex, gap, border-top, margin-top) y `.share-btn` (alto táctil ≥44px,
estilo coherente con `.more-btn`; variante historia con acento suave).

## Texto a compartir (enlace)

> Sismos en Venezuela ahora mismo, según USGS — info verificada, liviana y sin postura
> política: https://carraocanta.com

## Fuera de alcance (v1)

- Bloque diáspora "no logras contactar a los tuyos → familylinks.icrc.org" en la imagen
  (pendiente mayor ya anotado en CLAUDE.md; se evalúa en v2).
- Imagen server-side / OG endpoint.
- Compartir desde el estado de calma o sin sismos.
