// src/components/IsabellaBanner.jsx
// Agente: SERVICIOS EXPLORA — Color azul-gris #64748B
// Personajes: Isabella (elefanta psicóloga) | Prof Robles Maestro (elefante filósofo)
// Consume: useAgentChat (mode='servicios') → botOrchestrator

import React, { useState, useEffect, useRef } from 'react';
import { useAgentChat } from '../hooks/useAgentChat';
import AgentChatInput from './AgentChatInput'; // <-- Importamos el Input
import BroCardStrip from './BroCardStrip';     // <-- Importamos el Carrusel

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

export default function IsabellaBanner({
  // Props de estado y datos
  personaje = 'isabella',
  sessionCity, 
  sessionCP, 
  realItems = [], 
  stripVisible, 
  stripCards, 
  stripLabel,
  
  // Callbacks de navegación
  onEntityFocus, 
  onOpenTerminal, 
  onSetActiveIndex, 
  onInvokeOsos, 
  onInvokeMapache,
  setIntent
}) {
  const [display, setDisplay] = useState('');
  const [cursor, setCursor] = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const charIdx = useRef(0);

  const isMaestro = personaje === 'prmaestro';
  const nombreAgente = isMaestro ? 'PROF. ROBLES' : 'ISABELLA';
  const GREETINGS = isMaestro ? GREETINGS_MAESTRO : GREETINGS_ISABELLA;

  // ── Hook del Bot ────────────────────────────────────────────────────────
  const { mensaje, loading, enviar } = useAgentChat({
    mode: 'servicios',
    contextData: { alias: 'viajero', ciudad: sessionCity || '', cp: sessionCP || '', personaje },
    realItems,
    onEntityFocus,
    onHandoff: ({ agente, bro_id }) => {
      if (agente === 'ISABELLA_CIERRE' && bro_id) {
        const comercio = realItems.find(i => i.bro_ser === bro_id || i.bro_id === bro_id || i.id === bro_id);
        if (comercio) onOpenTerminal?.(comercio, 'isabellaVentas');
      } else if (agente === 'OSOS') {
        onInvokeOsos?.();
      } else if (agente === 'MAPACHE') {
        onInvokeMapache?.();
      } else if (agente === 'NOVA') {
        onOpenTerminal?.(null, 'novaExplora');
      }
    },
  });

  // ── Efectos Visuales (Máquina de escribir, etc) ─────────────────────────
  useEffect(() => { const t = setInterval(() => setCursor(c => !c), 530); return () => clearInterval(t); }, []);
  useEffect(() => { setCurrentMsg(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]); }, [personaje]);
  useEffect(() => { if (mensaje) setCurrentMsg(mensaje); }, [mensaje]);

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

  // ── UI Completa de Isabella / Maestro ───────────────────────────────────
  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
      <style>{`
        @keyframes neonPulseServicios {
          0%, 100% { text-shadow: 0 0 8px #94a3b8, 0 0 22px #475569, 0 0 45px #475569; }
          50%       { text-shadow: 0 0 4px #475569, 0 0 10px #475569; }
        }
        @keyframes svDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
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

      {/* 1. CARRUSEL (Si está visible) */}
      {stripVisible && (
        <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
          <BroCardStrip 
            cards={stripCards} 
            // Llamamos directo a 'enviar'
            onSelectCard={(card) => enviar(`${card.bro_id || card.bro_ser}D`)} 
            accentColor="slate" 
            label={stripLabel} 
            visible={stripVisible} 
          />
        </div>
      )}

      {/* 2. EL BANNER DE TEXTO */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div className="sv-wrap w-full flex flex-col items-center justify-center text-center">
          {!currentMsg && !loading && (
            <p className="text-slate-500/60 text-xs uppercase tracking-widest font-bold">
              ◈ {nombreAgente} · EN LÍNEA
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
      </div>

      {/* 3. INPUT DE CHAT */}
      <div className="w-full max-w-2xl pointer-events-auto mb-4">
        <AgentChatInput 
          agent="isabella" 
          onSend={enviar} 
          isLoading={loading} 
        />
      </div>

    </div>
  );
}