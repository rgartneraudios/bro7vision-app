// src/components/ServiciosBanner.jsx
// Agente: SERVICIOS EXPLORA — Color azul-gris #64748B
// Personajes: Isabella (elefanta psicóloga) | Prof Robles Maestro (elefante filósofo)
// Consume: useAgentChat (mode='servicios') → groq.js → serviciosPS.js

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useAgentChat } from '../hooks/useAgentChat';

const GREETINGS_ISABELLA = [
  "Hola, soy Isabella. ¿En qué puedo ayudarte hoy? 🐘",
  "Isabella al habla. Cuéntame qué necesitas y lo encontramos juntos.",
  "¡Buenas! Soy Isabella. Dime qué servicio estás buscando. 🌿",
  "Hola, soy Isabella 💙 ¿Qué tipo de profesional necesitas?",
];

const GREETINGS_MAESTRO = [
  "Buenas, soy el Profesor Robles. ¿Qué servicio andas buscando? 📚",
  "Prof. Robles Maestro, a su disposición. ¿En qué le ayudo?",
  "Robles Maestro aquí. Dime qué necesitas y encontramos al profesional. 🎓",
  "¡Hola! Soy el Profesor Robles. ¿Qué tipo de servicio buscas hoy?",
];

const ServiciosBanner = forwardRef(function ServiciosBanner({
  personaje = 'isabella',   // 'isabella' | 'prmaestro'
  sessionCity,
  sessionCP,
  realItems = [],
  onEntityFocus,
  onOpenTerminal,
  onSetActiveIndex,
  onInvokeOsos,
  onInvokeMapache,
}, ref) {

  const [display,    setDisplay]    = useState('');
  const [cursor,     setCursor]     = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const charIdx = useRef(0);

  const isMaestro    = personaje === 'prmaestro';
  const nombreAgente = isMaestro ? 'PROF. ROBLES' : 'ISABELLA';
  const GREETINGS    = isMaestro ? GREETINGS_MAESTRO : GREETINGS_ISABELLA;

  // ── Hook Port System ──────────────────────────────────────────────
  const { mensaje, bolas, loading, enviar, reset } = useAgentChat({
    mode:        'servicios',
    contextData: {
      alias:    'viajero',
      ciudad:   sessionCity || '',
      cp:       sessionCP   || '',
      personaje,
    },
    realItems,
    onEntityFocus,
    onHandoff: ({ agente, bro_id }) => {
      if (agente === 'SERVICIOS_VENTAS' && bro_id) {
        const comercio = realItems.find(i => i.bro_id === bro_id);
        if (comercio) onOpenTerminal?.(comercio);
      } else if (agente === 'OSOS') {
        onInvokeOsos?.();
      } else if (agente === 'MAPACHE') {
        onInvokeMapache?.();
      }
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

  return (
    <>
      <style>{`
        @keyframes neonPulseServicios {
          0%, 100% { text-shadow: 0 0 8px #94a3b8, 0 0 22px #475569, 0 0 45px #475569; }
          50%       { text-shadow: 0 0 4px #475569, 0 0 10px #475569; }
        }
        @keyframes svDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes floatBolaSlate {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-5px) scale(1.05); }
        }
        .sv-wrap {
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(100,116,139,0.35);
          border-radius: 2rem;
          padding: 18px 32px 20px 32px;
          box-shadow: 0 0 24px rgba(100,116,139,0.2), inset 0 0 12px rgba(0,0,0,0.4);
          min-height: 90px;
        }
        .sv-texto {
          color: #94a3b8;
          font-style: italic;
          font-weight: 900;
          text-transform: uppercase;
          font-size: clamp(13px, 2.2vw, 18px);
          line-height: 1.5;
          min-height: 3em;
          animation: neonPulseServicios 3s ease-in-out infinite;
        }
        .sv-cursor {
          display: inline-block;
          width: 3px;
          height: 0.8em;
          margin-left: 3px;
          vertical-align: middle;
          background: #64748b;
          box-shadow: 0 0 8px #64748b;
        }
        .sv-bola {
          background: radial-gradient(circle at 35% 35%, #94a3b8, #334155);
          border: 2px solid #64748b;
          color: #fff;
          box-shadow: 0 0 20px rgba(100,116,139,0.5), inset 0 0 10px rgba(255,255,255,0.1);
        }
        .sv-loading {
          display: inline-flex;
          gap: 4px;
          align-items: center;
        }
        .sv-loading span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #64748b;
          animation: svDot 1.2s ease-in-out infinite;
        }
        .sv-loading span:nth-child(2) { animation-delay: 0.2s; }
        .sv-loading span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div className="w-full flex flex-col items-center gap-3 px-4">

        {/* BANNER PRINCIPAL */}
        <div className="sv-wrap w-full flex flex-col items-center justify-center text-center">
          {!currentMsg && !loading && (
            <p className="text-slate-500/60 text-xs uppercase tracking-widest font-bold">
              ◈ {nombreAgente} · SERVICIOS
            </p>
          )}

          {loading ? (
            <div className="sv-loading">
              <span /><span /><span />
            </div>
          ) : (
            currentMsg && (
              <p className="sv-texto">
                {display}
                <span className="sv-cursor" style={{ opacity: cursor ? 1 : 0 }} />
              </p>
            )
          )}
        </div>

        {/* BOLAS DE RESPUESTA */}
        {!loading && bolas.length > 0 && (
          <div className="flex gap-3 flex-wrap justify-center max-w-2xl">
            {bolas.map((bola, i) => (
              <button
                key={i}
                onClick={() => enviar(bola.texto)}
                className="sv-bola px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                style={{
                  animation: `floatBolaSlate ${1.8 + i * 0.3}s ease-in-out infinite`,
                }}
              >
                {bola.texto}
              </button>
            ))}
          </div>
        )}

      </div>
    </>
  );
});

export default ServiciosBanner;
