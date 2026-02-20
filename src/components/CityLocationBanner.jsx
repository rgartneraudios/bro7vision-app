// src/components/CityLocationBanner.jsx

import React, { useState, useEffect, useRef } from 'react';

const MENSAJES = [
  { etiqueta: 'UBICACIÓN ACTUAL', texto: 'Estás en {city} — Disfruta de tu estancia.' },
  { etiqueta: 'SISTEMA',          texto: 'Estate atento a las novedades de la nueva Fase 1.' },
  { etiqueta: 'RED BRO7VISION',   texto: 'Conectado a la red desde {city}. Bienvenido.' },
  { etiqueta: 'AVISO',            texto: 'Nuevos comercios disponibles en tu zona. ¡Explóralos!' },
];

export default function CityLocationBanner({ scope }) {
  const ciudadRaw = scope?.city || 'RED GLOBAL';
  const ciudad    = (ciudadRaw === 'Detectando...' ? 'SINTONIZANDO...' : ciudadRaw).toUpperCase();

  const [display, setDisplay]   = useState('');
  const [etiqueta, setEtiqueta] = useState('');
  const [cursor, setCursor]     = useState(true);

  const state = useRef({
    msgIdx:  0,
    charIdx: 0,
    fase:    'escribiendo',
    tick:    0,
  });

  useEffect(() => {
    const cursorInterval = setInterval(() => setCursor(c => !c), 530);

    const motor = setInterval(() => {
      const s     = state.current;
      const msg   = MENSAJES[s.msgIdx];
      const texto = msg.texto.replace('{city}', ciudad);

      if (s.fase === 'escribiendo') {
        s.charIdx++;
        setEtiqueta(msg.etiqueta);
        setDisplay(texto.slice(0, s.charIdx));
        if (s.charIdx >= texto.length) { s.fase = 'esperando'; s.tick = 0; }

      } else if (s.fase === 'esperando') {
        s.tick++;
        if (s.tick >= 100) { s.fase = 'borrando'; s.tick = 0; }

      } else if (s.fase === 'borrando') {
        s.charIdx--;
        setDisplay(texto.slice(0, s.charIdx));
        if (s.charIdx <= 0) { s.fase = 'pausa'; s.tick = 0; s.charIdx = 0; }

      } else if (s.fase === 'pausa') {
        s.tick++;
        if (s.tick >= 13) {
          s.msgIdx  = (s.msgIdx + 1) % MENSAJES.length;
          s.charIdx = 0;
          s.fase    = 'escribiendo';
          s.tick    = 0;
          setDisplay('');
        }
      }
    }, 30);

    return () => { clearInterval(motor); clearInterval(cursorInterval); };
  }, [ciudad]);

  return (
    <>
      <style>{`
        @keyframes neonPulse {
          0%, 100% { text-shadow: 0 0 8px #00f0ff, 0 0 22px #00f0ff, 0 0 45px #00f0ff; }
          50%       { text-shadow: 0 0 4px #00f0ff, 0 0 10px #00f0ff; }
        }
        .clb-wrap {
          /* Cápsula con fondo oscuro semitransparente + blur suave */
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 240, 255, 0.25);
          border-radius: 999px;
          padding: 10px 32px 12px 32px;
          /* Borde neón muy sutil */
          box-shadow: 0 0 18px rgba(0, 240, 255, 0.15), inset 0 0 12px rgba(0,0,0,0.3);
        }
        .clb-label {
          display: block;
          margin-bottom: 5px;
          color: #7dd3fc;
          text-shadow: 0 0 6px #7dd3fc, 0 0 14px #38bdf8;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.25em;
          font-size: clamp(7px, 1.2vw, 10px);
          text-transform: uppercase;
        }
        .clb-texto {
          color: #fff;
          font-style: italic;
          font-weight: 900;
          text-transform: uppercase;
          font-size: clamp(15px, 2.8vw, 24px);
          line-height: 1.3;
          min-height: 1.5em;
          animation: neonPulse 3s ease-in-out infinite;
        }
        .clb-cursor {
          display: inline-block;
          width: 3px;
          height: 0.8em;
          margin-left: 3px;
          vertical-align: middle;
          background: #00f0ff;
          box-shadow: 0 0 8px #00f0ff, 0 0 16px #00f0ff;
        }
      `}</style>

      <div className="absolute bottom-[26%] md:bottom-32 w-full flex flex-col items-center z-[20000] pointer-events-none px-4">
        {/* clb-wrap es la cápsula semitransparente detrás del texto */}
        <div className="clb-wrap flex flex-col items-center justify-center text-center">
          <span className="clb-label">◈ {etiqueta}</span>
          <p className="clb-texto">
            {display}
            <span className="clb-cursor" style={{ opacity: cursor ? 1 : 0 }} />
          </p>
        </div>
      </div>
    </>
  );
}
