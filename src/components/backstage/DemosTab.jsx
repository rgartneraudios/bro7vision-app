import React, { useState } from 'react';

const DemoViewer = ({ titulo, subtitulo, videoUrl, vertical = false }) => (
  <div className="flex flex-col gap-2 items-center text-center">
    <div className="text-2xl text-gray-400 uppercase tracking-widest font-bold"
      style={{ fontFamily: "'Exo 2', sans-serif" }}>
      {titulo}
    </div>
    <p style={{ fontFamily: "'Inter', sans-serif" }}
      className="text-xl text-gray-600 mb-1">{subtitulo}</p>
    <div
      className="rounded overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.1)] bg-black mx-auto"
      style={{
        aspectRatio: vertical ? '9/16' : '16/9',
        width: vertical ? '420px' : '720px',
      }}
    >
      <video
        src={videoUrl}
        controls
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  </div>
);

const HEADING      = "'Noto Sans', sans-serif";
const INTER        = "'Inter', sans-serif";
const SPACE_GROTESK = "'Space Grotesk', sans-serif";

const ESPACIOS_TABS = [
  { id: 'menciones',  label: 'MENCIONES BRO7BAND'       },
  { id: 'fondos',     label: 'FONDOS REALITY TRIVIA'     },
  { id: 'games',      label: 'GAMES'                     },
  { id: 'slide_rail', label: 'SLIDE RAIL / PROMO TRIVIA' },
  { id: 'tarjetas',   label: 'TARJETAS DE REGALO'        },
];

const ComoFuncionaTabs = () => {
  const [active, setActive] = useState('menciones');
  return (
    <div className="flex flex-col gap-0">
      <div className="flex gap-0 border-b border-white/10 flex-wrap justify-center">
        {ESPACIOS_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{ fontFamily: HEADING }}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
              active === t.id
                ? 'text-white border-b-2 border-cyan-400'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center h-48 text-gray-700"
        style={{ fontFamily: INTER }}>
        Contenido próximamente
      </div>
    </div>
  );
};

const MANIFIESTO = [
  {
    titulo: 'Sin molestia, sin rechazo',
    color: 'text-orange-200',
    cuerpo: [
      [{ t: 'La publicidad invasiva molesta al usuario' }],
      [{ t: 'y en consecuencia ' }, { t: 'daña a la marca.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500' }],
      [{ t: 'Un anuncio que interrumpe una tarea' }],
      [{ t: 'genera una ' }, { t: 'asociación negativa', c: 'text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500' }, { t: ' automática e inconsciente.' }],
      [{ t: 'Brovision', c: 'text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500' }, { t: ' diseña cada espacio publicitario' }],
      [{ t: 'para que aparezca de forma natural,' }],
      [{ t: 'sin bloquear, sin interrumpir.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500' }],
      [{ t: 'El espectador nunca siente que le están vendiendo algo.' }],
      [{ t: 'Y eso ' }, { t: 'cambia todo.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500' }],
    ],
  },
  {
    titulo: 'La publicidad que acompaña',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600',
    cuerpo: [
      [{ t: 'En Brovision', c: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500' }, { t: ' el anunciante acompaña al usuario' }],
      [{ t: 'mientras gana puntos.' }],
      [{ t: 'El cerebro registra la marca' }],
      [{ t: 'como parte de una ' }, { t: 'experiencia positiva.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500' }],
      [{ t: 'La simpatía hacia la marca no se construye con insistencia.' }],
      [{ t: 'Se construye con ' }, { t: 'presencia en el momento correcto.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500' }],
    ],
  },
  {
    titulo: 'Sin engaños',
    color: 'text-lime-200',
    cuerpo: [
      [{ t: 'Existen formatos publicitarios' }],
      [{ t: 'que ' }, { t: 'simulan ser contenido editorial.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-lime-500' }],
      [{ t: 'Podcasts donde el invitado llegó ' }, { t: '"por mérito"', c: 'text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-lime-500' }],
      [{ t: 'o entrevistas donde la ' }, { t: 'objetividad tiene precio.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-lime-500' }],
      [{ t: 'El espectador lo intuye aunque no lo sepa.' }],
      [{ t: 'Nuestra publicidad es ' }, { t: 'visible y transparente.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-lime-500' }],
      [{ t: 'El usuario sabe que existe y la acepta' }],
      [{ t: 'porque le aporta ' }, { t: 'algo a cambio.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-lime-500' }],
    ],
  },
  {
    titulo: 'Dos formatos, una dirección',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600',
    cuerpo: [
      [{ t: 'Nuestros espacios son de dos tipos:' }],
      [{ t: 'Publicidad muda', c: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500' }],
      [{ t: '(Fondos Reality Trivia, Slide Rail, Games, Tarjetas de Regalo)', c: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500' }],
      [{ t: 'presencia visual limpia', c: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500' }],
      [{ t: 'mientras el usuario juega o explora;' }],
      [{ t: 'Menciones Bro7Band', c: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500' }, { t: ' :' }],
      [{ t: 'integración no intrusiva dentro del universo de los personajes.' }],
      [{ t: 'Formatos distintos, mismo principio:' }],
      [{ t: 'transparencia, contexto positivo', c: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500' }],
      [{ t: 'y ' }, { t: 'potencial real de conversión.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500' }],
    ],
  },
  {
    titulo: ['El diagnóstico', 'que ningún medio te da'],
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-fuchsia-600',
    cuerpo: [
      [{ t: 'Cuando una campaña convencional no funciona,' }],
      [{ t: 'es imposible saber por qué.' }],
      [{ t: '¿Fue el ' }, { t: 'formato invasivo', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }, { t: '? ¿El ' }, { t: 'algoritmo', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }, { t: '? ¿El ' }, { t: 'momento', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }, { t: '?' }],
      [{ t: 'En Brovision', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }, { t: ' eliminamos todas esas ' }, { t: 'capas de ruido.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }],
      [{ t: 'Si la campaña está bien ejecutada y el resultado no llega,' }],
      [{ t: 'tienes por primera vez una ' }, { t: 'señal limpia', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }, { t: ':' }],
      [{ t: 'el mensaje, el producto o el servicio ' }, { t: 'necesita revisión.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }],
      [{ t: 'Ningún medio puede ofrecerte eso porque' }],
      [{ t: 'ninguno trabaja con ' }, { t: 'variables tan controladas.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }],
    ],
  },
];

const FILAS_TABLA = [
  ['¿El usuario sabe que es publicidad?', 'No siempre', 'Siempre'],
  ['¿Interrumpe la experiencia?', 'Sí', 'No'],
  ['¿El usuario lo acepta?', 'Lo tolera', 'Lo busca'],
  ['¿Genera simpatía hacia la marca?', 'Neutral / rechazo', 'Positiva'],
  ['¿Depende de algoritmos externos?', 'Sí', 'No'],
  ['¿Permite detectar fallos reales?', 'No', 'Sí'],
  ['¿Es honesta con el espectador?', 'No siempre', 'Siempre'],
];

const EstudioMarketingTab = () => {
  const [subTab, setSubTab] = useState('blog');

  return (
    <div className="w-full px-8 md:px-20 py-12 flex flex-col items-center">

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;900&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;700&display=swap');`}</style>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-16 w-full justify-center">
        {[
          { id: 'blog',    label: 'CÓMO FUNCIONA'          },
          { id: 'estudio', label: 'FORMATOS PUBLICITARIOS' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            style={{ fontFamily: HEADING }}
            className={`px-8 py-4 text-sm md:text-base font-black uppercase tracking-widest transition-all ${
              subTab === t.id
                ? 'text-white border-b-2 border-cyan-400'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ───── TAB: FORMATOS PUBLICITARIOS ───── */}
      {subTab === 'estudio' && (
        <div className="flex flex-col gap-10 px-2 py-4 items-center w-full max-w-5xl">
          <DemoViewer
            titulo="Demo Horizontal — PC / Tablet"
            subtitulo="Publicidad muda integrada en escenario 16:9. Banner y texto aparecen y desaparecen sobre el fondo. Puedes utilizar un video vertical o una imagen que debes proporcionar en el panel de reserva junto a instrucciones específicas que necesites comunicar. Al ser los videos cortos y en bucle, la aparición de tu anuncio rondará los 8 segundos promedio. Procura incluir textos con datos de contacto claros."
            videoUrl="https://media.bro7vision.com/HorizontalDemo.mp4"
            vertical={false}
          />
          <DemoViewer
            titulo="Demo Vertical — Móvil"
            subtitulo="Publicidad muda integrada en escenario 9:16. Formato afiche con llamada a la acción. Puedes utilizar un video o una imagen en formato cuadrado 1:1 que debes proporcionar en el panel de reserva junto a instrucciones específicas que necesites comunicar. Al ser los videos cortos y en bucle, la aparición de tu anuncio rondará los 8 segundos promedio. Procura incluir textos con datos de contacto claros."
            videoUrl="https://media.bro7vision.com/VerticalDemo.mp4"
            vertical={true}
          />
        </div>
      )}

      {/* ───── TAB: CÓMO FUNCIONA (LANDING) ───── */}
      {subTab === 'blog' && (
        <div className="w-full flex flex-col items-center gap-24">

          {/* ═══════════ HERO ═══════════ */}
          <div className="flex flex-col items-center text-center gap-6 w-full">
            <span
              style={{ fontFamily: HEADING }}
              className="text-4xl tracking-[0.3em] text-cyan-400 border border-cyan-500/30 rounded-full px-10 py-4 uppercase bg-cyan-950/20 font-black"
            >
              Por qué Bro7Vision
            </span>
            <div className="h-6" />
            <h1
              style={{ fontFamily: HEADING, fontWeight: 900 }}
              className="text-4xl md:text-5xl lg:text-6xl leading-tight text-center"
            >
              <span className="text-white block">La publicidad que el espectador agradece</span>
              <span className="block mt-2 text-amber-400">existe!</span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">Y convierte más.</span>
            </h1>
            <div style={{ fontFamily: INTER }} className="text-xl md:text-2xl text-gray-300 leading-relaxed md:leading-loose text-center max-w-3xl mx-auto mt-8 font-medium">
              <p className="mb-1">Bro7Vision es una plataforma de entretenimiento interactivo.</p>
              <p className="mb-1">Los visitantes entran a explorar, descubrir y ganar{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold" style={{ textShadow: '0 0 20px rgba(0,255,200,0.5), 0 0 60px rgba(168,85,247,0.3)' }}>Lunas</span>
              </p>
              <p className="mb-1">— sus puntos canjeables por tarjetas de regalo reales.</p>
              <p className="mb-1">En el sector{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold" style={{ textShadow: '0 0 20px rgba(168,85,247,0.5), 0 0 60px rgba(236,72,153,0.3)' }}>Bro7Band</span>
                {' '}conviven</p>
              <p className="mb-1">los Personajes del universo Brovision con Inteligencia Artificial:</p>
              <p className="mb-1">los usuarios los siguen, escuchan sus historias</p>
              <p className="mb-1">y ganan{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold" style={{ textShadow: '0 0 20px rgba(0,255,200,0.5), 0 0 60px rgba(168,85,247,0.3)' }}>Lunas</span>
                {' '}interactuando con ellos.</p>
              <p className="mt-4 text-white font-bold" style={{ textShadow: '0 0 15px rgba(255,255,255,0.3)' }}>
                Tu marca vive dentro de esa experiencia.<br />No encima de ella.
              </p>
            </div>
            <div className="h-6" />
            <div style={{ fontFamily: INTER }} className="text-2xl md:text-3xl leading-relaxed text-center font-bold text-gray-300">
              <p className="mb-3">
                <span className="text-amber-200">Bro7Vision</span> te ofrece
              </p>
              <p className="mb-3">
                una <span className="text-amber-200">Publicidad</span>{' '}
                <span className="text-amber-200">transparente, efectiva</span>
              </p>
              <p className="mb-3">
                y que el <span className="text-amber-200">espectador agradece</span>.
              </p>
              <p className="mb-3">
                <span className="text-amber-200">No irrumpe</span> en su tarea.{' '}
                <span className="text-amber-200">Sin engaños</span>.
              </p>
              <p className="mb-3">
                <span className="text-amber-200">Sin algoritmos</span> que decidan por el{' '}
                <span className="text-amber-200">anunciante</span>.
              </p>
            </div>
          </div>

          {/* ═══════════ MANIFIESTO — BLOQUES CENTRADOS ═══════════ */}
          <div className="w-full flex flex-col items-center gap-14">
            {MANIFIESTO.map((bloque, i) => (
              <div key={i} className="w-full max-w-6xl flex flex-col items-center gap-5">
                <h2
                  style={{ fontFamily: HEADING, fontWeight: 700 }}
                  className={`text-2xl md:text-3xl lg:text-4xl uppercase tracking-widest text-center ${bloque.color}`}
                >
                  {Array.isArray(bloque.titulo) ? (
                    bloque.titulo.map((linea, ti) => (
                      <span key={ti} className="block">{linea}</span>
                    ))
                  ) : (
                    bloque.titulo
                  )}
                </h2>
                <div
                  style={{ fontFamily: INTER }}
                  className="text-xl md:text-2xl text-gray-300 leading-relaxed md:leading-loose text-center font-medium"
                >
                  {bloque.cuerpo.map((linea, j) => (
                    <p key={j} className="mb-1">
                      {linea.map((seg, k) =>
                        seg.c ? (
                          <span key={k} className={seg.c}>{seg.t}</span>
                        ) : (
                          <span key={k}>{seg.t}</span>
                        )
                      )}
                    </p>
                  ))}
                </div>
                {i < MANIFIESTO.length - 1 && (
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mt-4" />
                )}
              </div>
            ))}
          </div>

          {/* ═══════════ TABLA COMPARATIVA ═══════════ */}
          <div className="w-full max-w-6xl">
            <h4
              style={{ fontFamily: HEADING, fontWeight: 700 }}
              className="text-sm text-gray-500 uppercase tracking-widest mb-6 text-center"
            >
              Comparativa
            </h4>
            <div className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl bg-white/5">
              <table className="w-full text-sm md:text-base" style={{ fontFamily: INTER }}>
                <thead>
                  <tr className="border-b border-white/10 bg-white/10">
                    <th className="text-left px-6 py-4 text-gray-500 font-semibold"></th>
                    <th className="text-center px-6 py-4 text-gray-400 font-semibold">Publicidad convencional</th>
                    <th className="text-center px-6 py-4 text-cyan-400 font-semibold">Brovision</th>
                  </tr>
                </thead>
                <tbody>
                  {FILAS_TABLA.map(([concepto, conv, brov], i) => (
                    <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-black/20' : ''}`}>
                      <td className="px-6 py-4 text-gray-300">{concepto}</td>
                      <td className="px-6 py-4 text-center text-red-400">{conv}</td>
                      <td className="px-6 py-4 text-center text-emerald-400 font-semibold">{brov}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══════════ CTA ═══════════ */}
          <div className="w-full max-w-4xl text-center flex flex-col items-center gap-6 pb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <h3
              style={{ fontFamily: HEADING, fontWeight: 900 }}
              className="text-3xl md:text-5xl text-white leading-tight"
            >
              Tu marca merece un espacio honesto
            </h3>
            <p
              style={{ fontFamily: INTER }}
              className="text-base md:text-lg text-gray-400 max-w-2xl leading-relaxed"
            >
             Contrata tu espacio en la próxima fase lunar y descubre lo que ocurre cuando la publicidad deja de molestar y empieza a conectar de verdad.
            </p>
            <button
              style={{ fontFamily: HEADING }}
              className="mt-2 px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 transition-all shadow-[0_0_30px_rgba(0,255,200,0.3)] hover:shadow-[0_0_50px_rgba(0,255,200,0.5)]"
            >
              Reservar butaca
            </button>
          </div>

          {/* ═══════════ SUB-PESTAÑAS DE ESPACIOS ═══════════ */}
          <div className="w-full max-w-6xl">
            <h4
              style={{ fontFamily: HEADING, fontWeight: 700 }}
              className="text-sm text-gray-500 uppercase tracking-widest mb-6 text-center"
            >
              Nuestros espacios publicitarios
            </h4>
            <ComoFuncionaTabs />
          </div>

        </div>
      )}

    </div>
  );
};

export default EstudioMarketingTab;