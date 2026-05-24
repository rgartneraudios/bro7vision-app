// src/components/personajes/NovaBanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from '../AgentChatInput';
import BroCardStripPS from '../BroCardStripPS';
import { useAgentNovaExplora } from '../../hooks/useAgentNovaExplora';

const NOVA_GREETINGS = [
  "¡Oh, hola! Soy Nova, qué alegría saludarte. Dime qué buscas y me pongo en marcha enseguida, porfi,",
  "Nova al habla, ¡qué ilusión! ¿En qué podría ayudarte el día de hoy,",
  "¡Buenas! Soy Nova. Cuéntame qué necesitas y te ayudaré a encontrarlo con mucha dedicación,",
  "Hola, soy Nova 📸 ¿Qué cosita preciosa estás buscando hoy,",
];

export default function NovaBanner({
  sessionCity, sessionCP, realItems = [],
  stripVisible, stripCards, stripLabel,
  onEntityFocus, onOpenTerminal, onSetActiveIndex,
  onInvokeOsos, onInvokeMapache, setIntent,
  onHandoff,
  iaMode      = 'off',
  isAdmin     = false,
  entidad     = null,
  hayTarjetas = false,
}) {
  const [display, setDisplay]           = useState('');
  const [cursor, setCursor]             = useState(true);
  const [currentMsg, setCurrentMsg]     = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const charIdx = useRef(0);

  const { mensaje: novaMensaje, loading: novaLoading, enviar: novaEnviar,
          esPatrocinado } = useAgentNovaExplora({
    iaMode,
    isAdmin,
    onHandoff,
    ciudad: sessionCity,
  });

  // ── Cursor parpadeante ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  // ── Saludo inicial ───────────────────────────────────────────────────────
  useEffect(() => {
    setCurrentMsg(NOVA_GREETINGS[Math.floor(Math.random() * NOVA_GREETINGS.length)]);
  }, []);

  // ── Mensajes del hook ────────────────────────────────────────────────────
  useEffect(() => {
    if (novaMensaje) {
      setCurrentMsg(novaMensaje);
      setSelectedCard(null);
    }
  }, [novaMensaje]);

  // ── Efecto typewriter ────────────────────────────────────────────────────
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

  // ── Clic en BroCard ──────────────────────────────────────────────────────
  const handleCardClick = (card) => {
    setSelectedCard(prev =>
      prev?.bro_pd === card.bro_pd ? null : card
    );
  };

  // ── Enviar desde input ───────────────────────────────────────────────────
  const handleEnviar = (texto) => {
    setSelectedCard(null);
    novaEnviar(texto, { entidad, hayTarjetas });
  };

  // ── Botón ENTRAR → HandOff NOVA_CIERRE ──────────────────────────────────
  const handleEntrar = () => {
    if (!selectedCard || !onHandoff) return;
    onHandoff({
      agente:   'NOVA_CIERRE',
      comercio: selectedCard.bro_pd,
    });
    setSelectedCard(null);
  };

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">

      {/* 1. CARRUSEL */}
      {stripVisible && (
        <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
          <BroCardStripPS
            cards={stripCards}
            onSelectCard={handleCardClick}
            accentColor="gold"
            visible={stripVisible}
          />
        </div>
      )}

      {/* 2. BANNER */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div
          className="nv-wrap w-full flex flex-col items-center justify-center text-center bg-black/75 backdrop-blur-xl border border-amber-400/30 rounded-3xl p-5 shadow-[0_0_24px_rgba(251,191,36,0.2)]"
          style={{ transition: 'all 0.3s ease' }}
        >
          {/* Sin mensaje ni card */}
          {!currentMsg && !selectedCard && (
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
          {novaLoading && !selectedCard && (
            <span className="text-amber-400">Procesando...</span>
          )}

          {/* Card seleccionada */}
          {selectedCard && !novaLoading && (
            <div className="w-full flex flex-col items-center gap-3 animate-fadeIn">
              <p
                className="text-amber-300 font-black italic uppercase text-base leading-tight tracking-widest"
                style={{ textShadow: '0 0 16px rgba(251,191,36,0.7)' }}
              >
                {selectedCard.nombre}
              </p>

              {(selectedCard.neighborhood || selectedCard.nearby_ref) && (
                <p className="text-amber-500/80 font-bold uppercase text-xs tracking-[0.25em]"
                   style={{ textShadow: '0 0 8px rgba(251,191,36,0.4)' }}>
                  {selectedCard.neighborhood}{selectedCard.neighborhood && selectedCard.nearby_ref ? ' · ' : ''}{selectedCard.nearby_ref}
                </p>
              )}

              <p
                className="text-amber-400 font-black italic uppercase text-lg leading-relaxed"
                style={{ textShadow: '0 0 20px rgba(251,191,36,0.6)' }}
              >
                {selectedCard.descripcion}
                <span style={{ opacity: cursor ? 1 : 0 }}>_</span>
              </p>

              <button
                onClick={handleEntrar}
                className="mt-1 px-8 py-2.5 bg-amber-500/20 border border-amber-400/70 rounded-2xl text-amber-300 font-black text-sm uppercase tracking-widest hover:bg-amber-400/40 hover:text-white transition-all"
                style={{ boxShadow: '0 0 16px rgba(251,191,36,0.3)' }}
              >
                ➤ ENTRAR
              </button>
            </div>
          )}

          {/* Mensaje del hook (typewriter) */}
          {!selectedCard && !novaLoading && currentMsg && (
            <p className="text-amber-400 font-black italic uppercase text-lg leading-relaxed shadow-amber-400">
              {display}<span style={{ opacity: cursor ? 1 : 0 }}>_</span>
            </p>
          )}
        </div>
      </div>

      {/* 3. INPUT */}
      <div className="w-full max-w-2xl pointer-events-auto mb-4">
        <AgentChatInput agent="nova" onSend={handleEnviar} isLoading={novaLoading} />
      </div>
    </div>
  );
}
