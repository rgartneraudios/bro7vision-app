// src/components/personajes/PuffoBanner.jsx

import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from '../AgentChatInput';
import { useAgentPuffo } from '../../hooks/useAgentPuffo';

const VIDEO_DEFAULT = 'https://media.bro7vision.com/puffoDefault.mp4';
const BORDER_COLOR  = 'rgba(100,150,255,0.40)';
const ICONO         = '🐻';
const NOMBRE        = 'PUFFO';
const slateColor    = '#94a3b8';

const FRASES_BIENVENIDA = [
  "Puffo aquí 🎙️ Dime, ¿a dónde te llevo hoy?",
  "¡Okey! Micrófono abierto — ¿qué buscas?",
  "Aquí Puffo. He escuchado de todo en esta vida. ¿A dónde vamos?",
];

const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function PuffoBanner({
  origenLlegada = 'inicial',
  onHandoff,
  iaMode  = 'off',
  isAdmin = false,
  ciudad  = null,
}) {
  const [display, setDisplay]       = useState('');
  const [cursor, setCursor]         = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const charIdx = useRef(0);

  const { mensaje, loading, enviar } = useAgentPuffo({
    iaMode,
    isAdmin,
    onHandoff,
    ciudad,
  });

  useEffect(() => { if (mensaje) setCurrentMsg(mensaje); }, [mensaje]);

  useEffect(() => {
    setCurrentMsg(elegir(FRASES_BIENVENIDA));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

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

  return (
    <div className="absolute inset-0 z-[50] pointer-events-none">
      <style>{`
        @keyframes neonPulsePuffo {
          0%, 100% { text-shadow: 0 0 8px ${slateColor}, 0 0 22px ${slateColor}; }
          50%       { text-shadow: 0 0 4px ${slateColor}, 0 0 10px ${slateColor}; }
        }
        .puffo-wrap {
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(12px);
          border: 1px solid ${BORDER_COLOR};
          border-radius: 2rem;
          padding: 14px 28px 16px 28px;
          box-shadow: 0 0 24px rgba(148,163,184,0.15), inset 0 0 12px rgba(0,0,0,0.4);
          min-height: 90px;
        }
        .puffo-texto {
          color: #fff;
          font-style: italic;
          font-weight: 900;
          text-transform: uppercase;
          font-size: clamp(12px, 2vw, 17px);
          line-height: 1.5;
          min-height: 3em;
          animation: neonPulsePuffo 3s ease-in-out infinite;
        }
        .puffo-cursor {
          display: inline-block;
          width: 3px; height: 0.8em;
          margin-left: 3px;
          vertical-align: middle;
          background: ${slateColor};
          box-shadow: 0 0 8px ${slateColor};
        }
        .puffo-loading {
          animation: neonPulsePuffo 1s ease-in-out infinite;
          color: ${slateColor};
          font-size: 11px; font-weight: bold;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
      `}</style>

      <video
        key={VIDEO_DEFAULT}
        src={VIDEO_DEFAULT}
        autoPlay loop muted playsInline
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 1,
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-end pb-0 px-4" style={{ zIndex: 3 }}>
        <div className="w-full max-w-2xl mb-3 pointer-events-auto">
          <div className="puffo-wrap w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{ICONO}</span>
              <span style={{ color: slateColor, fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                {NOMBRE}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              {loading ? (
                <p className="puffo-loading">buscando...</p>
              ) : currentMsg ? (
                <p className="puffo-texto">
                  {display}
                  <span className="puffo-cursor" style={{ opacity: cursor ? 1 : 0 }} />
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="w-full max-w-2xl pointer-events-auto mb-4">
          <AgentChatInput agent="osos" onSend={enviar} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
