import React from 'react';

const JUEGOS = [
  {
    id:    'the7gates',
    label: 'THE 7 GATES',
    img:   '/images/the7gates.webp',
    texto: 'Con The 7 Gates tu marca o servicio aparecerá resaltado haciéndole ganar puntos al usuario facilitando su respuesta. Es un guiño al participante de parte de tu marca o servicio que dejará un rastro positivo de tu producto.',
  },
  {
    id:    'cosmicportal',
    label: 'COSMIC PORTAL',
    img:   '/images/CosmicPortal.webp',
    texto: 'Con Cosmic Portal podrás colocar dentro de las preguntas del juego distinto tipo de información de tu producto o Servicio. Tu respuesta será resaltada y con esto le harás ganar puntos al participante. Es un guiño al participante de parte de tu marca o servicio que dejará un rastro positivo de tu producto.',
  },
];

const SYNE  = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

// ── GamesTab ──────────────────────────────────────────────────────────────────
const GamesTab = ({ session, profile, onContratar }) => {
  return (
    <div className="p-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div className="mb-10">
        <h2 style={{ fontFamily: SYNE, fontWeight: 800, color: '#f5e6c8' }} className="text-3xl font-black tracking-tight">
          GAMES
        </h2>
        <p style={{ fontFamily: SYNE, fontWeight: 700, color: '#f5e6c8' }} className="text-2xl mt-1">
          2 juegos disponibles · Mención activa durante 1 fase lunar completa
        </p>
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
                  <p style={{ fontFamily: SYNE, fontWeight: 800, color: '#f5e6c8', textShadow: '0 0 12px rgba(167,95,255,0.5)' }} className="text-2xl uppercase tracking-widest">
                    {juego.label}
                  </p>
                  <p style={{ fontFamily: INTER, color: '#f5e6c8' }} className="text-base mt-1 uppercase tracking-wider">
                    Mención · 1 fase lunar · desde 20€
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span style={{ fontFamily: SYNE, fontWeight: 700, background: 'rgba(130,60,220,0.2)', borderColor: 'rgba(167,95,255,0.4)', color: '#cc88ff' }}
                    className="text-sm uppercase tracking-widest border px-5 py-2 rounded backdrop-blur-sm">
                    CONTRATAR
                  </span>
                </div>
              </button>

              {/* Descripción debajo */}
              <p style={{ fontFamily: INTER, color: '#f5e6c8' }} className="text-lg leading-relaxed text-center px-2">
                {juego.texto}
              </p>

            </div>
          ))}
        </div>
      </div>

      <p style={{ fontFamily: SYNE, color: '#f5e6c8' }} className="text-base mt-10 uppercase tracking-widest text-center">
        FASE 0 · Simulación — No se realizará ningún cargo real
      </p>
    </div>
  );
};

export default GamesTab;
