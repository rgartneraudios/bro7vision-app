// src/components/OraculoBanner.jsx
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useAgentChat } from '../hooks/useAgentChat';

const MAX_DAILY = 20;
const STORAGE_KEY = 'bro7_oraculo_usage';

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
};

const OraculoBanner = forwardRef(({
  personaje = 'orumama',
  oraculo_personaje,
  alias,
  realItems = [],
  onInvokeOsos,
}, ref) => {

  const [display, setDisplay]     = useState('');
  const [cursor, setCursor]       = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const [creditos, setCreditos]   = useState(MAX_DAILY);
  const charIdx = useRef(0);

  // Personaje activo — usa oraculo_personaje del perfil si existe
  const personajeActivo = (oraculo_personaje || personaje || 'orumama').toLowerCase();
  const color = '#4CFF30';

  // ── Créditos diarios ────────────────────────────────────────────────
  useEffect(() => {
    const today = new Date().toDateString();
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (stored.date === today) {
        setCreditos(MAX_DAILY - (stored.count || 0));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
        setCreditos(MAX_DAILY);
      }
    } catch {
      setCreditos(MAX_DAILY);
    }
  }, []);

  const consumirCredito = () => {
    const today = new Date().toDateString();
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const count = stored.date === today ? (stored.count || 0) + 1 : 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }));
      setCreditos(MAX_DAILY - count);
    } catch { /* silencioso */ }
  };

  // ── Hook del agente ─────────────────────────────────────────────────
  const { mensaje, loading, enviar } = useAgentChat({
    mode: 'oraculo',
    contextData: {
      alias:             alias || 'Ciudadano',
      oraculo_personaje: personajeActivo,
    },
    realItems,
    onHandoff: ({ agente }) => {
      if (agente === 'OSOS') onInvokeOsos?.();
    },
  });

  // ── Saludo inicial ──────────────────────────────────────────────────
  useEffect(() => {
    const saludos = GREETINGS[personajeActivo] || GREETINGS['orumama'];
    const saludo  = saludos[Math.floor(Math.random() * saludos.length)];
    setCurrentMsg(saludo);
  }, [personajeActivo]);

  // ── Sincronizar mensaje del agente ──────────────────────────────────
  useEffect(() => {
    if (mensaje) setCurrentMsg(mensaje);
  }, [mensaje]);

  // ── Cursor parpadeante ──────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  // ── Máquina de escribir ─────────────────────────────────────────────
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

  // ── Exponer sendMessage al padre (AgentChatInput) ───────────────────
  useImperativeHandle(ref, () => ({
    sendMessage: async (texto) => {
      if (!texto.trim()) return;
      if (creditos <= 0) {
        setCurrentMsg('Hoy ya hemos hablado bastante. Mañana el fuego vuelve a arder. 🕯️');
        return;
      }
      consumirCredito();
      await enviar(texto);
    },
  }));

  // ── Color según personaje ───────────────────────────────────────────
  const nombrePersonaje = personajeActivo === 'jaguar' ? 'JAGUAR ESPIRITUAL' : 'ORUMAMA';
  const iconoPersonaje  = personajeActivo === 'jaguar' ? '🐆' : '🌿';

  return (
    <>
      <style>{`
        @keyframes neonPulseOraculo {
          0%, 100% { text-shadow: 0 0 8px #4CFF30, 0 0 22px #4CFF30, 0 0 45px #4CFF3088; }
          50%       { text-shadow: 0 0 4px #4CFF30, 0 0 10px #4CFF30; }
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
          font-style: italic;
          font-weight: 900;
          text-transform: uppercase;
          font-size: clamp(12px, 2vw, 17px);
          line-height: 1.5;
          min-height: 3em;
          animation: neonPulseOraculo 3s ease-in-out infinite;
        }
        .or-cursor {
          display: inline-block;
          width: 3px;
          height: 0.8em;
          margin-left: 3px;
          vertical-align: middle;
          background: #4CFF30;
          box-shadow: 0 0 8px #4CFF30;
        }
        .or-loading {
          display: inline-block;
          animation: neonPulseOraculo 1s ease-in-out infinite;
          color: #4CFF30;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
      `}</style>

      <div className="w-full flex justify-center px-4">
        <div className="or-wrap w-full">

          {/* Header — nombre + créditos */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{iconoPersonaje}</span>
              <span style={{ color, fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                {nombrePersonaje}
              </span>
            </div>
            {/* Contador de créditos — igual que la terminal vieja */}
            <div className="flex items-center gap-1">
              <span style={{ color: creditos <= 5 ? '#ff4444' : color, fontSize: 9, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                CONSULTAS:
              </span>
              <span style={{ color: creditos <= 5 ? '#ff4444' : '#fff', fontSize: 11, fontWeight: 900, fontFamily: 'monospace' }}>
                {creditos}
              </span>
              <span style={{ color: '#555', fontSize: 9, fontFamily: 'monospace' }}>
                /{MAX_DAILY}
              </span>
            </div>
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
                {display}
                <span className="or-cursor" style={{ opacity: cursor ? 1 : 0 }} />
              </p>
            ) : null}
          </div>

          {/* Créditos agotados */}
          {creditos <= 0 && (
            <p style={{ color: '#ff4444', fontSize: 9, textAlign: 'center', marginTop: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              ⛔ CONSULTAS AGOTADAS — VUELVE MAÑANA
            </p>
          )}

        </div>
      </div>
    </>
  );
});

OraculoBanner.displayName = 'OraculoBanner';
export default OraculoBanner;
