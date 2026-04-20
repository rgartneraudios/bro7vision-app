// src/components/NovaBanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from './AgentChatInput';
import BroCardStrip from './BroCardStrip';

const NOVA_GREETINGS = [
  "¡Hola! Soy Nova. Dime qué buscas y me pongo en marcha. 🌙",
  "Nova al habla. ¿En qué puedo ayudarte hoy?",
  "¡Buenas! Soy Nova. Cuéntame qué necesitas y te lo encuentro.",
  "Hola, soy Nova 📸 ¿Qué estás buscando hoy?",
];

export default function NovaBanner({
  // Props de estado y datos
  sessionCity, sessionCP, realItems = [],
  stripVisible, stripCards, stripLabel,

  // Callbacks de navegación
  onEntityFocus, onOpenTerminal, onSetActiveIndex,
  onInvokeOsos, onInvokeMapache, setIntent,

  // Props del hook — vienen de App.jsx
  novaMensaje, novaLoading, onNovaEnviar,
}) {
  const [display, setDisplay]     = useState('');
  const [cursor, setCursor]       = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const charIdx = useRef(0);

  // ── Efectos Visuales ────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setCurrentMsg(NOVA_GREETINGS[Math.floor(Math.random() * NOVA_GREETINGS.length)]);
  }, []);

  useEffect(() => {
    if (novaMensaje) setCurrentMsg(novaMensaje);
  }, [novaMensaje]);

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
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">

      {/* 1. CARRUSEL */}
      {stripVisible && (
        <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
          <BroCardStrip
            cards={stripCards}
            onSelectCard={(card) => onNovaEnviar(`${card.bro_id}D`)}
            accentColor="gold"
            label={stripLabel}
            visible={stripVisible}
          />
        </div>
      )}

      {/* 2. BANNER DE TEXTO */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div className="nv-wrap w-full flex flex-col items-center justify-center text-center bg-black/75 backdrop-blur-xl border border-amber-400/30 rounded-3xl p-5 shadow-[0_0_24px_rgba(251,191,36,0.2)]">
          {!currentMsg && (
            <p className="text-amber-700/60 text-xs font-bold uppercase tracking-widest">
              ◈ NOVA · EN LÍNEA
            </p>
          )}
          {novaLoading ? (
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
        <AgentChatInput agent="nova" onSend={onNovaEnviar} isLoading={novaLoading} />
      </div>

    </div>
  );
}