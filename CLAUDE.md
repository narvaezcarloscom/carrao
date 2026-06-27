# Carrao — Puente de información de emergencia para Venezuela

**Live:** https://carraocanta.com (SSL ok) · respaldo https://carrao.vercel.app
**Repo:** github.com/narvaezcarloscom/carrao (público) · **Licencia:** PolyForm Noncommercial 1.0.0
**Nació:** 2026-06-25, a raíz del terremoto de Venezuela (M7.5, epicentro frente a Carabobo, 24 jun 2026).

## Qué es

**No es un medio. Es un puente.** No produce noticias: reúne lo que fuentes confiables ya verificaron, lo resume/traduce y lo entrega ultra-ligero para teléfonos modestos, conexiones saturadas y bloqueo de IP del país. Audiencia primaria: **quien está dentro de Venezuela**. Esfuerzo **independiente, sin fines de lucro, sin postura política**.

Documento de diseño original (brainstorm): `docs/superpowers/specs/2026-06-25-carrao-design.md` (artefacto histórico; la foto actual es este CLAUDE.md + el README público).

## Reglas duras (no negociables)

- **Promesa 2G:** ultra-ligero. **Sin imágenes pesadas, sin webfonts, sin video, sin `color-mix` ni CSS frágil** (la audiencia tiene teléfonos viejos), JS al mínimo, **fuentes del sistema** (Roboto en Android, SF en iPhone).
- **Cero PII:** no se hospedan listas de personas; solo se enlaza a servicios oficiales.
- **Veracidad por allowlist:** solo entran fuentes que ya validan su info. Resumen **extractivo y atado** (la IA no agrega datos que no estén en la fuente). Siempre visible: fuente + hora + enlace al original.
- **Apolítico:** retransmite, no opina, no toma bando, no endosa.
- **Sin Tailwind:** CSS plano con variables (en `app/globals.css`), a propósito, por ligereza.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · CSS plano · Vercel **Pro** (necesario para cron por minuto). Deps: `@anthropic-ai/sdk`, `@vercel/blob`, `rss-parser`.

## Arquitectura

La página (`app/page.tsx`) son 4 capas en scroll vertical, con barra de salto sticky (Ahora · Noticias · Qué hacer · Mi gente) y color semántico por sección:

1. **Capa 1 — Sísmico** (`app/LiveSeismic.tsx`): componente cliente que consulta el feed GeoJSON de **USGS cada 90s** (región Venezuela). Muestra un **veredicto en palabras** (no datos crudos) + estado de tsunami + último temblor con su significado. Sin servidor — el teléfono consulta USGS directo. Incluye **compartir, atado a la capacidad del dispositivo, no a sniffing**: botón de enlace/texto universal (WhatsApp/Telegram) y, solo en teléfonos que pueden compartir archivos y no están en 2G/ahorro de datos, **imagen 1080×1920 para historia** generada en cliente con canvas y fuentes del sistema (`app/shareImage.ts`). La promesa 2G queda intacta: el usuario en el país nunca descarga el generador. Flags init en `false` → sin hydration mismatch con el ISR. Spec: `docs/superpowers/specs/2026-06-26-compartir-sismo-design.md`.
2. **Capa 2 — Noticias** (`app/NewsFeed.tsx`): consume `/api/feed`, renderiza tarjetas resumidas con chips de filtro (Todas/Nacionales/Internacionales, filtro de **cliente**, cero red) y colapso a 6 + "Ver más". Fallback con gracia a enlaces curados si el feed está vacío.
3. **Capa 3 — Protocolos** (estático): qué hacer si vuelve a temblar / si el hogar no es seguro + Protección Civil.
4. **Capa 4 — Mi gente** (estático, dos bloques, **en el nav**): *Busco a un familiar* (Cruz Roja Venezolana, perspectiva desde dentro) y *Estás afuera y no logras contactar a los tuyos* (diáspora: 4 pasos ordenados y apolíticos — escribir en vez de llamar con WhatsApp/Telegram/SMS, un punto de contacto, paciencia con la red, y el rastreo transfronterizo del **CICR `familylinks.icrc.org`**). Sin mención a postura de gobierno sobre apps de mensajería (apolítico). Devuelta al nav tras ganar peso real.

### Pipeline de noticias (v2)

```
Vercel Cron (cada 15 min, vercel.json)
  → GET /api/refresh/news  (protegido por CRON_SECRET)
    → lib/feed.ts refreshFeed():
        RSS de la allowlist (lib/sources.ts)
        → filtro por keywords (lib/sources.ts isRelevant)
        → lib/summarize.ts: Claude Haiku 4.5, resumen extractivo + traducción ES-VE
          (structured output JSON; el cliente se inicializa perezoso)
        → dedup por URL, tope MAX_NEW_PER_SOURCE=6/fuente, MAX_ITEMS=40
        → escribe feed.json a Vercel Blob (store "carrao-feed")
GET /api/feed → lee feed.json del Blob, Cache-Control s-maxage=60 (CDN)
  → NewsFeed (cliente) lo pinta
```

Fuentes activas (`lib/sources.ts`): BBC Mundo, ReliefWeb (`?primary_country=240`), Efecto Cocuyo, El Pitazo, Runrun.es. *El Universal descartado (independencia post-2014). Reuters/AP no tienen RSS público estable.*

## Variables de entorno (en Vercel)

| Var | Para qué | Origen |
|---|---|---|
| `ANTHROPIC_API_KEY` | Haiku 4.5 (resumen/traducción) | console.anthropic.com, org NDM, créditos prepago |
| `BLOB_READ_WRITE_TOKEN` | escribir/leer feed.json | conexión del Blob store "carrao-feed" |
| `CRON_SECRET` | autenticar el cron y el refresh manual | generado; Vercel Cron lo manda como `Authorization: Bearer` |

(La conexión del Blob también crea `BLOB_STORE_ID` y `BLOB_WEBHOOK_PUBLIC_KEY`.) **Cambiar cualquier env requiere redeploy** para que tome efecto.

## Cómo operar

**Correr local:** `npm install && npm run dev`. Para que el pipeline funcione local se necesitan las env vars (`vercel env pull`).

**Deploy:** `vercel --prod --yes` desde la carpeta del proyecto (CLI). El repo está en GitHub; el deploy hoy es manual por CLI. Build local de sanity: `npm run build`.

**Refrescar el feed a mano** (sin esperar al cron): el endpoint pide `Authorization: Bearer $CRON_SECRET`. El valor es sensible y no se puede `pull` desde Vercel; si se necesita disparar manual, resetear `CRON_SECRET` a un valor conocido (`vercel env rm/add CRON_SECRET <env>`), redeploy, y:
```
curl -H "Authorization: Bearer <secret>" https://carraocanta.com/api/refresh/news
```
En condiciones normales **no hace falta** — el cron corre solo cada 15 min.

**Agregar/quitar una fuente:** editar `lib/sources.ts` (`SOURCES`). El RSS debe responder 200 directo (ojo: `rss-parser` **no sigue redirects 301** — verificar la URL final con `curl -L` antes; así se cayó ReliefWeb al inicio). Ajustar `KEYWORDS` ahí mismo si hace falta.

**Ver el feed crudo:** `curl "https://carraocanta.com/api/feed?t=$(date +%s)"` (el `?t=` evita la caché del CDN).

**Ver costo/uso de IA:** dashboard de Anthropic (console.anthropic.com). Haiku 4.5 ≈ centavos/día.

## Gotchas conocidos

- **Caché de WhatsApp (OG):** la vista previa se cachea agresivo. Tras cambiar `opengraph-image`/metadata, compartir con `?s=1` para forzar re-scrape.
- **Caché del CDN en `/api/feed`:** `s-maxage=60` + `stale-while-revalidate=300`. Tras un refresh, puede servir la versión vieja hasta ~60s (sirve `STALE` mientras revalida). Es esperado.
- **Haiku no acepta `output_config.effort` ni `thinking` adaptativo** — no se los pases.
- **`output_config` (structured outputs) no está tipado en `@anthropic-ai/sdk` 0.70** — se envía con cast; el prompt pide JSON como respaldo y el parseo es tolerante.

## Pendientes / próximos

- **Imagen compartible v2:** llevar el contenido del bloque diáspora ("no logras contactar a los tuyos" → `familylinks.icrc.org`) **dentro** de la imagen de historia, no solo en la página.
- **Probar el share nativo en iPhone real:** validar el flujo "Añadir a tu historia" en iOS (no testeable sin dispositivo físico).
- **Reel de presentación** (guion en sesión 2026-06-25, pendiente de elegir versión).
- Opcional: feed sísmico server-side cada 2 min, sumar EMSC/Funvisis/PTWC, Reuters/AP por vía no-RSS.

*Hecho 2026-06-26/27 (antes pendientes): compartir tarjeta sísmica (enlace + imagen de historia), bloque diáspora y "Mi gente" de vuelta al nav.*

## Decisiones conscientes (no se hace, y por qué)

- **Filtro de casos individuales de personas en el feed** ("se encontró un niño, se buscan sus padres" / "padres buscan a…"): **descartado.** Choca de frente con la regla **Cero PII**; esos avisos viven en redes sociales, no en el RSS de medios (no habría material); y son vector conocido de estafa/desinformación y riesgo para menores tras un desastre. El canal seguro para "jalar el hilo" es el **CICR** (ya enlazado en "Mi gente"). Versión segura posible a futuro: un chip de *noticias institucionales del esfuerzo* de reunificación (centros, activación de rastreo — sin PII), solo si las fuentes lo producen.
