import LiveSeismic from "./LiveSeismic";

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

      {/* ---------- Capa 2: qué está pasando (fuentes verificadas) ---------- */}
      <section>
        <span className="layer-tag">Qué está pasando</span>
        <h2>Fuentes verificadas</h2>
        <p className="section-note">
          Solo fuentes que hacen su propio protocolo de validación. Ve directo y
          mira la hora de cada publicación.
        </p>
        <div className="links">
          <a className="link-card" href="https://earthquake.usgs.gov/earthquakes/map/?extent=0,-74&extent=14,-59" target="_blank" rel="noopener">
            <div className="lc-title"><span className="src-pill pill-sci">Científica</span>USGS — Mapa sísmico <span className="arrow">→</span></div>
            <div className="lc-meta">Servicio Geológico de EE. UU., datos oficiales en tiempo real</div>
          </a>
          <a className="link-card" href="https://www.emsc-csem.org/Earthquake_information/?filter=yes&region=VENEZUELA" target="_blank" rel="noopener">
            <div className="lc-title"><span className="src-pill pill-sci">Científica</span>EMSC — Sismos Venezuela <span className="arrow">→</span></div>
            <div className="lc-meta">Centro Sismológico Euro-Mediterráneo</div>
          </a>
          <a className="link-card" href="https://reliefweb.int/country/ven" target="_blank" rel="noopener">
            <div className="lc-title"><span className="src-pill pill-intl">Internacional</span>ReliefWeb — Venezuela <span className="arrow">→</span></div>
            <div className="lc-meta">ONU/OCHA: respuesta humanitaria y ayuda</div>
          </a>
          <a className="link-card" href="https://apnews.com/hub/venezuela" target="_blank" rel="noopener">
            <div className="lc-title"><span className="src-pill pill-intl">Internacional</span>AP — Venezuela <span className="arrow">→</span></div>
            <div className="lc-meta">Associated Press</div>
          </a>
          <a className="link-card" href="https://www.bbc.com/mundo/topics/cz74k717pw5t" target="_blank" rel="noopener">
            <div className="lc-title"><span className="src-pill pill-intl">Internacional</span>BBC Mundo — Venezuela <span className="arrow">→</span></div>
            <div className="lc-meta">En español</div>
          </a>
          <a className="link-card" href="https://efectococuyo.com/" target="_blank" rel="noopener">
            <div className="lc-title"><span className="src-pill pill-ve">Venezolana</span>Efecto Cocuyo <span className="arrow">→</span></div>
            <div className="lc-meta">Independiente, fuerte en verificación</div>
          </a>
          <a className="link-card" href="https://elpitazo.net/" target="_blank" rel="noopener">
            <div className="lc-title"><span className="src-pill pill-ve">Venezolana</span>El Pitazo <span className="arrow">→</span></div>
            <div className="lc-meta">Investigativo, red de corresponsales</div>
          </a>
          <a className="link-card" href="https://runrun.es/" target="_blank" rel="noopener">
            <div className="lc-title"><span className="src-pill pill-ve">Venezolana</span>Runrun.es <span className="arrow">→</span></div>
            <div className="lc-meta">Credibilidad alta</div>
          </a>
        </div>
        <p className="soon">
          Próximamente: resumen traducido al instante de estas fuentes, para que
          no tengas que abrir diez pestañas.
        </p>
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
