# Carrao — Documento de diseño

- **Fecha:** 2026-06-25
- **Proyecto:** Carrao
- **Dominio:** carraocanta.com
- **Estado:** diseño aprobado, pendiente plan de implementación
- **Contexto detonante:** terremoto de Venezuela del 24 de junio de 2026 (M7.1→7.5, epicentro frente a Carabobo, cerca de Morón/Puerto Cabello).

---

## 1. Qué es Carrao

**No es un medio. Es un puente.**

> No producimos noticias. Reunimos en un solo lugar lo que las fuentes confiables ya verificaron, y lo entregamos tratado para el teléfono, la conexión y el bloqueo de IP de quien está adentro.

El valor no es decidir qué es verdad —eso lo decide la lista blanca de fuentes—; el valor es el **acceso**: que el dato verificado llegue a la mano del venezolano en las condiciones reales en las que está.

Tres transformaciones sobre lo que ya existe:
1. **Reunir** — un solo lugar, no buscar en diez.
2. **Traducir** — a español venezolano, claro y corto.
3. **Aligerar** — carga ultrarrápida, teléfono viejo, 2G, batería baja, rodeando el bloqueo de IP del país.

**El nombre.** El carrao (*Aramus guarauna*) es el ave llanera cuyo canto anuncia la lluvia antes que cualquier instrumento; su grito se oye a gran distancia por todo el llano. Es la metáfora del producto: el aviso temprano que llega lejos. Marca emotiva y compartible (se riega por WhatsApp), agnóstica al evento —sirve para cualquier emergencia futura, no solo este sismo.

**Tono de marca:** anuncio, no lamento. Aunque el canto del carrao es "lastimero", nos paramos enteros del lado del que **avisa para que te prepares**, no del que llora lo perdido. Esperanza accionable, nunca luto.

---

## 2. Audiencia

**Primaria: quien está dentro de Venezuela**, viviendo la situación. El diseño se decide para él.

Insight rector — **paradoja de latencia:** las fuentes oficiales internacionales (USGS, centros de tsunami) tienen el dato primero y más preciso, pero a quien está adentro le llega tarde por conectividad degradada, intermediación y bloqueo local. El que está parado en el temblor es el último en saber la magnitud real o si hay alerta de tsunami vigente. Carrao cierra esa brecha.

Consecuencias de diseño:
- **Español puro** (venezolano), EN mínimo o nulo.
- **Ultra-ligero de verdad:** 2G/3G, datos caros, batería baja. Sin imágenes pesadas, sin video, fuentes del sistema, JS al mínimo.
- Lo más urgente y perecedero arriba.

**Nota de descubrimiento:** el nombre es marca (memorable, compartible), no SEO. Quien está en pánico teclea "sismo Venezuela", no "carrao". El hallazgo se trabaja aparte: SEO, meta tags y difusión persona-a-persona.

---

## 3. Arquitectura de información — organizada por el miedo

La página responde, en orden, las preguntas que se hace el que está adentro con el pulso acelerado. Cuatro capas por urgencia:

### Capa 1 · Peligro inmediato (perecedero, cada segundo cuenta)
- ¿Va a haber réplica? → dato sísmico en vivo + explicación honesta de réplicas.
- ¿Hay tsunami? → estado de alerta oficial, vigente/cancelado.
- ¿Dónde estoy yo respecto al epicentro? ¿Es zona de riesgo?

### Capa 2 · Qué está pasando (tarjetas estilo "lógica Twitter")
- ¿Qué sabe el mundo que yo aquí adentro no sé?
- ¿Quién nos apoya — EE.UU., países de la región?
- ¿Qué está haciendo el gobierno nacional?

Patrón de tarjeta: **titular condensado → imagen ultra-comprimida si existe → "leer más" = resumen de carga ultrarrápida en español venezolano + cita y enlace a la fuente original + hora.**

### Capa 3 · Qué hago yo ahora (estable, se escribe una vez)
- Me quedé sin hogar: protocolo, refugios, plan de acción.
- Cómo me protejo ante una réplica.

### Capa 4 · Mi gente (índice, sin hospedar PII)
- Familiar desaparecido: dónde buscar listas de aparecidos, a qué centros de salud trasladan → **enlazamos a fuentes oficiales, no hospedamos la lista.** Google Person Finder, Cruz Roja "Restoring Family Links".

---

## 4. Modelo de veracidad

**Compuerta única: lista blanca de fuentes (allowlist).** La garantía de verdad se mueve de "nosotros validamos cada noticia" a "solo dejamos entrar fuentes que ya tienen su propio protocolo de validación". La curaduría humana se hace **una vez, sobre las fuentes** —no noticia por noticia—; por eso Carlos puede sostenerla sin operar una redacción.

**Blindaje de la última milla** (la fuente verdadera puede distorsionarse al resumir/traducir):
1. Resumen **extractivo y atado**: solo lo que la fuente dice, sin agregar ningún dato que no esté en el original. Si la fuente no lo dice, no lo decimos.
2. **Fuente + hora + enlace siempre visibles.** No etiquetamos "confirmado vs en desarrollo" (eso sería redacción); lo resolvemos con transparencia: "lo dice Reuters, hace 8 min" y el lector pesa.
3. La **Capa 1 (sísmica) es determinista**: dato estructurado oficial de USGS, sin matiz, 100% automática.

---

## 5. Fuentes v1 (corta, ponderada por relevancia)

Feed ordenado **más reciente primero**, con hora visible en cada tarjeta.

**Capa 1 · Científico/sísmico** (automatizable, determinista, gratis)
- **USGS** — feed GeoJSON en tiempo real (magnitud, profundidad, réplicas, ubicación). API pública.
- **EMSC-CSEM** — sismología europeo-mediterránea, rapidísima, con reportes "lo sentí". API.
- **Funvisis** — fuente sísmica oficial venezolana (sin API, curar web).
- **PTWC / Centro de Tsunami del Caribe (NOAA)** — estado de alerta de tsunami.

**Capa 2 · Agencias internacionales** (wire, alta confianza)
- **Reuters · AP · AFP** — lo confirmado global.
- **EFE** — agencia en español, foco LATAM.
- **BBC Mundo** — español, rigor editorial.
- **ReliefWeb (ONU/OCHA)** — fuente humanitaria oficial para "¿quién nos apoya?".

**Capa 2 · Venezolano creíble** (curaduría de Carlos, confirmada)
- **Efecto Cocuyo** — independiente, fuerte en verificación.
- **El Pitazo** — investigativo, red de corresponsales.
- **Runrun.es** — credibilidad alta.

*Evaluado y descartado:* **El Universal** — diario histórico (1909), pero tras la venta de 2014 perdió independencia editorial y hoy su credibilidad como verificador independiente es discutida. No entra en la allowlist v1.

**A favor:** varios medios venezolanos están bloqueados por ISP dentro del país. Como nosotros los consumimos y el lector lee *nuestro* resumen, la agregación **rodea el bloqueo local** — característica, no accidente.

Se separa: **registro de fuentes** reusable (amplio, plantilla a futuro) vs **fuentes activas de este evento** (corta, filtrada por relevancia).

---

## 6. Pipeline de actualización

**Automático**, sin operación diaria de Carlos (la compuerta humana ya está en la allowlist). Cron nativo de **Vercel Pro** (nivel de minutos).

**Cadencia escalonada (no un solo número):**

| Capa | Intervalo | Razón |
|---|---|---|
| 1 · Sísmico/tsunami | ~2 min | Donde vive el miedo a la réplica; debe sentirse en vivo. Gratis (datos crudos, no IA). |
| 2 · Noticias | ~15 min | Las agencias no cambian lo confirmado más rápido; cada ciclo cuesta IA. Punto funcional. |
| 3 · Protocolos | al desplegar | Estático. |
| 4 · Índice desaparecidos | 1×/día | Enlaces, casi no cambian. |

**Control de costo:** en cada ciclo de Capa 2 la IA procesa solo lo **nuevo** (dedup), no re-resume lo existente.

**Contador público honesto** (es un producto de confianza, no puede mentir):
1. Muestra la hora del **último ciclo exitoso**, no del último intento. Si un refresco falla, no se congela mintiendo — estado discreto "reintentando…".
2. Sísmico se muestra como "en vivo · hace 90s"; la cuenta regresiva ("próxima en 12 min") va en la capa de noticias (intervalo fijo).
3. Hora siempre en **hora de Venezuela (VET, UTC-4)** y en relativo ("hace 8 min").

---

## 7. Stack y restricciones técnicas

- **Next.js 16 en Vercel (Pro).** Server Components, JS de cliente al mínimo (solo poll sísmico en vivo + contador). Datos como JSON pequeño regenerado por el cron; páginas casi estáticas.
- **Ultra-ligero:** sin webfonts (fuentes del sistema), sin video, imágenes solo ultra-comprimidas (WebP/AVIF, dimensiones mínimas, lazy). Presupuesto de página agresivo para 2G.
- **Cero PII:** no se hospeda data de personas; Capa 4 solo enlaza a índices oficiales.
- **Bilingüe:** ES-VE por defecto; EN mínimo o ausente en v1.
- **Cron:** route handlers `/api/refresh/*` disparados por Vercel Cron.

---

## 8. Fuera de alcance (YAGNI v1)

- Hospedar base de datos de desaparecidos/aparecidos (riesgo PII; solo enlazamos).
- Scrapeo de redes sociales no verificadas como fuente.
- Cuentas de usuario, login, notificaciones push.
- Cobertura multi-continente exhaustiva (la plantilla reusable es capa futura, no v1).
- Etiquetado editorial "confirmado vs en desarrollo".
- App nativa.

---

## 9. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Resumen IA distorsiona fuente verdadera | Extractivo + atado + enlace + hora visibles. |
| Descubrimiento (nadie teclea "carrao") | SEO + meta tags + difusión WhatsApp; nombre = marca, no canal de hallazgo. |
| Pipeline falla y el contador miente | Timestamp = último ciclo exitoso; estado "reintentando…". |
| Tono "lamento" leído como duelo | Voz de marca empuja siempre al anuncio accionable. |
| Costo IA crece con volumen | Dedup: solo procesar items nuevos por ciclo. |
| Fuente venezolana pierde credibilidad | Allowlist curada por Carlos, revisable. |

---

## 10. Decisiones cerradas

- Audiencia primaria: quien está dentro de Venezuela.
- IA organizada por el miedo (4 capas).
- Veracidad por allowlist + resumen extractivo atado.
- Pipeline automático escalonado, cron de Vercel Pro.
- Contador público basado en último éxito.
- Nombre **Carrao**, dominio **carraocanta.com**.
- Identidad: puente de información verificada, no medio.
- Fuentes v1 confirmadas (incluida capa venezolana: Efecto Cocuyo, El Pitazo, Runrun.es; El Universal descartado; Funvisis con USGS/EMSC como respaldo primario).
- Intervalos confirmados: sísmico ~2 min, noticias ~15 min.
- Licencia: PolyForm Noncommercial 1.0.0.
- Repositorio público: github.com/narvaezcarloscom/carrao.
