// src/components/personajes/IsabellaBanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from '../AgentChatInput';
import BroCardStripPS from '../BroCardStripPS';
import { useAgentIsabella } from '../../hooks/useAgentIsabella';

const GREETINGS_ISABELLA = [
  "Hola, soy Isabella 🐘 ¿Cómo puedo acompañarte hoy?",
  "Isabella al habla, cielo. Cuéntame qué necesitas y lo encontramos juntos.",
  "¡Hola! Soy Isabella 🐘 Dime qué servicio estás buscando. Todo es parte del proceso.",
  "Hola, soy Isabella. ¿Qué tipo de profesional necesitas? Aquí estoy para ayudarte.",
];

const GREETINGS_PROFESOR = [
  "Celebro tu presencia. Soy el Profesor Robles. La indagación de un buen profesional es, en esencia, la indagación de uno mismo. ¿Qué anhelas encontrar? 📚",
  "Sea bienvenido/a. Soy Robles. Paradójicamente, siempre llegamos aquí cuando más lo precisamos. ¿Qué rastreamos hoy?",
  "Qué grata sorpresa hallarte aquí. Como bien diría cualquier clásico — el primer paso es saber qué se indaga. ¿Qué requerimiento te trae?",
  "Le saludo con estima. Soy el Profesor Robles 📚 La dialéctica del tablón es, intrínsecamente, fascinante. ¿Qué te conduce hasta aquí?",
];

const INFO = {
  isabella: { nombre: 'ISABELLA',     icono: '🐘' },
  profesor:  { nombre: 'PROF. ROBLES', icono: '🐘' },
};

export default function IsabellaBanner({
  personaje   = 'isabella',
  sessionCity, sessionCP, realItems,
  stripVisible, stripCards, stripLabel,
  onEntityFocus, onOpenTerminal, onSetActiveIndex,
  onInvokeOsos, onInvokeMapache, setIntent,
  onHandoff,
  iaMode  = 'off',
  isAdmin = false,
  entidad = null,
  hayTarjetas = false,
}) {
  const { mensaje, loading, enviar, esPatrocinado } = useAgentIsabella({
    personaje,
    iaMode,
    isAdmin,
    onHandoff,
    ciudad:      sessionCity,
    entidad,
    hayTarjetas,
  });

  const [display, setDisplay]       = useState('');
  const [cursor, setCursor]         = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const charIdx = useRef(0);

  const personajeActivo = (personaje || 'isabella').toLowerCase();
  const isMaestro       = personajeActivo === 'profesor';
  const GREETINGS       = isMaestro ? GREETINGS_PROFESOR : GREETINGS_ISABELLA;
  const { nombre: nombrePersonaje, icono: iconoPersonaje } = INFO[personajeActivo] || INFO.isabella;

  useEffect(() => { const t = setInterval(() => setCursor(c => !c), 530); return () => clearInterval(t); }, []);
  useEffect(() => { setCurrentMsg(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]); }, [personaje]);
  useEffect(() => { if (mensaje) { setCurrentMsg(mensaje); setSelectedCard(null); } }, [mensaje]);

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

  // ── Clic en BroCard — toggle ─────────────────────────────────────────────
  const handleCardClick = (card) => {
    setSelectedCard(prev =>
      prev?.bro_id === card.bro_id ? null : card
    );
  };

  // ── Enviar desde input → limpia card ────────────────────────────────────
  const handleEnviar = (texto) => {
    setSelectedCard(null);
    enviar(texto);
  };

  // ── Botón ENTRAR → HandOff ISABELLA_CIERRE ──────────────────────────────
  const handleEntrar = () => {
    if (!selectedCard || !onHandoff) return;
    onHandoff({
      agente:   'ISABELLA_CIERRE',
      comercio: selectedCard.bro_id || selectedCard.bro_ser,
    });
    setSelectedCard(null);
  };

  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
      <style>{`
        @keyframes neonPulseServicios {
          0%, 100% { text-shadow: 0 0 8px #470042, 0 0 22px #44024C, 0 0 45px #781F5D; }
          50%       { text-shadow: 0 0 4px #4F0048, 0 0 10px #350040; }
        }
        @keyframes svDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
        .sv-wrap {
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(245,40,145,0.35);
          border-radius: 2rem;
          padding: 18px 32px 20px 32px;
          box-shadow: 0 0 24px rgba(100,116,139,0.2), inset 0 0 12px rgba(0,0,0,0.4);
          min-height: 90px;
        }
        .sv-texto {
          color: #F792CF;
          font-style: italic; font-weight: 900; text-transform: uppercase;
          font-size: clamp(13px, 2.2vw, 18px); line-height: 1.5; min-height: 3em;
          animation: neonPulseServicios 3s ease-in-out infinite;
        }
        .sv-cursor {
          display: inline-block; width: 3px; height: 0.8em; margin-left: 3px;
          vertical-align: middle; background: #64748b; box-shadow: 0 0 8px #64748b;
        }
        .sv-loading { display: inline-flex; gap: 4px; align-items: center; }
        .sv-loading span {
          width: 6px; height: 6px; border-radius: 50%; background: #64748b;
          animation: svDot 1.2s ease-in-out infinite;
        }
        .sv-loading span:nth-child(2) { animation-delay: 0.2s; }
        .sv-loading span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* 1. CARRUSEL */}
      {stripVisible && (
        <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
          <BroCardStripPS
            cards={stripCards}
            onSelectCard={handleCardClick}
            accentColor="slate"
            visible={stripVisible}
          />
        </div>
      )}

      {/* 2. BANNER */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div className="sv-wrap w-full flex flex-col items-center justify-center text-center">

          {/* Header personaje — siempre visible */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{iconoPersonaje}</span>
            <span style={{ color: '#F7C8BE', fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              {nombrePersonaje}
            </span>
            {esPatrocinado && (
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#000', background: '#FACC15', borderRadius: 3, padding: '1px 5px', textTransform: 'uppercase' }}>
                PATROCINADO
              </span>
            )}
          </div>

          {/* Sin mensaje ni card */}
          {!currentMsg && !loading && !selectedCard && (
            <p className="text-slate-500/60 text-xs uppercase tracking-widest font-bold">
              ◈ {nombrePersonaje} · EN LÍNEA
            </p>
          )}

          {/* Procesando */}
          {loading && !selectedCard && (
            <div className="sv-loading"><span /><span /><span /></div>
          )}

          {/* Card seleccionada — descripción con estética Isabella */}
          {selectedCard && !loading && (
            <div className="w-full flex flex-col items-center gap-3" style={{ animation: 'stripIn 0.3s ease both' }}>
              {/* Nombre */}
              <p className="sv-texto" style={{ minHeight: 'unset', fontSize: 'clamp(13px, 2vw, 16px)' }}>
                {selectedCard.nombre}
              </p>

              {(selectedCard.neighborhood || selectedCard.nearby_ref) && (
  <p className="text-amber-500/80 font-bold uppercase text-xs tracking-[0.25em]"
     style={{ textShadow: '0 0 8px rgba(251,191,36,0.4)' }}>
    {selectedCard.neighborhood}{selectedCard.neighborhood && selectedCard.nearby_ref ? ' · ' : ''}{selectedCard.nearby_ref}
  </p>
)}
              {/* Descripción — misma clase sv-texto que los mensajes */}
              <p className="sv-texto">
                {selectedCard.descripcion}
                <span className="sv-cursor" style={{ opacity: cursor ? 1 : 0 }} />
              </p>

              {/* Botón ENTRAR */}
              <button
                onClick={handleEntrar}
                style={{
                  marginTop: 4,
                  padding: '10px 32px',
                  background: 'rgba(245,40,145,0.15)',
                  border: '1px solid rgba(245,40,145,0.6)',
                  borderRadius: '1rem',
                  color: '#F792CF',
                  fontWeight: 900,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  boxShadow: '0 0 14px rgba(245,40,145,0.25)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,40,145,0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,40,145,0.15)'}
              >
                ➤ ENTRAR
              </button>
            </div>
          )}

          {/* Mensaje del bot — solo si no hay card */}
          {!selectedCard && !loading && currentMsg && (
            <p className="sv-texto">
              {display}<span className="sv-cursor" style={{ opacity: cursor ? 1 : 0 }} />
            </p>
          )}

        </div>
      </div>

      {/* 3. INPUT */}
      <div className="w-full max-w-2xl pointer-events-auto mb-4">
        <AgentChatInput agent="isabella" onSend={handleEnviar} isLoading={loading} />
      </div>
    </div>
  );
}
