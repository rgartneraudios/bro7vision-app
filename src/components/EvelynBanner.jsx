// src/components/EvelynBanner.jsx
// Agente: AVISOS EXPLORA — Color naranja #F97316
// Personajes: Evelyn (loba bancaria) | Larry (perro empresario urbano)
// Consume: useAgentChat (mode='avisos') → groq.js → evelynExploraPS.js

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useAgentChat } from '../hooks/useAgentChat';

const GREETINGS_EVELYN = [
  "Hola, soy Evelyn. ¿Qué aviso buscas o quieres publicar? 🐺",
  "Evelyn al habla. Dime qué necesitas y lo resolvemos rápido.",
  "¡Buenas! Soy Evelyn 🧡 ¿Buscas algo o tienes algo que ofrecer?",
  "Evelyn aquí. Sin rodeos — ¿qué aviso te trae por aquí?",
];

const GREETINGS_LARRY = [
  "Larry al teléfono. ¿Qué movimiento hay hoy en el tablón? ☕",
  "Buenos días. Soy Larry. He visto de todo en estas calles... ¿qué aviso buscas?",
  "Larry aquí, con el café en la mano. ¿Qué necesitas del tablón? 🐕",
  "Soy Larry. La ciudad siempre tiene algo interesante. ¿Qué aviso te trae?",
];

const EvelynBanner = forwardRef(function EvelynBanner({
  personaje    = 'evelyn',  // 'evelyn' | 'larry'
  sessionCity,
  sessionCP,
  genesis      = 0,
  alias        = 'Ciudadano',
  bro_id       = '',
  realItems    = [],
  onInvokeOsos,
  onAvisoConectar,
  onAvisoPublicar,
}, ref) {

  const [display,    setDisplay]    = useState('');
  const [cursor,     setCursor]     = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const charIdx = useRef(0);

  const esLarry      = personaje === 'larry';
  const nombreAgente = esLarry ? 'LARRY' : 'EVELYN';
  const GREETINGS    = esLarry ? GREETINGS_LARRY : GREETINGS_EVELYN;

  // ── Hook Port System ──────────────────────────────────────────────
  const { mensaje, bolas, loading, enviar, reset } = useAgentChat({
    mode: 'avisos',
    contextData: {
      alias,
      bro_id,
      ciudad:           sessionCity || '',
      cp:               sessionCP   || '',
      genesis,
      avisos_personaje: personaje,
    },
    realItems,
    onHandoff: ({ agente }) => {
      if (agente === 'OSOS') onInvokeOsos?.();
    },
    onAvisoConectar: (aviso) => {
      onAvisoConectar?.(aviso);
    },
    onAvisoPublicar: ({ titulo, contenido, tipo }) => {
      onAvisoPublicar?.({ titulo, contenido, tipo });
    },
  });

  // ── Exponer sendMessage al padre ──────────────────────────────────
  useImperativeHandle(ref, () => ({
    sendMessage: (text) => enviar(text),
    reset,
  }));

  // ── Cursor parpadeante ────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  // ── Saludo inicial aleatorio ──────────────────────────────────────
  useEffect(() => {
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setCurrentMsg(greeting);
  }, [personaje]);

  // ── Mensaje nuevo del hook ────────────────────────────────────────
  useEffect(() => {
    if (mensaje) setCurrentMsg(mensaje);
  }, [mensaje]);

  // ── Máquina de escribir ───────────────────────────────────────────
  useEffect(() => {
    if (!currentMsg) return;
    charIdx.current = 0;
    setDisplay('');
    const t = setInterval(() => {
      charIdx.current++;
      setDisplay(currentMsg.slice(0, charIdx.current));
      if (charIdx.current >= currentMsg.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, [currentMsg]);

  // ── Colores según personaje ───────────────────────────────────────
  // Evelyn → naranja cálido #F97316
  // Larry  → naranja oxidado #C2410C
  const colorPrimario   = esLarry ? '#C2410C' : '#F97316';
  const colorSecundario = esLarry ? '#9A3412' : '#EA580C';
  const colorTexto      = esLarry ? '#FED7AA' : '#FDBA74';
  const glowColor       = esLarry ? 'rgba(194,65,12,0.5)' : 'rgba(249,115,22,0.5)';

  return (
    <>
      <style>{`
        @keyframes neonPulseAvisos {
          0%, 100% { text-shadow: 0 0 8px ${colorPrimario}, 0 0 22px ${colorSecundario}, 0 0 45px ${colorSecundario}; }
          50%       { text-shadow: 0 0 4px ${colorSecundario}, 0 0 10px ${colorSecundario}; }
        }
        @keyframes avDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes floatBolaOrange {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-5px) scale(1.05); }
        }
        .av-wrap {
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(12px);
          border: 1px solid ${colorPrimario}55;
          border-radius: 2rem;
          padding: 18px 32px 20px 32px;
          box-shadow: 0 0 24px ${glowColor}, inset 0 0 12px rgba(0,0,0,0.4);
          min-height: 90px;
        }
        .av-texto {
          color: ${colorTexto};
          font-style: italic;
          font-weight: 900;
          text-transform: uppercase;
          font-size: clamp(13px, 2.2vw, 18px);
          line-height: 1.5;
          min-height: 3em;
          animation: neonPulseAvisos 3s ease-in-out infinite;
        }
        .av-cursor {
          display: inline-block;
          width: 3px;
          height: 0.8em;
          margin-left: 3px;
          vertical-align: middle;
          background: ${colorPrimario};
          box-shadow: 0 0 8px ${colorPrimario};
        }
         .av-loading {
          display: inline-flex;
          gap: 4px;
          align-items: center;
        }
        .av-loading span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${colorPrimario};
          animation: avDot 1.2s ease-in-out infinite;
        }
        .av-loading span:nth-child(2) { animation-delay: 0.2s; }
        .av-loading span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div className="w-full flex flex-col items-center gap-3 px-4">

        {/* BANNER PRINCIPAL */}
        <div className="av-wrap w-full flex flex-col items-center justify-center text-center">
          {!currentMsg && !loading && (
            <p className="text-xs uppercase tracking-widest font-bold"
               style={{ color: `${colorPrimario}99` }}>
              ◈ {nombreAgente} · AVISOS
            </p>
          )}

          {loading ? (
            <div className="av-loading">
              <span /><span /><span />
            </div>
          ) : (
            currentMsg && (
              <p className="av-texto">
                {display}
                <span className="av-cursor" style={{ opacity: cursor ? 1 : 0 }} />
              </p>
            )
          )}
        </div>
      </div>
    </>
  );
});

export default EvelynBanner;
