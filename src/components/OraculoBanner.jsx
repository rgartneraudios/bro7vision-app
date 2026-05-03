// src/components/OraculoBanner.jsx
// Sin hook interno. Recibe enviar/mensaje/loading desde App.jsx via props.

import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from './AgentChatInput';

const GREETINGS = {
  orumama: [
    "Aquí Orumama. El fuego está encendido y la olla ya hierve. ¿Qué te trae por aquí?",
    "Pasa, pasa. Me pillaste revolviendo unos brebajes. ¿En qué puedo ayudarte?",
    "Orumama al habla. Las velas están puestas. Cuéntame qué necesitas.",
    "Ven, siéntate. Tengo un té de melisa recién hecho. ¿Qué te preocupa?",
  ],
  jaguar: [
    "...Jaguar aquí. Respira. ¿Qué quieres saber?",
    "He dejado de cazar. Ahora escucho. Habla.",
    "El cosmos tiene todo el tiempo del mundo. Yo también. ¿Qué buscas?",
    "Jaguar presente. Las estrellas no mienten. ¿Cuál es tu signo?",
  ],
  smisterio: [
    "Saludos. El Señor Misterio al habla ☎️ Las verdades del pasado nos observan. ¿Qué enigma buscas?",
    "☎️ Mensaje entrante... Soy el Señor Misterio. ¿Qué pieza del rompecabezas buscas hoy?",
    "La luz reside en lo oculto. ¿Hablamos de Egipto, la Atlántida, o algo más profundo?",
  ],
};

export default function OraculoBanner({
  personaje = 'orumama',
  oraculo_personaje,
  alias,
  // ── Props del hook desde App.jsx ──────────────────
  enviar,
  mensaje,
  loading,
  esPatrocinado = false,
  // ── Callbacks ────────────────────────────────────
  onPersonajeChange,
  onInvokeOsos,
}) {
  const [display, setDisplay]   = useState('');
  const [cursor, setCursor]     = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const charIdx = useRef(0);

  const personajeActivo = (oraculo_personaje || personaje || 'orumama').toLowerCase();
  const color = '#4CFF30';

  // ── Saludo inicial según personaje ───────────────────────────────────────
  useEffect(() => {
    const saludos = GREETINGS[personajeActivo] || GREETINGS['orumama'];
    setCurrentMsg(saludos[Math.floor(Math.random() * saludos.length)]);
  }, [personajeActivo]);

  // ── Actualizar mensaje cuando llega respuesta ────────────────────────────
  useEffect(() => { if (mensaje) setCurrentMsg(mensaje); }, [mensaje]);

  // ── Cursor parpadeante ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  // ── Efecto typewriter ────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentMsg) return;
    charIdx.current = 0;
    setDisplay('');
    const t = setInterval(() => {
      charIdx.current++;
      setDisplay(currentMsg.slice(0, charIdx.current));
      if (charIdx.current >= currentMsg.length) clearInterval(t);
    }, 26);
    return () => clearInterval(t);
  }, [currentMsg]);

  // ── Nombre e icono según personaje ──────────────────────────────────────
  const INFO = {
    orumama:   { nombre: 'ORUMAMA',        icono: '🌿' },
    jaguar:    { nombre: 'JAGUAR SIDÉREO', icono: '🐯' },
    smisterio: { nombre: 'SR. MISTERIO',   icono: '☎️' },
  };
  const { nombre: nombrePersonaje, icono: iconoPersonaje } = INFO[personajeActivo] || INFO.orumama;

  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
      <style>{`
        @keyframes neonPulseOraculo {
          0%, 100% { text-shadow: 0 0 8px ${color}, 0 0 22px ${color}, 0 0 45px ${color}88; }
          50%       { text-shadow: 0 0 4px ${color}, 0 0 10px ${color}; }
        }
        .or-wrap {
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(76,255,48,0.30);
          border-radius: 2rem;
          padding: 14px 28px 16px 28px;
          box-shadow: 0 0 24px rgba(76,255,48,0.15), inset 0 0 12px rgba(0,0,0,0.4);
          min-height: 90px;
        }
        .or-texto {
          color: #fff;
          font-style: italic; font-weight: 900; text-transform: uppercase;
          font-size: clamp(12px, 2vw, 17px); line-height: 1.5; min-height: 3em;
          animation: neonPulseOraculo 3s ease-in-out infinite;
        }
        .or-cursor {
          display: inline-block; width: 3px; height: 0.8em; margin-left: 3px;
          vertical-align: middle; background: ${color}; box-shadow: 0 0 8px ${color};
        }
        .or-loading {
          display: inline-block; animation: neonPulseOraculo 1s ease-in-out infinite;
          color: ${color}; font-size: 11px; font-weight: bold;
          letter-spacing: 0.2em; text-transform: uppercase;
        }
      `}</style>

      {/* BANNER */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div className="or-wrap w-full">

          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{iconoPersonaje}</span>
            <span style={{ color, fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              {nombrePersonaje}
            </span>
            {esPatrocinado && (
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#000', background: '#FACC15', borderRadius: 3, padding: '1px 5px', textTransform: 'uppercase' }}>
                PATROCINADO
              </span>
            )}
          </div>

          {/* Mensaje */}
          <div className="flex flex-col items-center justify-center text-center">
            {!currentMsg && (
              <p style={{ color: '#4CFF3066', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 700 }}>
                ◈ ORÁCULO · EN LÍNEA
              </p>
            )}
            {loading ? (
              <p className="or-loading">▊ consultando el cosmos...</p>
            ) : currentMsg ? (
              <p className="or-texto">
                {display}<span className="or-cursor" style={{ opacity: cursor ? 1 : 0 }} />
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* INPUT */}
      <div className="w-full max-w-2xl pointer-events-auto mb-4">
        <AgentChatInput agent="oraculo" onSend={enviar} isLoading={loading} />
      </div>
    </div>
  );
}

