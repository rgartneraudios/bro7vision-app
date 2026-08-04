// src/components/personajes/NovaBanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from '../AgentChatInput';
import { useAgentNova } from '../../hooks/useAgentNova';

const NOVA_GREETINGS = [
  "¡Oh, hola! Soy Nova, qué alegría saludarte. Dime qué buscas y me pongo en marcha enseguida, porfi,",
  "Nova al habla, ¡qué ilusión! ¿En qué podría ayudarte el día de hoy,",
  "¡Buenas! Soy Nova. Cuéntame qué necesitas y te ayudaré a encontrarlo con mucha dedicación,",
  "Hola, soy Nova 📸 ¿Qué descuento especial estás buscando hoy,",
];

export default function NovaBanner({
  sessionCity, sessionCP, realItems = [],
  onEntityFocus, onOpenTerminal, onSetActiveIndex,
  onInvokeOsos, onInvokeMapache, setIntent,
  onHandoff,
  iaMode        = 'off',
  isAdmin       = false,
  entidad       = null,
}) {
  const [display, setDisplay]           = useState('');
  const [cursor, setCursor]             = useState(true);
  const [currentMsg, setCurrentMsg]     = useState('');
  const charIdx = useRef(0);

  const { mensaje: novaMensaje, loading: novaLoading, enviar: novaEnviar,
          esPatrocinado } = useAgentNova({
    iaMode, isAdmin, onHandoff, ciudad: sessionCity,
  });

  // ── Cursor parpadeante ─────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  // ── Saludo inicial ─────────────────────────────────────────────────
  useEffect(() => {
    setCurrentMsg(NOVA_GREETINGS[Math.floor(Math.random() * NOVA_GREETINGS.length)]);
  }, []);

  // ── Mensajes del hook ──────────────────────────────────────────────
  useEffect(() => {
    if (novaMensaje) setCurrentMsg(novaMensaje);
  }, [novaMensaje]);

  // ── Typewriter ────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentMsg) return;
    charIdx.current = 0;
    setDisplay('');
    const t = setInterval(() => {
      charIdx.current++;
      setDisplay(currentMsg.slice(0, charIdx.current));
      if (charIdx.current >= currentMsg.length) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [currentMsg]);

  // ── Enviar desde input ─────────────────────────────────────────────
  const handleEnviar = (texto) => {
    novaEnviar(texto, { entidad });
  };

  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">

      {/* BANNER */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div
          className="nv-wrap w-full flex flex-col items-center justify-center text-center bg-black/75 backdrop-blur-xl border border-amber-400/30 rounded-3xl p-5 shadow-[0_0_24px_rgba(251,191,36,0.2)]"
          style={{ transition: 'all 0.3s ease' }}
        >
          {/* Sin mensaje */}
          {!currentMsg && (
            <div className="flex items-center gap-2">
              <p className="text-amber-700/60 text-xs font-bold uppercase tracking-widest">
                ◈ NOVA · EN LÍNEA
              </p>
              {esPatrocinado && (
                <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#000', background: '#FACC15', borderRadius: 3, padding: '1px 5px', textTransform: 'uppercase' }}>
                  PATROCINADO
                </span>
              )}
            </div>
          )}

          {/* Procesando */}
          {novaLoading && (
            <span className="text-amber-400">Procesando...</span>
          )}

          {/* Mensaje typewriter */}
          {!novaLoading && currentMsg && (
            <p className="text-amber-400 font-black italic uppercase text-lg leading-relaxed shadow-amber-400">
              {display}<span style={{ opacity: cursor ? 1 : 0 }}>_</span>
            </p>
          )}
        </div>
      </div>

      {/* INPUT */}
      <div className="w-full max-w-2xl pointer-events-auto mb-4">
        <AgentChatInput agent="nova" onSend={handleEnviar} isLoading={novaLoading} />
      </div>
    </div>
  );
}
