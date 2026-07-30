// src/components/personajes/SmisterioBanner.jsx

import React, { useState, useEffect, useRef } from 'react'; 
import AgentChatInput from '../AgentChatInput';
import { useAgentSMisterio } from '../../hooks/useAgentSMisterio';
import * as SD from '../../data/smisterio/smisterioData';

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const FRASES_BIENVENIDA = [
  "☎️ Tengo historias que no encontrarás en ningún libro. Antártida, Egipto, Bucegi, Tartaria. ¿Cuál te llama?",
  "Saludos. Soy el Señor Misterio. Mis archivos cubren Antártida, Egipto, Bucegi y Tartaria. ¿Por dónde empezamos?",
  "☎️ Mensaje entrante... Tengo cuatro misterios esperando. Antártida, Egipto, Bucegi, Tartaria. Elige uno.",
];

const FRASES_LLEGADA = [
  "☎️ Señor Misterio. Dime.",
  "...Aquí el Señor Misterio. ¿Qué enigma buscas? ☎️",
];

const ACORDEON_DATA = {
  antartida: { texto: SD.antartidabot.bot, video: 'https://media.bro7vision.com/smantartidas.mp4' },
  egipto:    { texto: SD.egiptobot.bot,    video: 'https://media.bro7vision.com/smegipto.mp4'     },
  bucegi:    { texto: SD.bucegibot.bot,    video: 'https://media.bro7vision.com/smbucegi.mp4'     },
  tartaria:  { texto: SD.tartariabot.bot,  video: 'https://media.bro7vision.com/smtartaria.mp4'   },
};

// IA path — 4 episodios secuenciales por tema, campos .titulo y .texto
const ACORDEON_DATA_IA = {
  antartida: [SD.laOperacionHighjump, SD.elLagoVostok, SD.elPlanoSinFin, SD.lasCivilizacionesCongeladas],
  bucegi:    [SD.elBosqueDeDracula, SD.rumboBucegi, SD.elPasadizoSecreto, SD.laTeoriaStargate],
  egipto:    [SD.elTeDeLMercader, SD.lanocheEnLaPiramide, SD.losSecretosDelDesierto, SD.memphisYElMisissipi],
  tartaria:  [SD.elImperioPerdido, SD.lasCatedralosHundidas, SD.artePerdido, SD.elTransiberiano],
};

const FRASES_HANDOFF_OSOS = [
  "☎️ Corto comunicación. Los osos te esperan en la superficie.",
  "Mi yogur de higos me espera. Tu camino sigue en recepción. Adiós.",
];

const FRASES_HANDOFF_JAGUAR = [
  "Los astros son territorio de Jaguar. Te paso. ☎️",
  "Jaguar acecha en las estrellas. Te lo paso 🐯",
];

const FRASES_HANDOFF_ORUMAMA = [
  "Orumama conoce los remedios y el fuego sagrado. Te la paso 🕯️",
  "Las raíces saben más que las sombras en esto. Ve con Orumama.",
];

const VIDEO_DEFAULT  = 'https://media.bro7vision.com/smisterioDefaults.mp4';
const BORDER_COLOR   = 'rgba(76,255,48,0.40)';
const ICONO          = '☎️';
const NOMBRE         = 'SR. MISTERIO';
const slateColor     = '#94a3b8';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function SmisterioBanner({
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

  const { mensaje: iaMensaje, loading, enviar: enviarHook, iaActiva } = useAgentSMisterio({
    iaMode,
    isAdmin,
    onBotContent: (tema) => {
      const data = ACORDEON_DATA[tema];
      if (data) {
        cambiarVideo(data.video);
      }
    },
    onHandoff: (destino) => {
      if (['jaguar', 'orumama'].includes(destino)) {
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
    onEnviarRef.current = (texto) => {
      enviarHook(texto, {
        FRASES_CONFIRMO,
        FRASES_HANDOFF: {
          jaguar:  FRASES_HANDOFF_JAGUAR,
          orumama: FRASES_HANDOFF_ORUMAMA,
          osos:    FRASES_HANDOFF_OSOS,
        },
        setCurrentMsg: (msg) => onMensaje?.(msg),
        elegir,
      });
    };
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
          width: 3px;
          height: 0.8em;
          margin-left: 3px;
          vertical-align: middle;
          background: ${slateColor};
          box-shadow: 0 0 8px ${slateColor};
        }
        .or-loading {
          display: inline-block;
          animation: neonPulseOraculo 1s ease-in-out infinite;
          color: ${slateColor};
          font-size: 11px;
          font-weight: bold;
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
