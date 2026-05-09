// src/components/OraculoBanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from './AgentChatInput';
import { antartida } from '../data/smisterio/Antartida';
import { egipto }    from '../data/smisterio/Egipto';

// ── Historias por personaje ──────────────────────────────────────────────────
const HISTORIAS_MAP = {
  smisterio: [...antartida.historias, ...egipto.historias],
  orumama:   [],
  jaguar:    [],
};

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

const INFO = {
  orumama:   { nombre: 'ORUMAMA',        icono: '🌿' },
  jaguar:    { nombre: 'JAGUAR SIDÉREO', icono: '🐯' },
  smisterio: { nombre: 'SR. MISTERIO',   icono: '☎️' },
};

export default function OraculoBanner({
  personaje = 'orumama',
  oraculo_personaje,
  alias,
  enviar,
  mensaje,
  loading,
  esPatrocinado = false,
  onPersonajeChange,
  onInvokeOsos,
}) {
  const [display, setDisplay]       = useState('');
  const [cursor, setCursor]         = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const charIdx = useRef(0);

  // ── Modo historias ───────────────────────────────────────────────────────
  const [modoHistorias, setModoHistorias]   = useState(false);
  const [historiaActual, setHistoriaActual] = useState(0);
  const [segmentoActual, setSegmentoActual] = useState(0);

  const personajeActivo = (oraculo_personaje || personaje || 'orumama').toLowerCase();
  const color = '#4CFF30';

  const historias     = HISTORIAS_MAP[personajeActivo] || [];
  const hayHistorias  = historias.length > 0;
  const historia      = historias[historiaActual];
  const segmento      = historia?.segmentos[segmentoActual];
  const totalHistorias = historias.length;
  const totalSegmentos = historia?.segmentos.length ?? 0;

  // ── Saludo inicial ───────────────────────────────────────────────────────
  useEffect(() => {
    const saludos = GREETINGS[personajeActivo] || GREETINGS['orumama'];
    setCurrentMsg(saludos[Math.floor(Math.random() * saludos.length)]);
  }, [personajeActivo]);

  // ── Mensaje BOT ──────────────────────────────────────────────────────────
  useEffect(() => { if (mensaje) setCurrentMsg(mensaje); }, [mensaje]);

  // ── Typewriter ───────────────────────────────────────────────────────────
  const sourceText = modoHistorias ? (segmento?.texto ?? '') : currentMsg;
  useEffect(() => {
    if (!sourceText) return;
    charIdx.current = 0;
    setDisplay('');
    const t = setInterval(() => {
      charIdx.current++;
      setDisplay(sourceText.slice(0, charIdx.current));
      if (charIdx.current >= sourceText.length) clearInterval(t);
    }, 22);
    return () => clearInterval(t);
  }, [sourceText, historiaActual, segmentoActual, modoHistorias]);

  // ── Cursor parpadeante ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  // ── Navegación teclado (solo en modoHistorias) ───────────────────────────
  useEffect(() => {
    if (!modoHistorias) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        avanzar();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        retroceder();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modoHistorias, historiaActual, segmentoActual, totalSegmentos, totalHistorias]);

  const avanzar = () => {
    if (segmentoActual < totalSegmentos - 1) {
      setSegmentoActual(s => s + 1);
    } else if (historiaActual < totalHistorias - 1) {
      setHistoriaActual(h => h + 1);
      setSegmentoActual(0);
    }
  };

  const retroceder = () => {
    if (segmentoActual > 0) {
      setSegmentoActual(s => s - 1);
    } else if (historiaActual > 0) {
      const prevHistoria = historiaActual - 1;
      setHistoriaActual(prevHistoria);
      setSegmentoActual(historias[prevHistoria].segmentos.length - 1);
    }
  };

  const toggleModo = () => {
    setModoHistorias(m => !m);
    setHistoriaActual(0);
    setSegmentoActual(0);
  };

  const esPrimerSegmento = historiaActual === 0 && segmentoActual === 0;
  const esUltimoSegmento = historiaActual === totalHistorias - 1 && segmentoActual === totalSegmentos - 1;

  const { nombre: nombrePersonaje, icono: iconoPersonaje } = INFO[personajeActivo] || INFO.orumama;

  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
      <style>{`
        @keyframes neonPulseOraculo {
          0%, 100% { text-shadow: 0 1px 3px rgba(15,23,42,0.95), 0 0 10px rgba(71,85,105,0.5); }
          50%       { text-shadow: 0 1px 2px rgba(15,23,42,0.85), 0 0 6px rgba(71,85,105,0.3); }
        }
        .or-wrap {
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(76,255,48,0.30);
          border-radius: 2rem;
          padding: 14px 28px 16px 28px;
          box-shadow: 0 0 16px rgba(0,13,79,0.15), inset 0 0 12px rgba(0,0,0,0.4);
          min-height: 90px;
        }
        .or-wrap-historias {
          max-height: 50vh;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(76,255,48,0.3) transparent;
        }
        .or-wrap-historias::-webkit-scrollbar { width: 4px; }
        .or-wrap-historias::-webkit-scrollbar-track { background: transparent; }
        .or-wrap-historias::-webkit-scrollbar-thumb {
          background: rgba(76,255,48,0.3);
          border-radius: 99px;
        }
        .or-wrap-historias::-webkit-scrollbar-thumb:hover {
          background: rgba(76,255,48,0.6);
        }
        .or-texto {
          color: #fff;
          font-style: italic; font-weight: 900; text-transform: uppercase;
          font-size: clamp(12px, 2vw, 17px); line-height: 1.5; min-height: 3em;
          animation: neonPulseOraculo 3s ease-in-out infinite;
        }
        .or-texto-historia {
          color: #fff;
          font-weight: 600; text-transform: none;
          font-size: clamp(13px, 1.8vw, 16px); line-height: 1.65; min-height: 3em;
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
        .or-nav-btn {
          background: rgba(76,255,48,0.12);
          border: 1px solid rgba(76,255,48,0.35);
          border-radius: 99px;
          padding: 3px 14px;
          font-size: 11px; font-weight: 800;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(76,255,48,0.85);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .or-nav-btn:hover:not(:disabled) {
          background: rgba(76,255,48,0.28);
          color: #fff;
        }
        .or-nav-btn:disabled { opacity: 0.2; cursor: default; }
        .or-toggle-btn {
          background: rgba(76,255,48,0.10);
          border: 1px solid rgba(76,255,48,0.30);
          border-radius: 99px;
          padding: 2px 10px;
          font-size: 9px; font-weight: 900;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(76,255,48,0.7);
          cursor: pointer;
          transition: background 0.2s;
        }
        .or-toggle-btn:hover { background: rgba(76,255,48,0.22); color: #fff; }
        .or-toggle-btn.activo {
          background: rgba(76,255,48,0.22);
          border-color: rgba(76,255,48,0.6);
          color: #4CFF30;
        }
      `}</style>

      {/* BANNER */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div className={`or-wrap w-full ${modoHistorias ? 'or-wrap-historias' : ''}`}>

          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-lg">{iconoPersonaje}</span>
            <span style={{ color, fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              {nombrePersonaje}
            </span>
            {esPatrocinado && (
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#000', background: '#FACC15', borderRadius: 3, padding: '1px 5px', textTransform: 'uppercase' }}>
                PATROCINADO
              </span>
            )}
            {hayHistorias && (
              <button className={`or-toggle-btn ml-auto ${modoHistorias ? 'activo' : ''}`} onClick={toggleModo}>
                {modoHistorias ? '◈ CHAT' : '◈ HISTORIAS'}
              </button>
            )}
          </div>

          {/* ── MODO HISTORIAS ── */}
          {modoHistorias && historia && (
            <>
              {/* Título de historia */}
              <p style={{ color, fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
                {historia.titulo}
              </p>

              {/* Texto con typewriter */}
              <div className="flex flex-col items-start justify-start text-left">
                <p className="or-texto-historia">
                  {display}<span className="or-cursor" style={{ opacity: cursor ? 1 : 0 }} />
                </p>
              </div>

              {/* CTA del segmento */}
              {segmento?.pregunta && (
                <p style={{ color: 'rgba(76,255,48,0.5)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 10 }}>
                  {segmento.pregunta}
                </p>
              )}

              {/* Navegación */}
              <div className="flex items-center justify-between mt-3 gap-2">
                <button className="or-nav-btn" onClick={retroceder} disabled={esPrimerSegmento}>
                  ← ATRÁS
                </button>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, letterSpacing: '0.15em', textAlign: 'center' }}>
                  H {historiaActual + 1}/{totalHistorias} · SEG {segmentoActual + 1}/{totalSegmentos}
                </span>
                <button className="or-nav-btn" onClick={avanzar} disabled={esUltimoSegmento}>
                  SIGUIENTE →
                </button>
              </div>
            </>
          )}

          {/* ── MODO CHAT (BOT) ── */}
          {!modoHistorias && (
            <div className="flex flex-col items-center justify-center text-center">
              {!currentMsg && (
                <p style={{ color: '#A5FF70', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 700 }}>
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
          )}

        </div>
      </div>

      {/* INPUT */}
      <div className="w-full max-w-2xl pointer-events-auto mb-4">
        <AgentChatInput agent="oraculo" onSend={enviar} isLoading={loading} />
      </div>
    </div>
  );
}
