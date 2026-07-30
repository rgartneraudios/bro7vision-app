// src/components/personajes/JaguarBanner.jsx

import React, { useState, useEffect, useRef } from 'react'; 
import AgentChatInput from '../AgentChatInput';
import { useAgentJaguar } from '../../hooks/useAgentJaguar';
import * as JD from '../../data/jaguar/jaguarData';

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const FRASES_BIENVENIDA = [
  "...Jaguar aquí. Respira. ¿Qué quieres saber? 🐯",
  "He dejado de cazar. Ahora escucho. Habla.",
  "El cosmos tiene todo el tiempo del mundo. Yo también. ¿Qué buscas?",
  "Jaguar presente. Las estrellas no mienten. ¿Cuál es tu signo? 🐯",
];

const FRASES_LLEGADA = [
  "...Jaguar aquí. ¿Qué quieres saber? 🐯",
  "Jaguar. El cosmos me lo anunció. Habla, hermano.",
];

const buildTextoSigno = (s) =>
  `${s.simbolo} ${s.frase.trim()}\n\n${s.esencia.trim()}\n\n${s.consejo}`;

const ACORDEON_DATA = {
  aries:       { texto: buildTextoSigno(JD.aries),       video: 'https://media.bro7vision.com/jaguarSignos.mp4'       },
  tauro:       { texto: buildTextoSigno(JD.tauro),       video: 'https://media.bro7vision.com/jaguarSignos.mp4'       },
  geminis:     { texto: buildTextoSigno(JD.geminis),     video: 'https://media.bro7vision.com/jaguarSignos.mp4'     },
  cancer:      { texto: buildTextoSigno(JD.cancer),      video: 'https://media.bro7vision.com/jaguarSignos.mp4'      },
  leo:         { texto: buildTextoSigno(JD.leo),         video: 'https://media.bro7vision.com/jaguarSignos.mp4'         },
  virgo:       { texto: buildTextoSigno(JD.virgo),       video: 'https://media.bro7vision.com/jaguarSignos.mp4'       },
  libra:       { texto: buildTextoSigno(JD.libra),       video: 'https://media.bro7vision.com/jaguarSignos.mp4'       },
  escorpio:    { texto: buildTextoSigno(JD.escorpio),    video: 'https://media.bro7vision.com/jaguarSignos.mp4'    },
  ofiuco:      { texto: buildTextoSigno(JD.ofiuco),      video: 'https://media.bro7vision.com/jaguarSignos.mp4'      },
  sagitario:   { texto: buildTextoSigno(JD.sagitario),   video: 'https://media.bro7vision.com/jaguarSignos.mp4'   },
  capricornio: { texto: buildTextoSigno(JD.capricornio), video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  acuario:     { texto: buildTextoSigno(JD.acuario),     video: 'https://media.bro7vision.com/jaguarSignos.mp4'     },
  piscis:      { texto: buildTextoSigno(JD.piscis),      video: 'https://media.bro7vision.com/jaguarSignos.mp4'      },
  aries_mito:       { texto: JD.ariesMito.data,       video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  tauro_mito:       { texto: JD.tauroMito.data,        video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  geminis_mito:     { texto: JD.geminisMito.data,      video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  cancer_mito:      { texto: JD.cancerMito.data,       video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  leo_mito:         { texto: JD.leoMito.data,          video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  virgo_mito:       { texto: JD.virgoMito.data,        video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  libra_mito:       { texto: JD.libraMito.data,        video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  escorpio_mito:    { texto: JD.escorpioMito.data,     video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  ofiuco_mito:      { texto: JD.ofiucoMito.data,       video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  sagitario_mito:   { texto: JD.sagitarioMito.data,    video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  capricornio_mito: { texto: JD.capricornioMito.data,  video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  acuario_mito:     { texto: JD.acuarioMito.data,      video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  piscis_mito:      { texto: JD.piscisMito.data,       video: 'https://media.bro7vision.com/jaguarSignos.mp4' },
  amazonas_1:       { texto: JD.amazonas1.data,        video: 'https://media.bro7vision.com/jaguarDefaults.mp4' },
  amazonas_2:       { texto: JD.amazonas2.data,        video: 'https://media.bro7vision.com/jaguarDefaults.mp4' },
};

const FRASES_HANDOFF_OSOS = [
  "Los osos operan en otra dimensión, hermano. Te paso con ellos.",
  "Eso no es cósmico — es terrenal. Ve con recepción. 🐯",
];

const FRASES_HANDOFF_SMISTERIO = [
  "☎️ Eso pertenece al Señor Misterio. Su dimensión es otra. Te paso.",
  "Hay frecuencias que ni el universo me deja tocar. Ve con S.Misterio.",
];

const FRASES_HANDOFF_ORUMAMA = [
  "Las hierbas no son mi portal. Ve con Orumama, ella sabe 🌿",
  "Orumama tiene las raíces y el fuego. Te la paso 🕯️",
];

const VIDEO_DEFAULT = 'https://media.bro7vision.com/jaguarDefaults.mp4';
const BORDER_COLOR  = 'rgba(255,100,200,0.40)';
const ICONO         = '🐯';
const NOMBRE        = 'JAGUAR SIDÉREO';
const slateColor    = '#94a3b8';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function JaguarBanner({
  alias           = 'Ciudadano',
  origenLlegada   = 'inicial',
  onHandoffPersonaje,
  onInvokeOsos,
  iaMode          = 'off',
  isAdmin         = false,
  isMobile        = false,
  onMensaje,
  onEnviarRef,
  tienePrepago    = false,
  }) {
  const [display, setDisplay]                 = useState('');
  const [cursor, setCursor]                   = useState(true);
  const [currentMsg, setCurrentMsg]           = useState('');
  const [videoActual, setVideoActual]         = useState(null);
  const [videoFading, setVideoFading]         = useState(false);
  const charIdx     = useRef(0);
  const fadeTimer   = useRef(null);
  const origenRef   = useRef(origenLlegada);

  const { mensaje: iaMensaje, loading, enviar: enviarHook, iaActiva } = useAgentJaguar({
    iaMode,
    isAdmin,
    onBotContent: (tema) => {
      const data = ACORDEON_DATA[tema];
      if (data) {
        cambiarVideo(data.video);
      }
    },
    onHandoff: (destino) => {
      if (['smisterio', 'orumama'].includes(destino)) {
        onHandoffPersonaje?.(destino);
      } else {
        onInvokeOsos?.();
      }
    },
  });

  useEffect(() => { if (iaMensaje) setCurrentMsg(iaMensaje); }, [iaMensaje]);

  useEffect(() => {
    if (iaMensaje) onMensaje?.(iaMensaje);
  }, [iaMensaje]);

  useEffect(() => {
  const esHandoff = origenRef.current === 'handoff';
  const msgInicial = esHandoff ? elegir(FRASES_LLEGADA) : elegir(FRASES_BIENVENIDA);
  setCurrentMsg(msgInicial);
  setVideoActual(VIDEO_DEFAULT);
  onMensaje?.(msgInicial);
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

  useEffect(() => () => clearTimeout(fadeTimer.current), []);

  useEffect(() => {
    if (!onEnviarRef) return;
    onEnviarRef.current = (texto) => enviarHook(texto);
  }, [enviarHook]);

  const cambiarVideo = (url) => {
    if (url === videoActual) return;
    setVideoFading(true);
    clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => {
      setVideoActual(url);
      setVideoFading(false);
    }, 300);
  };

  const handleUserInput = (texto) => {
    if (!texto.trim()) return;
    enviarHook(texto);
  };

  const chatDesbloqueado = isAdmin || tienePrepago;

  return (
    <div className="absolute inset-0 z-[50] pointer-events-none">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');

        @keyframes neonPulseOraculo {
          0%, 100% { text-shadow: none; }
          50%       { text-shadow: none; }
        }
        .or-wrap {
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(148,163,184,0.30);
          border-radius: 2rem;
          padding: 14px 28px 16px 28px;
          box-shadow: 0 0 24px rgba(148,163,184,0.15), inset 0 0 12px rgba(0,0,0,0.4);
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
          width: 3px; height: 0.8em;
          margin-left: 3px;
          vertical-align: middle;
          background: ${slateColor};
          box-shadow: 0 0 8px ${slateColor};
        }
        .or-loading {
          display: inline-block;
          animation: neonPulseOraculo 1s ease-in-out infinite;
          color: ${slateColor};
          font-size: 11px; font-weight: bold;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        `}</style>

      {/* VIDEO OVERLAY */}
      {videoActual && (
        <video
          key={videoActual}
          src={videoActual}
          autoPlay loop muted playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 1,
            opacity: videoFading ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* BANNER + INPUT */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-0 px-4" style={{ zIndex: 3 }}>
        <div className="w-full max-w-2xl mb-3 pointer-events-auto">
          <div className="or-wrap w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{ICONO}</span>
              <span style={{ color: slateColor, fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                {NOMBRE}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              {!currentMsg && (
                <p style={{ color: '#94a3b866', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 700 }}>
                  ORACULO EN LINEA
                </p>
              )}
              {loading ? (
                <p className="or-loading">consultando el cosmos...</p>
              ) : currentMsg ? (
                <p className="or-texto">
                  {display}
                  <span className="or-cursor" style={{ opacity: cursor ? 1 : 0 }} />
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="w-full max-w-2xl pointer-events-auto mb-4">
          {chatDesbloqueado ? (
            <AgentChatInput agent="oraculo" onSend={handleUserInput} isLoading={loading} />
          ) : (
            <div style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148,163,184,0.20)',
              borderRadius: '2rem',
              padding: '12px 24px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              🔒 Necesitas <span style={{color:'#fff'}}>Prepago IA</span> para chatear con {NOMBRE}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
