// src/components/personajes/OrumamaBanner.jsx

import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from '../AgentChatInput';
import { useOrumamaChat } from '../../hooks/useOrumamaChat';
import * as OD from '../../data/orumama/orumamaData';

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const FRASES_BIENVENIDA = [
  "Hola hijos míos! Pon la palabra Guisos o Hierbas y te contaré alguno de mis secretos 🕯️",
  "Aquí Orumama 🕯️ Estaba removiendo un brebaje. escribe Guisos o Hierbas y te contaré secretos. a ver, déjame verte!",
  "Las velas están encendidas, los ancestros escuchan. Soy Orumama. ¿Qué quieres consultar? escribe Guisos o Hierbas y te contaré secretos",
  "Pasa, pasa. Me pillaste con la olla al fuego. ¿Qué necesitas saber? escribe Guisos o Hierbas y te contaré secretos",
  "Orumama al habla 🌿 ¿Vienes por hierbas, remedios, o algo que te pesa?, escribe Guisos o Hierbas y te contaré secretos",
];

const FRASES_LLEGADA = [
  "Hola hijos míos!, pon la palabra Guisos o Hierbas y te contaré alguno de mis secretos. 🕯️",
  "...Orumama al habla. Cuéntame. pon la palabra Guisos o Hierbas y te contaré alguno de mis secretos.🌿",
];

const FRASES_CONFIRMO = {
  manzanilla: "🌼 Manzanilla — mi infusión madre. Escribe CONFIRMO y te cuento cómo prepararla.",
  lavanda:    "💜 Lavanda — la hierba de los nervios rotos. Escribe CONFIRMO para saber más.",
  jengibre:   "🌱 Jengibre — calor y defensa. Escribe CONFIRMO y te revelo sus dones.",
  romero:     "🌿 Romero — memoria y circulación. Escribe CONFIRMO para conocerlo bien.",
  menta:      "🍃 Menta — energía y claridad. Escribe CONFIRMO y te cuento.",
  oregano:    "🌿 Orégano — el guardián antibacteriano. Escribe CONFIRMO para sus secretos.",
  tomillo:    "🌱 Tomillo — protector de bronquios. Escribe CONFIRMO.",
  albahaca:   "🌿 Albahaca — calma el estrés y ayuda al vientre. Escribe CONFIRMO.",
  melisa:     "🌸 Melisa — para el corazón acelerado. Escribe CONFIRMO y te lo explico.",
  salvia:     "🌿 Salvia — la hierba de la garganta. Escribe CONFIRMO.",
  ruda:       "🌱 Ruda — dolores y energía, solo uso externo. Escribe CONFIRMO con respeto.",
  romaza:     "🌿 Romaza — hígado y depuración. Escribe CONFIRMO y te cuento.",
  hierbas:    "Las hierbas son mi mundo, hijo mío. Escribe CONFIRMO y te abro el recetario completo.",
  guisos:     "Mis guisos son un misterio de ingredientes. Escribe CONFIRMO y te revelo la olla 🕯️",
};

const ACORDEON_DATA = {
  albahaca:    { texto: OD.albahaca.data,    video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  jengibre:    { texto: OD.jengibre.data,    video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  lavanda:     { texto: OD.lavanda.data,     video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  manzanilla:  { texto: OD.manzanilla.data,  video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  melisa:      { texto: OD.melisa.data,      video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  menta:       { texto: OD.menta.data,       video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  oregano:     { texto: OD.oregano.data,     video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  romaza:      { texto: OD.romaza.data,      video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  romero:      { texto: OD.romero.data,      video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  ruda:        { texto: OD.ruda.data,        video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  salvia:      { texto: OD.salvia.data,      video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  tomillo:     { texto: OD.tomillo.data,     video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  hierbas:     { texto: OD.hierbas.data,     video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  guisos:      { texto: OD.guisos.data,      video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  recetario_1: { texto: OD.recetario1.data,  video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
  recetario_2: { texto: OD.recetario2.data,  video: 'https://media.bro7vision.com/orumamaDefaults.mp4' },
};

const FRASES_EXPLORAR = [
  "¿Qué quieres consultar — el horóscopo, la luna o algo de hierbas y remedios?",
  "El Oráculo está abierto. ¿Qué te preocupa, hijo mío?",
  "Dime qué buscas y veremos qué dicen los ancestros.",
];

const FRASES_HANDOFF_OSOS = [
  "Los osos te esperan. Yo vuelvo a mis velas 🕯️",
  "Te mando con quienes saben de eso. Que las hierbas te acompañen.",
];

const FRASES_HANDOFF_JAGUAR = [
  "El horóscopo es territorio de Jaguar, hijos míos. Te paso con él 🐯",
  "Jaguar escucha más allá de las estrellas. Te lo paso.",
];

const FRASES_HANDOFF_SMISTERIO = [
  "El Señor Misterio está en otro plano ☎️ Te lo paso.",
  "Hay misterios que van más allá de mis brebajes. S.Misterio te espera.",
];

const VIDEO_DEFAULT = 'https://media.bro7vision.com/orumamaDefaults.mp4';
const BORDER_COLOR  = 'rgba(200,255,100,0.40)';
const ICONO         = '🌿';
const NOMBRE        = 'ORUMAMA';
const slateColor    = '#94a3b8';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const KEYWORDS_TEMAS = {
  manzanilla: ['manzanilla'],
  lavanda:    ['lavanda'],
  jengibre:   ['jengibre'],
  romero:     ['romero'],
  menta:      ['menta'],
  oregano:    ['oregano', 'orégano'],
  tomillo:    ['tomillo'],
  albahaca:   ['albahaca'],
  melisa:     ['melisa'],
  salvia:     ['salvia'],
  ruda:       ['ruda'],
  romaza:     ['romaza'],
  hierbas:    ['hierba', 'hierbas', 'planta', 'plantas', 'remedio', 'remedios', 'natural'],
  guisos:     ['guiso', 'guisos', 'cocina', 'receta', 'recetas', 'olla'],
  recetario:  ['recetario'],
};
const KEYWORDS_SALIDA    = ['salir', 'volver', 'osos', 'inicio', 'recepción', 'recepcion'];
const KEYWORDS_JAGUAR    = ['jaguar', 'el jaguar', 'horoscopo', 'horóscopo', 'signo', 'zodiac', 'astro', 'luna', 'lunar'];
const KEYWORDS_SMISTERIO = ['misterio', 'señor misterio', 'smisterio'];

function detectarTema(texto) {
  const t = norm(texto);
  for (const [tema, keys] of Object.entries(KEYWORDS_TEMAS)) {
    if (keys.some(k => t.includes(k))) return tema;
  }
  return null;
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function OrumamaBanner({
  alias = 'Ciudadano',
  origenLlegada = 'inicial',
  onHandoffPersonaje,
  onInvokeOsos,
  iaMode = 'off',
  isAdmin = false,
  isMobile = false,
  onMensaje,
  onEnviarRef,
  }) {
  const [display, setDisplay] = useState('');
  const [cursor, setCursor] = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
const [videoActual, setVideoActual]         = useState(null);
  const [videoFading, setVideoFading]         = useState(false);
  
  const charIdx = useRef(0);
  const fadeTimer = useRef(null);
  const origenRef = useRef(origenLlegada);

  const { mensaje: iaMensaje, loading, enviar: enviarHook } = useOrumamaChat({
    iaMode,
    isAdmin,
    onBotContent: (tema) => {
      const data = ACORDEON_DATA[tema];
      if (data) {
        cambiarVideo(data.video);
      }
    },
    onHandoff: (destino) => {
      if (['jaguar', 'smisterio'].includes(destino)) {
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

  useEffect(() => {
    if (!onEnviarRef) return;
    onEnviarRef.current = (texto) => {
      enviarHook(texto, {
        FRASES_CONFIRMO,
        FRASES_HANDOFF: {
          jaguar:    FRASES_HANDOFF_JAGUAR,
          smisterio: FRASES_HANDOFF_SMISTERIO,
          osos:      FRASES_HANDOFF_OSOS,
        },
        setCurrentMsg: (msg) => onMensaje?.(msg),
        elegir,
      });
    };
  }, [enviarHook, onMensaje]);

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
    enviarHook(texto, {
      FRASES_CONFIRMO,
      FRASES_HANDOFF: {
        jaguar: FRASES_HANDOFF_JAGUAR,
        smisterio: FRASES_HANDOFF_SMISTERIO,
        osos: FRASES_HANDOFF_OSOS,
      },
      setCurrentMsg,
      elegir,
    });
  };

  return (
    <div className="absolute inset-0 z-[50] pointer-events-none">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');

        @keyframes neonPulseOraculo {
          0%, 100% { text-shadow: none; }
          50%      { text-shadow: none; }
        }

        .or-wrap {
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(16px);
          border: 1px solid ${slateColor}44;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 0 30px ${slateColor}22, inset 0 0 20px ${slateColor}11;
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
          <AgentChatInput agent="oraculo" onSend={handleUserInput} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
