// src/components/MapacheBanner.jsx
// Sin hook interno. Recibe enviar/mensaje/loading desde App.jsx via props.

import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from './AgentChatInput';
import BroCardStrip from './BroCardStrip';

const GREETINGS_MAPACHE = [
  "Mapache en cabina. ¿Qué rollo buscamos hoy? 🎧",
  "Soy Mapache. Dale al play a lo que te rente.",
  "Aquí Mapache. Ajustando la movida... ¿Qué quieres escuchar, bro?",
  "Mapache al habla 🎧 ¿Música, podcast o quieres ver qué movida hay?",
];

const GREETINGS_AMI = [
  "Ami al micrófono. ¿Qué vibes descubrimos hoy? 🎙️",
  "Soy Ami. Literal, el dial es todo tuyo.",
  "Ami súper lista. Dime qué buscas en el dial.",
];

export default function MapacheBanner({
  personaje = 'mapache',
  audio_personaje,
  realItems = [],
  stripVisible,
  stripCards,
  stripLabel,
  findChannelByAlias,
  checkIfNew,
  // ── Props del hook desde App.jsx ──────────────────
  enviar,
  mensaje,
  loading,
  // ── Callbacks ─────────────────────────────────────
  onHandoff,          // ← necesario para AUDIO_PLAY
  onInvokeOsos,
  onInvokeNova,
  onOpenProfile,
  onTuneIn,
  onTuneTuner,
  onStopTuner,
  onPersonajeChange,
}) {
  const [display, setDisplay]       = useState('');
  const [cursor, setCursor]         = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const [selectedCard, setSelectedCard] = useState(null); // ← card seleccionada
  const charIdx = useRef(0);

  const personajeActivo = (audio_personaje || personaje || 'mapache').toLowerCase();
  const esAmi           = personajeActivo === 'ami';
  const nombreAgente    = esAmi ? 'AMI' : 'MAPACHE';
  const GREETINGS       = esAmi ? GREETINGS_AMI : GREETINGS_MAPACHE;
  const color           = '#00D0FF';

  const INFO = {
    mapache: { nombre: 'MAPACHE', icono: '🦝' },
    ami:     { nombre: 'AMI',     icono: '🐺' },
  };
  const { nombre: nombrePersonaje, icono: iconoPersonaje } = INFO[personajeActivo] || INFO.mapache;

  useEffect(() => { const t = setInterval(() => setCursor(c => !c), 530); return () => clearInterval(t); }, []);
  useEffect(() => { setCurrentMsg(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]); }, [personaje]);

  // ── Mensajes del bot → limpia card seleccionada ──────────────────────────
  useEffect(() => {
    if (mensaje) {
      setCurrentMsg(mensaje);
      setSelectedCard(null);
    }
  }, [mensaje]);

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
    prev?.bro_id === card.bro_aud ? null : card
  );
};
  // ── Enviar desde input → limpia card ────────────────────────────────────
  const handleEnviar = (texto) => {
    setSelectedCard(null);
    enviar(texto);
  };

  // ── Botón ENTRAR → AUDIO_PLAY ────────────────────────────────────────────
  const handleEntrar = () => {
    if (!selectedCard || !onHandoff) return;
    onHandoff({
      agente: 'AUDIO_PLAY',
      codigo: selectedCard.bro_aud || selectedCard.bro_pod || selectedCard.bro_id,
    });
    setSelectedCard(null);
  };

  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
      <style>{`
        @keyframes neonPulseMapache {
          0%, 100% { text-shadow: 0 0 8px ${color}, 0 0 22px #0088aa, 0 0 45px #0088aa; }
          50%       { text-shadow: 0 0 4px #0088aa, 0 0 10px #0088aa; }
        }
        @keyframes mpDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
        .mp-wrap {
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,208,255,0.30);
          border-radius: 2rem;
          padding: 18px 32px 20px 32px;
          box-shadow: 0 0 24px rgba(0,208,255,0.2), inset 0 0 12px rgba(0,0,0,0.4);
          min-height: 90px;
        }
        .mp-texto {
          color: ${color};
          font-style: italic; font-weight: 900; text-transform: uppercase;
          font-size: clamp(13px, 2.2vw, 18px); line-height: 1.5; min-height: 3em;
          animation: neonPulseMapache 3s ease-in-out infinite;
        }
        .mp-cursor {
          display: inline-block; width: 3px; height: 0.8em; margin-left: 3px;
          vertical-align: middle; background: ${color}; box-shadow: 0 0 8px ${color};
        }
        .mp-loading { display: inline-flex; gap: 4px; align-items: center; }
        .mp-loading span {
          width: 6px; height: 6px; border-radius: 50%; background: ${color};
          animation: mpDot 1.2s ease-in-out infinite;
        }
        .mp-loading span:nth-child(2) { animation-delay: 0.2s; }
        .mp-loading span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* 1. CARRUSEL */}
      {stripVisible && (
        <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
          <BroCardStrip
            cards={stripCards}
            onSelectCard={handleCardClick}
            accentColor="cyan"
            label={stripLabel}
            visible={stripVisible}
          />
        </div>
      )}

      {/* 2. BANNER — descripción de card seleccionada O mensaje del bot */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div className="mp-wrap w-full flex flex-col items-center justify-center text-center">

          {/* Header personaje — solo si no hay card seleccionada */}
          {!selectedCard && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{iconoPersonaje}</span>
              <span style={{ color, fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                {nombrePersonaje}
              </span>
            </div>
          )}

          {/* Sin mensaje ni card */}
          {!currentMsg && !selectedCard && !loading && (
            <p className="text-cyan-500/60 text-xs uppercase tracking-widest font-bold">
              ◈ {nombreAgente} · AUDIO DISPATCHER
            </p>
          )}

          {/* Procesando */}
          {loading && !selectedCard && (
            <div className="mp-loading"><span /><span /><span /></div>
          )}

          {/* Card seleccionada — descripción con estética Mapache */}
          {selectedCard && !loading && (
            <div className="w-full flex flex-col items-center gap-3">
              {/* Nombre del canal */}
              <p
                className="font-black italic uppercase text-base leading-tight tracking-widest"
                style={{ color, textShadow: `0 0 16px ${color}` }}
              >
                {selectedCard.nombre || selectedCard.alias}
              </p>

              {/* Barrio / referencia */}
              {(selectedCard.neighborhood || selectedCard.nearby_ref) && (
                <p
                  className="font-bold uppercase text-xs tracking-[0.25em]"
                  style={{ color: '#0088aa' }}
                >
                  {selectedCard.neighborhood}
                  {selectedCard.neighborhood && selectedCard.nearby_ref ? ' · ' : ''}
                  {selectedCard.nearby_ref}
                </p>
              )}

              {/* Descripción */}
              <p
                className="font-black italic uppercase text-lg leading-relaxed"
                style={{ color, textShadow: `0 0 20px rgba(0,208,255,0.6)` }}
              >
                {selectedCard.descripcion || selectedCard.audio_description || selectedCard.description}
                <span style={{ opacity: cursor ? 1 : 0 }}>_</span>
              </p>

              {/* Botón ENTRAR → play */}
              <button
                onClick={handleEntrar}
                className="mt-1 px-8 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                style={{
                  background: 'rgba(0,208,255,0.15)',
                  border: `1px solid rgba(0,208,255,0.6)`,
                  color,
                  boxShadow: `0 0 16px rgba(0,208,255,0.3)`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,208,255,0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,208,255,0.15)'}
              >
                ▶ PLAY
              </button>
            </div>
          )}

          {/* Mensaje del bot (typewriter) — solo si no hay card seleccionada */}
          {!selectedCard && !loading && currentMsg && (
            <p className="mp-texto">
              {display}<span className="mp-cursor" style={{ opacity: cursor ? 1 : 0 }} />
            </p>
          )}

        </div>
      </div>

      {/* 3. INPUT */}
      <div className="w-full max-w-2xl pointer-events-auto mb-4">
        <AgentChatInput agent="mapache" onSend={handleEnviar} isLoading={loading} />
      </div>
    </div>
  );
}
