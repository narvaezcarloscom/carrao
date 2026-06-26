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

      <nav className="jump" aria-label="Secciones">
        <a href="#ahora">Ahora</a>
        <a href="#noticias">Noticias</a>
        <a href="#quehacer">Qué hacer</a>
      </nav>

      {/* ---------- Capa 1: peligro inmediato ---------- */}
      <section id="ahora" className="sec-now">
        <span className="layer-tag">Ahora mismo</span>
        <h2>¿Sigue temblando? ¿Hay tsunami?</h2>
        <p className="section-note">
          Actividad sísmica en vivo, directo del servicio oficial. Tu teléfono
          consulta la fuente cada minuto y medio.
        </p>
        <LiveSeismic />
      </section>

      {/* ---------- Capa 2: qué está pasando (feed resumido) ---------- */}
      <section id="noticias" className="sec-news">
        <span className="layer-tag">Qué está pasando</span>
        <h2>Lo que dicen fuentes nacionales e internacionales</h2>
        <p className="section-note">
          Resumen traducido de fuentes que ya verificaron su información. Cada
          tarjeta enlaza a la fuente original. No producimos noticias: las
          reunimos.
        </p>
        <NewsFeed />
      </section>

      {/* ---------- Capa 3: qué hago ahora ---------- */}
      <section id="quehacer" className="sec-do">
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

      <section className="sec-do">
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
            href="https://www.instagram.com/pcivil_venezuela/"
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
      <section id="migente" className="sec-people">
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
            href="https://cruzroja.ve/"
            target="_blank"
            rel="noopener"
          >
            <div className="lc-title">
              Cruz Roja Venezolana <span className="arrow">→</span>
            </div>
            <div className="lc-meta">
              Atención, primeros auxilios y restablecimiento del contacto familiar
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
          Es un esfuerzo independiente y sin fines de lucro. No tiene afiliación
          ni postura política: solo retransmite lo que fuentes confiables ya
          publicaron.
        </p>
        <p>
          El estado sísmico se actualiza en vivo desde USGS; la marca de tiempo
          refleja la última consulta exitosa de tu dispositivo.
        </p>
        <p className="footer-fine">
          Creado por Carlos Narvaez ·{" "}
          <a href="https://narvaezcarlos.com" target="_blank" rel="noopener">
            Narvaez Digital Marketing
          </a>{" "}
          · con Claude Code · Uso no comercial (
          <a
            href="https://github.com/narvaezcarloscom/carrao/blob/main/LICENSE"
            target="_blank"
            rel="noopener"
          >
            PolyForm 1.0.0
          </a>
          ) ·{" "}
          <a
            href="https://github.com/narvaezcarloscom/carrao"
            target="_blank"
            rel="noopener"
          >
            Código abierto
          </a>
        </p>
      </footer>
    </main>
  );
}
