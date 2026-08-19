import React from 'react';

const JUEGOS = [
  {
    id:    'the7gates',
    label: 'THE 7 GATES',
    img:   '/images/the7gates.webp',
    texto: [
      { t: 'Con ' },
      { t: 'The 7 Gates', c: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold', s: '0 0 20px rgba(0,255,200,0.5), 0 0 60px rgba(168,85,247,0.3)' },
      { t: ' tu ' },
      { t: 'marca o servicio', c: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold' },
      { t: ' aparecerá resaltado haciéndole ganar puntos al usuario facilitando su respuesta. Es un ' },
      { t: 'guiño al participante', c: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold' },
      { t: ' de parte de tu marca o servicio que dejará un ' },
      { t: 'rastro positivo', c: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold' },
      { t: ' de tu producto.' },
    ],
  },
  {
    id:    'cosmicportal',
    label: 'COSMIC PORTAL',
    img:   '/images/CosmicPortal.webp',
    texto: [
      { t: 'Con ' },
      { t: 'Cosmic Portal', c: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold', s: '0 0 20px rgba(0,255,200,0.5), 0 0 60px rgba(168,85,247,0.3)' },
      { t: ' podrás colocar dentro de las preguntas del juego distinto tipo de información de tu producto o Servicio. Tu ' },
      { t: 'respuesta', c: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold' },
      { t: ' será resaltada y con esto le harás ganar puntos al participante. Es un ' },
      { t: 'guiño al participante', c: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold' },
      { t: ' de parte de tu marca o servicio que dejará un ' },
      { t: 'rastro positivo', c: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold' },
      { t: ' de tu producto.' },
    ],
  },
];

const HEADING  = "'Noto Sans', sans-serif";
const INTER = "'Inter', sans-serif";

// ── GamesTab ──────────────────────────────────────────────────────────────────
const GamesTab = ({ session, profile, onContratar }) => {
  return (
    <div className="p-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div className="mb-10">
        <h2 style={{ fontFamily: HEADING, fontWeight: 800, color: '#f5e6c8' }} className="text-3xl font-black tracking-tight">
          GAMES
        </h2>
        <div style={{ fontFamily: INTER }} className="text-xl md:text-2xl text-gray-300 leading-relaxed text-center font-medium max-w-4xl mx-auto mb-10">
        <p className="mb-1">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">2 juegos disponibles</span> · Mención activa durante <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">1 fase lunar completa</span>
        </p>
      </div>
      </div>

      {/* Dos juegos centrados y grandes */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-10 max-w-5xl w-full">
          {JUEGOS.map(juego => (
            <div key={juego.id} className="flex flex-col gap-5">

              {/* Card 16:9 */}
              <button
                onClick={() => onContratar(`games_${juego.id === 'the7gates' ? '7gates' : 'cosmic'}`)}
                className="group relative overflow-hidden rounded-xl border border-white/5 hover:border-violet-500/30 transition-all"
                style={{ aspectRatio: '16 / 9' }}
              >
                <img
                  src={juego.img}
                  alt={juego.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p style={{ fontFamily: HEADING, fontWeight: 800, color: '#f5e6c8', textShadow: '0 0 12px rgba(167,95,255,0.5)' }} className="text-2xl uppercase tracking-widest">
                    {juego.label}
                  </p>
                  <p style={{ fontFamily: INTER, color: '#f5e6c8' }} className="text-base mt-1 uppercase tracking-wider">
                    Mención · 1 fase lunar · desde 20€
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span style={{ fontFamily: HEADING, fontWeight: 700, background: 'rgba(130,60,220,0.2)', borderColor: 'rgba(167,95,255,0.4)', color: '#cc88ff' }}
                    className="text-sm uppercase tracking-widest border px-5 py-2 rounded backdrop-blur-sm">
                    CONTRATAR
                  </span>
                </div>
              </button>

              {/* Descripción debajo */}
              <div style={{ fontFamily: INTER }} className="text-lg md:text-xl text-gray-300 leading-relaxed text-center font-medium max-w-4xl mx-auto px-2">
                <p className="mb-1">
                  {juego.texto.map((seg, k) =>
                    seg.c || seg.s ? (
                      <span key={k} className={seg.c || ''} style={seg.s ? { textShadow: seg.s } : undefined}>{seg.t}</span>
                    ) : (
                      <span key={k}>{seg.t}</span>
                    )
                  )}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>

      <p style={{ fontFamily: HEADING }} className="text-base mt-10 uppercase tracking-widest text-center text-gray-600">
        FASE 0 · Simulación — No se realizará ningún cargo real
      </p>
    </div>
  );
};

export default GamesTab;
