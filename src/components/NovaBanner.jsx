// src/components/NovaBanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAgentChat } from '../hooks/useAgentChat';
import AgentChatInput from './AgentChatInput'; // <-- Lo importamos aquí
import BroCardStrip from './BroCardStrip';     // <-- Lo importamos aquí

const NOVA_GREETINGS = [
  "¡Hola! Soy Nova. Dime qué buscas y me pongo en marcha. 🌙",
  "Nova al habla. ¿En qué puedo ayudarte hoy?",
  "¡Buenas! Soy Nova. Cuéntame qué necesitas y te lo encuentro.",
  "Hola, soy Nova 📸 ¿Qué estás buscando hoy?",
];

// Ya no usamos forwardRef. NovaBanner es un componente normal y limpio.
export default function NovaBanner({
  // Props de estado y datos
  sessionCity, sessionCP, realItems = [], 
  stripVisible, stripCards, stripLabel,
  
  // Callbacks de navegación
  onEntityFocus, onOpenTerminal, onSetActiveIndex, 
  onInvokeOsos, onInvokeMapache, setIntent
}) {
  const [display, setDisplay] = useState('');
  const [cursor, setCursor] = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const charIdx = useRef(0);

  // ── Hook del Bot ────────────────────────────────────────────────────────
  const { mensaje, loading, enviar } = useAgentChat({
    mode: 'novaExplora',
    contextData: { alias: 'viajero', ciudad: sessionCity || '', cp: sessionCP || '' },
    realItems,
    onEntityFocus,
    onHandoff: ({ agente, bro_id, ciudad, intencion, per_solicitado }) => {
      if (agente === 'NOVA_VENTAS' && bro_id) {
        const comercio = realItems.find(i => i.bro_id === bro_id);
        if (comercio) onOpenTerminal?.(comercio);
      } else if (agente === 'ISABELLA_CIERRE' && bro_id) {
        onInvokeOsos?.({ agente, bro_id });
      } else if (agente === 'OSOS') {
        onInvokeOsos?.();
      } else if (agente === 'MAPACHE') {
        onInvokeMapache?.();
      } else if (agente) {
        onInvokeOsos?.({ agente, ciudad, intencion, per_solicitado });
      }
    },
  });

  // ── Efectos Visuales (Máquina de escribir, etc) ─────────────────────────
  useEffect(() => { const t = setInterval(() => setCursor(c => !c), 530); return () => clearInterval(t); }, []);
  useEffect(() => { setCurrentMsg(NOVA_GREETINGS[Math.floor(Math.random() * NOVA_GREETINGS.length)]); }, []);
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

  // ── UI Completa de Nova ─────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
      <style>{`
        /* ... (Tus estilos neonPulseNova, nv-wrap, nv-texto, etc. Déjalos igual aquí) ... */
      `}</style>

      {/* 1. CARRUSEL (Si está visible) */}
      {stripVisible && (
        <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
          <BroCardStrip 
            cards={stripCards} 
            // Mira qué fácil: llamamos directamente a 'enviar'
            onSelectCard={(card) => enviar(`${card.bro_id}D`)} 
            accentColor="gold" 
            label={stripLabel} 
            visible={stripVisible} 
          />
        </div>
      )}

      {/* 2. EL BANNER DE TEXTO */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div className="nv-wrap w-full flex flex-col items-center justify-center text-center bg-black/75 backdrop-blur-xl border border-amber-400/30 rounded-3xl p-5 shadow-[0_0_24px_rgba(251,191,36,0.2)]">
          {!currentMsg && <p className="text-amber-700/60 text-xs font-bold uppercase tracking-widest">◈ NOVA · EN LÍNEA</p>}
          {loading ? (
             <span className="text-amber-400">Procesando...</span>
          ) : (
            currentMsg && (
              <p className="text-amber-400 font-black italic uppercase text-lg leading-relaxed shadow-amber-400">
                {display}<span style={{ opacity: cursor ? 1 : 0 }}>_</span>
              </p>
            )
          )}
        </div>
      </div>

      {/* 3. INPUT DE CHAT */}
      <div className="w-full max-w-2xl pointer-events-auto mb-4">
        {/* Aquí pasamos el 'enviar' del hook directo al input */}
        <AgentChatInput agent="nova" onSend={enviar} isLoading={loading} />
      </div>

    </div>
  );
}
