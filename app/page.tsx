import LiveSeismic from "./LiveSeismic";
import NewsFeed from "./NewsFeed";

export default function Home() {
  return (
    <main>
      <header className="masthead">
        <div className="brand">Carrao</div>
        <p className="lede">
          <strong>No somos un medio. Somos un puente.</strong> Reunimos lo que
          fuentes confiables ya verificaron y lo ponemos a tu disposición en un
          formato ligero, para momentos en que la conexión podría estar
          saturada. Información sobre el contexto de emergencia en Venezuela.
        </p>
      </header>

      {/* ---------- Capa 1: peligro inmediato ---------- */}
      <section>
        <span className="layer-tag">Ahora mismo</span>
        <h2>¿Sigue temblando? ¿Hay tsunami?</h2>
        <p className="section-note">
          Actividad sísmica en vivo, directo del servicio oficial. Tu teléfono
          consulta la fuente cada minuto y medio.
        </p>
        <LiveSeismic />
      </section>

      {/* ---------- Capa 2: qué está pasando (feed resumido) ---------- */}
      <section>
        <span className="layer-tag">Qué está pasando</span>
        <h2>Lo que dicen las fuentes confiables</h2>
        <p className="section-note">
          Resumen traducido de fuentes que ya verificaron su información. Cada
          tarjeta enlaza a la fuente original. No producimos noticias: las
          reunimos.
        </p>
        <NewsFeed />
      </section>

      {/* ---------- Capa 3: qué hago ahora ---------- */}
      <section>
        <span className="layer-tag">Qué hago ahora</span>
        <h2>Si vuelve a temblar</h2>
        <ol className="steps">
          <li>
            <strong>Agáchate, cúbrete y agárrate.</strong> Al suelo, protege
            cabeza y cuello bajo una mesa firme, y sujétate hasta que pare.
          </li>
          <li>
            <strong>Aléjate de ventanas, vidrios y objetos que caen.</strong> Si
            estás en cama, quédate y cubre tu cabeza con una almohada.
          </li>
          <li>
            <strong>No uses ascensores.</strong> Si puedes salir a un espacio
            abierto sin riesgo, hazlo cuando pare el movimiento, no durante.
          </li>
          <li>
            <strong>Después: revisa fugas de gas.</strong> No enciendas fósforos
            ni velas. Usa zapatos cerrados por los vidrios.
          </li>
          <li>
            <strong>Ten lista una mochila.</strong> Agua, documentos, medicinas,
            linterna y teléfono cargado. Acuerda un punto de encuentro familiar.
          </li>
        </ol>
      </section>

      <section>
        <span className="layer-tag">Qué hago ahora</span>
        <h2>Si tu hogar ya no es un lugar seguro</h2>
        <p className="section-note">
          Contacta a Protección Civil y ubica el refugio oficial más cercano.
          Mantén juntos tus documentos, agua y medicinas. No regreses a una
          estructura con daños hasta que la revisen.
        </p>
        <div className="links">
          <a
            className="link-card"
            href="https://www.instagram.com/pcivil_ve/"
            target="_blank"
            rel="noopener"
          >
            <div className="lc-title">
              Protección Civil Venezuela <span className="arrow">→</span>
            </div>
            <div className="lc-meta">Avisos oficiales y coordinación de refugios</div>
          </a>
        </div>
      </section>

      {/* ---------- Capa 4: mi gente ---------- */}
      <section>
        <span className="layer-tag">Mi gente</span>
        <h2>Busco a un familiar</h2>
        <p className="section-note">
          No publicamos listas de personas. Te llevamos directo a los servicios
          oficiales de reunificación familiar, y conviene preguntar en los
          centros de salud más cercanos al área afectada.
        </p>
        <div className="links">
          <a
            className="link-card"
            href="https://familylinks.icrc.org/"
            target="_blank"
            rel="noopener"
          >
            <div className="lc-title">
              Cruz Roja — Restablecimiento del Contacto Familiar{" "}
              <span className="arrow">→</span>
            </div>
            <div className="lc-meta">
              Servicio internacional del CICR para localizar familiares
            </div>
          </a>
        </div>
      </section>

      <footer>
        <p>
          <strong>Carrao no produce noticias.</strong> Reúne, ordena y aligera
          lo que fuentes confiables ya verificaron. Cada pieza enlaza a su fuente
          original. No hospedamos datos personales.
        </p>
        <p>
          El estado sísmico se actualiza en vivo desde USGS; la marca de tiempo
          refleja la última consulta exitosa de tu dispositivo.
        </p>
        <p>
          Creado por <strong>Carlos Narvaez</strong> —{" "}
          <a href="https://narvaezcarlos.com" target="_blank" rel="noopener">
            Narvaez Digital Marketing
          </a>{" "}
          — junto con Claude Code. Uso no comercial bajo licencia{" "}
          <a
            href="https://github.com/narvaezcarloscom/carrao/blob/main/LICENSE"
            target="_blank"
            rel="noopener"
          >
            PolyForm Noncommercial 1.0.0
          </a>
          . Código abierto en{" "}
          <a
            href="https://github.com/narvaezcarloscom/carrao"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
