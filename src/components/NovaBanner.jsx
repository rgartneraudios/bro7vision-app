// src/components/NovaBanner.jsx
// Agente: NOVA EXPLORA — Color dorado #FFD700
// Consume: useAgentChat (mode='novaExplora') → groq.js → novaExploraPS.js
// El usuario nunca sabe que habla con el Port System.

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useAgentChat } from '../hooks/useAgentChat';

const NOVA_GREETINGS = [
  "¡Hola! Soy Nova. Dime qué buscas y me pongo en marcha. 🌙",
  "Nova al habla. ¿En qué puedo ayudarte hoy?",
  "¡Buenas! Soy Nova. Cuéntame qué necesitas y te lo encuentro.",
  "Hola, soy Nova 📸 ¿Qué estás buscando hoy?",
];

const NovaBanner = forwardRef(function NovaBanner({
  sessionCity,
  sessionCP,
  realItems = [],
  onEntityFocus,
  onOpenTerminal,   // Abre PaymentModal / ficha de tienda (NovaVentas)
  onSetActiveIndex, // Ilumina tarjeta en HoloPrisma
  onInvokeOsos,     // Activa footer de Osos
  onInvokeMapache,  // Navega a sector Audio
}, ref) {

  const [display,    setDisplay]    = useState('');
  const [cursor,     setCursor]     = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const charIdx = useRef(0);

  // ── Hook Port System ────────────────────────────────────────────────────
  const { mensaje, bolas, loading, enviar, reset } = useAgentChat({
    mode:        'novaExplora',
    contextData: {
      alias:   'viajero',
      ciudad:  sessionCity || '',
      cp:      sessionCP   || '',
    },
    realItems,
    onEntityFocus,
    onHandoff: ({ agente, bro_id, ciudad, intencion, per_solicitado }) => {
  if (agente === 'NOVA_VENTAS' && bro_id) {
    const comercio = realItems.find(i => i.bro_id === bro_id);
    if (comercio) onOpenTerminal?.(comercio);

  } else if (agente === 'ISABELLA_CIERRE' && bro_id) {
    // Cross-sector — sube al padre via onInvokeOsos con contexto
    onInvokeOsos?.({ agente, bro_id });

  } else if (agente === 'OSOS') {
    onInvokeOsos?.();

  } else if (agente === 'MAPACHE') {
    onInvokeMapache?.();

  } else if (agente) {
    // Cualquier otro PER externo — sube al padre
    onInvokeOsos?.({ agente, ciudad, intencion, per_solicitado });
  }
},
  });

  // ── Exponer sendMessage al padre (App.jsx lo usa con ref) ───────────────
  useImperativeHandle(ref, () => ({
    sendMessage: (text) => enviar(text),
    reset,
  }));

  // ── Cursor parpadeante ──────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  // ── Saludo inicial aleatorio ────────────────────────────────────────────
  useEffect(() => {
    const greeting = NOVA_GREETINGS[Math.floor(Math.random() * NOVA_GREETINGS.length)];
    setCurrentMsg(greeting);
  }, []);

  // ── Cuando el hook devuelve un mensaje nuevo, lo mostramos ──────────────
  useEffect(() => {
    if (mensaje) setCurrentMsg(mensaje);
  }, [mensaje]);

  // ── Máquina de escribir ─────────────────────────────────────────────────
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

  // ── UI ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes neonPulseNova {
          0%, 100% { text-shadow: 0 0 8px #fbbf24, 0 0 22px #BD9B06, 0 0 45px #BD9B06; }
          50%       { text-shadow: 0 0 4px #BD9B06, 0 0 10px #BD9B06; }
        }
        .nv-wrap {
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(251,191,36,0.30);
          border-radius: 2rem;
          padding: 18px 32px 20px 32px;
          box-shadow: 0 0 24px rgba(251,191,36,0.2), inset 0 0 12px rgba(0,0,0,0.4);
          min-height: 90px;
        }
        .nv-texto {
          color: #fbbf24;
          font-style: italic;
          font-weight: 900;
          text-transform: uppercase;
          font-size: clamp(13px, 2.2vw, 18px);
          line-height: 1.5;
          min-height: 3em;
          animation: neonPulseNova 3s ease-in-out infinite;
        }
        .nv-cursor {
          display: inline-block;
          width: 3px;
          height: 0.8em;
          margin-left: 3px;
          vertical-align: middle;
          background: #fbbf24;
          box-shadow: 0 0 8px #fbbf24;
        }
         .nv-loading {
          display: inline-flex;
          gap: 4px;
          align-items: center;
        }
        .nv-loading span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fbbf24;
          animation: nvDot 1.2s ease-in-out infinite;
        }
        .nv-loading span:nth-child(2) { animation-delay: 0.2s; }
        .nv-loading span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes nvDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>

      <div className="w-full flex flex-col items-center gap-3 px-4">

        {/* BANNER PRINCIPAL */}
        <div className="nv-wrap w-full flex flex-col items-center justify-center text-center">
          {!currentMsg && (
            <p className="text-amber-700/60 text-xs uppercase tracking-widest font-bold">
              ◈ NOVA · EN LÍNEA
            </p>
          )}

          {loading ? (
            <div className="nv-loading">
              <span /><span /><span />
            </div>
          ) : (
            currentMsg && (
              <p className="nv-texto">
                {display}
                <span className="nv-cursor" style={{ opacity: cursor ? 1 : 0 }} />
              </p>
            )
          )}
        </div>
      </div>
    </>
  );
});

export default NovaBanner;
