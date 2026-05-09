// src/components/OraculoBanner.jsx
// Sistema dinámico: video por personaje/subtema + acordeon lateral + deteccion de confirmacion.

import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from './AgentChatInput';
import { oraculo_horoscopo }  from '../data/sistema/oraculo_horoscopo';
import { oraculo_herbolario } from '../data/sistema/oraculo_herbolario';
import { antartida } from '../data/smisterio/Antartida';
import { egipto }    from '../data/smisterio/Egipto';
import { bucegi }   from '../data/smisterio/bucegi';
import { tartaria } from '../data/smisterio/tartaria';

// ── CONFIG: videos, temas y palabras clave por personaje ────────────────────
// smisterio.temas: { key → { video, data } }  data=null = sin acordeón
// jaguar/orumama.temas: { key → string url }   (sin acordeón de subtema)
const ORACULO_CONFIG = {
  smisterio: {
    videoDefault:    'https://media.bro7vision.com/smantartida.mp4',
    subtemaDefault:  'antartida',
    tema:            'historias',
    preguntaConfirmacion: 'Deseas conocer mis historias?',
    temas: {
      antartida: { video: 'https://media.bro7vision.com/smantartida.mp4', data: antartida },
      egipto:    { video: 'https://media.bro7vision.com/smegipto.mp4',    data: egipto    },
      bucegi:    { video: 'https://media.bro7vision.com/smbucegi.mp4',    data: bucegi      },
      tartaria:  { video: 'https://media.bro7vision.com/smtartaria.mp4',  data: tartaria      },
    },
    borderColor: 'rgba(76,255,48,0.40)',
  },
  jaguar: {
    videoDefault: 'https://media.bro7vision.com/jaries.mp4',
    tema: 'signos',
    preguntaConfirmacion: 'Deseas saber de signos zodiacales?',
    temas: {
      aries:       'https://media.bro7vision.com/jaries.mp4',
      tauro:       'https://media.bro7vision.com/jtauro.mp4',
      geminis:     'https://media.bro7vision.com/jgeminis.mp4',
      cancer:      'https://media.bro7vision.com/jcancer.mp4',
      leo:         'https://media.bro7vision.com/jleo.mp4',
      virgo:       'https://media.bro7vision.com/jvirgo.mp4',
      libra:       'https://media.bro7vision.com/jlibra.mp4',
      ofiuco:      'https://media.bro7vision.com/jofiuco.mp4',
      escorpio:    'https://media.bro7vision.com/jescorpio.mp4',
      sagitario:   'https://media.bro7vision.com/jsagitario.mp4',
      capricornio: 'https://media.bro7vision.com/jcapricornio.mp4',
      acuario:     'https://media.bro7vision.com/jacuario.mp4',
      piscis:      'https://media.bro7vision.com/jpiscis.mp4',
    },
    borderColor: 'rgba(255,100,200,0.40)',
    contenido: oraculo_horoscopo,
  },
  orumama: {
    videoDefault: 'https://media.bro7vision.com/oruhierbas.mp4',
    tema: 'recetas',
    preguntaConfirmacion: 'Deseas que te cuente mis recetas?',
    temas: {
      hierbas: 'https://media.bro7vision.com/oruhierbas.mp4',
      guisos:  'https://media.bro7vision.com/oruguisos.mp4',
    },
    borderColor: 'rgba(200,255,100,0.40)',
    contenido: oraculo_herbolario,
  },
};

const CONFIRMACIONES = [
  'si','sí','claro','ok','cuentame','adelante','dale','vamos',
  'quiero','me interesa','dime','cuenta','continua','continua',
];

const GREETINGS = {
  orumama: [
    'Aqui Orumama. El fuego esta encendido y la olla ya hierve. Que te trae por aqui?',
    'Pasa, pasa. Me pillaste revolviendo unos brebajes. En que puedo ayudarte?',
    'Orumama al habla. Las velas estan puestas. Cuentame que necesitas.',
    'Ven, sientate. Tengo un te de melisa recien hecho. Que te preocupa?',
  ],
  jaguar: [
    '...Jaguar aqui. Respira. Que quieres saber?',
    'He dejado de cazar. Ahora escucho. Habla.',
    'El cosmos tiene todo el tiempo del mundo. Yo tambien. Que buscas?',
    'Jaguar presente. Las estrellas no mienten. Cual es tu signo?',
  ],
  smisterio: [
    'Saludos. El Senor Misterio al habla las verdades del pasado nos observan. Que enigma buscas?',
    'Mensaje entrante... Soy el Senor Misterio. Que pieza del rompecabezas buscas hoy?',
    'La luz reside en lo oculto. Hablamos de Egipto, la Atlantida, o algo mas profundo?',
  ],
};

const norm = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// ── COMPONENTE ───────────────────────────────────────────────────────────────
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

  const [videoActual, setVideoActual]                     = useState(null);
  const [mostrarAcordeon, setMostrarAcordeon]             = useState(false);
  const [temaActual, setTemaActual]                       = useState(null);
  const [subtemaActual, setSubtemaActual]                 = useState(null);
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(false);
  const [videoFadingOut, setVideoFadingOut]               = useState(false);
  const [acordeonDisplay, setAcordeonDisplay]             = useState('');
  const fadeTimerRef    = useRef(null);
  const acordeonRef     = useRef(null);

  const personajeActivo = (oraculo_personaje || personaje || 'orumama').toLowerCase();
  const color = '#94a3b8';
  const cfg   = ORACULO_CONFIG[personajeActivo] || ORACULO_CONFIG.orumama;

  const INFO = {
    orumama:   { nombre: 'ORUMAMA',        icono: '🌿' },
    jaguar:    { nombre: 'JAGUAR SIDEREO', icono: '🐯' },
    smisterio: { nombre: 'SR. MISTERIO',   icono: '☎️' },
  };
  const { nombre: nombrePersonaje, icono: iconoPersonaje } =
    INFO[personajeActivo] || INFO.orumama;

  // ── Al cambiar personaje: saludo + pregunta ───────────────────────────────
  useEffect(() => {
    const saludos = GREETINGS[personajeActivo] || GREETINGS.orumama;
    const saludo  = saludos[Math.floor(Math.random() * saludos.length)];
    setCurrentMsg(saludo + ' ' + cfg.preguntaConfirmacion);
    setVideoActual(null);
    setMostrarAcordeon(false);
    setTemaActual(null);
    setSubtemaActual(null);
    setConfirmacionPendiente(true);
  }, [personajeActivo]);

  useEffect(() => { if (mensaje) setCurrentMsg(mensaje); }, [mensaje]);

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

  useEffect(() => () => clearTimeout(fadeTimerRef.current), []);

  // ── Typewriter del acordeón ───────────────────────────────────────────────
  useEffect(() => {
    clearInterval(acordeonRef.current);
    setAcordeonDisplay('');
    if (!mostrarAcordeon) return;
    const texto = getAcordeonContenido();
    if (!texto) return;
    let i = 0;
    acordeonRef.current = setInterval(() => {
      i++;
      setAcordeonDisplay(texto.slice(0, i));
      if (i >= texto.length) clearInterval(acordeonRef.current);
    }, 18);
    return () => clearInterval(acordeonRef.current);
  }, [mostrarAcordeon, subtemaActual]);

  // ── Cambiar video con fade ────────────────────────────────────────────────
  const cambiarVideo = (url) => {
    if (url === videoActual) return;
    setVideoFadingOut(true);
    clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => {
      setVideoActual(url);
      setVideoFadingOut(false);
    }, 300);
  };

  // ── Obtener contenido del acordeón según subtema o personaje ─────────────
  const getAcordeonContenido = () => {
    if (subtemaActual && cfg.temas[subtemaActual]?.data) {
      const bot = cfg.temas[subtemaActual].data.bot;
      return Array.isArray(bot) ? bot.join('\n\n') : (bot || null);
    }
    return cfg.contenido || null;
  };

  const getAcordeonTitulo = () => {
    if (subtemaActual) return subtemaActual.toUpperCase();
    return cfg.tema?.toUpperCase() || '';
  };

  // ── Interceptar input usuario ─────────────────────────────────────────────
  const handleUserInput = (texto) => {
    const t = norm(texto);

    if (confirmacionPendiente) {
      const confirmado = CONFIRMACIONES.some(w => t.includes(norm(w)));
      if (confirmado) {
        const defKey  = cfg.subtemaDefault || null;
        const defTema = defKey ? cfg.temas[defKey] : null;
        cambiarVideo(cfg.videoDefault);
        setTemaActual(cfg.tema);
        setSubtemaActual(defKey);
        // mostrar acordeón solo si el subtema default tiene contenido
        const tieneData = defTema ? (typeof defTema === 'object' ? !!defTema.data : false) : !!cfg.contenido;
        setMostrarAcordeon(tieneData);
        setConfirmacionPendiente(false);
      }
    }

    for (const [key, valor] of Object.entries(cfg.temas)) {
      if (t.includes(norm(key))) {
        // valor puede ser string (url) o { video, data }
        const url      = typeof valor === 'string' ? valor : valor.video;
        const tieneBot = typeof valor === 'object' && !!valor.data;
        cambiarVideo(url);
        setSubtemaActual(key);
        if (tieneBot) setMostrarAcordeon(true);
        break;
      }
    }

    enviar(texto);
  };

  const slateColor = '#94a3b8';

  return (
    <div className="absolute inset-0 z-[50] pointer-events-none">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');

        @keyframes neonPulseOraculo {
          0%, 100% {
            text-shadow: 0 0 8px ${slateColor}, 0 0 22px ${slateColor}, 0 0 45px ${slateColor}88;
          }
          50% {
            text-shadow: 0 0 4px ${slateColor}, 0 0 10px ${slateColor};
          }
        }
        @keyframes cascadaAcordeon {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes fadeInAcordeon {
          from { opacity: 0; }
          to   { opacity: 1; }
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
        .or-acordeon {
          position: fixed;
          right: 0;
          top: 0;
          width: 32%;
          height: 100vh;
          background: rgba(0,0,0,0.88);
          backdrop-filter: blur(12px);
          overflow-y: auto;
          z-index: 2;
          animation: cascadaAcordeon 1.1s cubic-bezier(0.22,1,0.36,1);
          padding: 24px 20px 24px 24px;
          pointer-events: auto;
        }
        .or-acordeon::-webkit-scrollbar { width: 4px; }
        .or-acordeon::-webkit-scrollbar-track { background: transparent; }
        .or-acordeon::-webkit-scrollbar-thumb {
          background: rgba(148,163,184,0.30);
          border-radius: 99px;
        }
      `}</style>

      {/* 1. VIDEO OVERLAY ──────────────────────────────────────────────────── */}
      {videoActual && (
        <video
          key={videoActual}
          src={videoActual}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            opacity: videoFadingOut ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* 2. ACORDEON LATERAL DERECHO ───────────────────────────────────────── */}
      {mostrarAcordeon && (
        <div className="or-acordeon" style={{ borderLeft: `2px solid ${cfg.borderColor}` }}>
          <button
            onClick={() => setMostrarAcordeon(false)}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              color: slateColor,
              fontSize: 18,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            x
          </button>

          <div style={{ marginTop: 36 }}>
            <p style={{
              color: slateColor,
              fontWeight: 900,
              fontSize: 10,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}>
              {iconoPersonaje} {nombrePersonaje} · {getAcordeonTitulo()}
            </p>
            <p style={{
              color: '#f1f5f9',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 19,
              lineHeight: 2.1,
              whiteSpace: 'pre-wrap',
              fontStyle: 'italic',
              letterSpacing: '0.01em',
            }}>
              {acordeonDisplay}
            </p>
          </div>
        </div>
      )}

      {/* 3. BANNER + INPUT ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-end pb-0 px-4"
        style={{ zIndex: 3 }}
      >
        <div className="w-full max-w-2xl mb-3 pointer-events-auto">
          <div className="or-wrap w-full">

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{iconoPersonaje}</span>
              <span style={{
                color: slateColor,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
              }}>
                {nombrePersonaje}
              </span>
              {esPatrocinado && (
                <span style={{
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: '0.2em',
                  color: '#000',
                  background: '#FACC15',
                  borderRadius: 3,
                  padding: '1px 5px',
                  textTransform: 'uppercase',
                }}>
                  PATROCINADO
                </span>
              )}
            </div>

            {/* Mensaje */}
            <div className="flex flex-col items-center justify-center text-center">
              {!currentMsg && (
                <p style={{
                  color: '#94a3b866',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3em',
                  fontWeight: 700,
                }}>
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

        {/* INPUT */}
        <div className="w-full max-w-2xl pointer-events-auto mb-4">
          <AgentChatInput agent="oraculo" onSend={handleUserInput} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
