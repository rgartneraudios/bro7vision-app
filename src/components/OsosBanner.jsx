// src/components/OsosBanner.jsx
import React, { useState, useEffect, useRef } from 'react';

// ── Fuera del componente ──────────────────────────────────────────────────
const OSOS_GREETINGS = [
  "Saludos, somos Osos IA 🐻 ¿En qué podemos asesorarte?",
  "¡Hola! Osos al mando. Cuéntanos qué necesitas.",
  "Aquí la central de Osos. ¿Cómo podemos ayudarte hoy?",
  "Osos en línea. Escribe tu consulta y nos ponemos a ello. ⚡",
];

export default function OsosBanner({ mensaje }) {
  const [display, setDisplay]       = useState('');
  const [cursor, setCursor]         = useState(true);
  const [currentMsg, setCurrentMsg] = useState(''); // Nuevo estado
  const charIdx = useRef(0);

  // ── Saludo inicial ──────────────────────────────────────────────────
  useEffect(() => {
    const greeting = OSOS_GREETINGS[Math.floor(Math.random() * OSOS_GREETINGS.length)];
    setCurrentMsg(greeting);
  }, []);

  // ── Sincronizar con los mensajes del padre ──────────────────────────
  useEffect(() => {
    // Si el padre envía un mensaje nuevo, sobrescribe el saludo inicial
    if (mensaje) {
      setCurrentMsg(mensaje);
    }
  }, [mensaje]);

  // ── Cursor parpadeante ──────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  // ── Efecto máquina de escribir cuando llega nuevo mensaje ───────────
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

  return (
    <>
      <style>{`
        @keyframes neonPulseOsos {
          0%, 100% { text-shadow: 0 0 8px #a855f7, 0 0 22px #a855f7, 0 0 45px #a855f7; }
          50%       { text-shadow: 0 0 4px #a855f7, 0 0 10px #a855f7; }
        }
        
        @keyframes floatBola {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        .ob-wrap {
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(168,85,247,0.30);
          border-radius: 2rem;
          padding: 18px 32px 20px 32px;
          box-shadow: 0 0 24px rgba(168,85,247,0.2), inset 0 0 12px rgba(0,0,0,0.4);
          min-height: 90px;
        }
        .ob-texto {
          color: #fff;
          font-style: italic;
          font-weight: 900;
          text-transform: uppercase;
          font-size: clamp(13px, 2.2vw, 18px);
          line-height: 1.5;
          min-height: 3em;
          animation: neonPulseOsos 3s ease-in-out infinite;
        }
        .ob-cursor {
          display: inline-block;
          width: 3px;
          height: 0.8em;
          margin-left: 3px;
          vertical-align: middle;
          background: #a855f7;
          box-shadow: 0 0 8px #a855f7;
        }
      `}</style>
      <div className="w-full flex justify-center px-4">
        <div className="ob-wrap w-full flex flex-col items-center justify-center text-center">
          {/* Si por algún motivo no hay mensaje actual, mostramos el texto fallback */}
          {!currentMsg && (
            <p className="text-gray-600 text-xs uppercase tracking-widest font-bold">
              ◈ OSOS IA · EN LÍNEA
            </p>
          )}
          {currentMsg && (
            <p className="ob-texto">
              {display}
              <span className="ob-cursor" style={{ opacity: cursor ? 1 : 0 }} />
            </p>
          )}
        </div>
      </div>
    </>
  );
}