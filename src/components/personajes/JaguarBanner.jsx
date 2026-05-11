// src/components/personajes/JaguarBanner.jsx

import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from '../AgentChatInput';
import { usePersonajeChat }     from '../../hooks/usePersonajeChat';
import { promptJaguar }         from '../../services/agents/prompts/promptJaguar';
import { interpretarIntencion } from '../../services/agents/SystemBus';
import { calcularSignoSideral } from '../../data/jaguar/calcularSigno';
import { aries }       from '../../data/jaguar/aries';
import { tauro }       from '../../data/jaguar/tauro';
import { geminis }     from '../../data/jaguar/geminis';
import { cancer }      from '../../data/jaguar/cancer';
import { leo }         from '../../data/jaguar/leo';
import { virgo }       from '../../data/jaguar/virgo';
import { libra }       from '../../data/jaguar/libra';
import { escorpio }    from '../../data/jaguar/escorpio';
import { ofiuco }      from '../../data/jaguar/ofiuco';
import { sagitario }   from '../../data/jaguar/sagitario';
import { capricornio } from '../../data/jaguar/capricornio';
import { acuario }     from '../../data/jaguar/acuario';
import { piscis }      from '../../data/jaguar/piscis';

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

const FRASES_CONFIRMO = {
  aries:       `🐯Aries sideral — entre 19 abr y 13 may. Escribe CONFIRMO y revelo la frecuencia.`,
  tauro:       `🐯 Tauro sideral — entre 14 may y 19 jun. Escribe CONFIRMO y revelo la frecuencia.`,
  geminis:     `🐯 Géminis sideral — entre 20 jun y 20 jul. Escribe CONFIRMO y revelo la frecuencia.`,
  cancer:      `🐯 Cáncer sideral — entre 21 jul y 9 ago. Escribe CONFIRMO y revelo la frecuencia.`,
  leo:         `🐯 Leo sideral — entre 10 ago y 15 sep. Escribe CONFIRMO y revelo la frecuencia.`,
  virgo:       `🐯 Virgo sideral — entre 16 sep y 30 oct. Escribe CONFIRMO y revelo la frecuencia.`,
  libra:       `🐯 Libra sideral — entre 31 oct y 22 nov. Escribe CONFIRMO y revelo la frecuencia.`,
  escorpio:    `🐯 Escorpio sideral — entre 23 nov y 29 nov. Escribe CONFIRMO y revelo la frecuencia.`,
  ofiuco:      `🐯 Ofiuco sideral — entre 30 nov y 17 dic. El signo trece. Escribe CONFIRMO.`,
  sagitario:   `🐯 Sagitario sideral — entre 18 dic y 18 ene. Escribe CONFIRMO y revelo la frecuencia.`,
  capricornio: `🐯 Capricornio sideral — entre 19 ene y 15 feb. Escribe CONFIRMO y revelo la frecuencia.`,
  acuario:     `🐯 Acuario sideral — entre 16 feb y 11 mar. Escribe CONFIRMO y revelo la frecuencia.`,
  piscis:      `🐯 Piscis sideral — entre 12 mar y 18 abr. Escribe CONFIRMO y revelo la frecuencia.`,
};

const ACORDEON_DATA = {
  aries:       { texto: buildTextoSigno(aries),       video: 'https://media.bro7vision.com/jaries.mp4'       },
  tauro:       { texto: buildTextoSigno(tauro),       video: 'https://media.bro7vision.com/jtauro.mp4'       },
  geminis:     { texto: buildTextoSigno(geminis),     video: 'https://media.bro7vision.com/jgeminis.mp4'     },
  cancer:      { texto: buildTextoSigno(cancer),      video: 'https://media.bro7vision.com/jcancer.mp4'      },
  leo:         { texto: buildTextoSigno(leo),         video: 'https://media.bro7vision.com/jleo.mp4'         },
  virgo:       { texto: buildTextoSigno(virgo),       video: 'https://media.bro7vision.com/jvirgo.mp4'       },
  libra:       { texto: buildTextoSigno(libra),       video: 'https://media.bro7vision.com/jlibra.mp4'       },
  escorpio:    { texto: buildTextoSigno(escorpio),    video: 'https://media.bro7vision.com/jescorpio.mp4'    },
  ofiuco:      { texto: buildTextoSigno(ofiuco),      video: 'https://media.bro7vision.com/jofiuco.mp4'      },
  sagitario:   { texto: buildTextoSigno(sagitario),   video: 'https://media.bro7vision.com/jsagitario.mp4'   },
  capricornio: { texto: buildTextoSigno(capricornio), video: 'https://media.bro7vision.com/jcapricornio.mp4' },
  acuario:     { texto: buildTextoSigno(acuario),     video: 'https://media.bro7vision.com/jacuario.mp4'     },
  piscis:      { texto: buildTextoSigno(piscis),      video: 'https://media.bro7vision.com/jpiscis.mp4'      },
};

const FRASES_EXPLORAR = [
  "El cosmos tiene muchas puertas, hermano. ¿Buscas tu signo, la fase lunar, o algo más profundo?",
  "Estoy aquí. ¿Quieres saber de tu signo? ¿De la luna? Habla. 🐯",
  "Las estrellas escuchan todo. Cuéntame qué necesitas. 🐯",
];

const FRASES_FECHA = [
  (signo) => `Hermano... las estrellas lo revelaron. Tu signo sideral es ${signo.toUpperCase()}. Escribe CONFIRMO y te cuento la frecuencia. 🐯`,
  (signo) => `El cosmos me lo confirma — naciste bajo ${signo.toUpperCase()} sideral. Escribe CONFIRMO. 🐯`,
];

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

const VIDEO_DEFAULT = 'https://media.bro7vision.com/jaries.mp4';
const BORDER_COLOR  = 'rgba(255,100,200,0.40)';
const ICONO         = '🐯';
const NOMBRE        = 'JAGUAR SIDÉREO';
const slateColor    = '#94a3b8';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const KEYWORDS_TEMAS = {
  aries:       ['aries'],
  tauro:       ['tauro'],
  geminis:     ['geminis', 'géminis'],
  cancer:      ['cancer', 'cáncer'],
  leo:         ['leo'],
  virgo:       ['virgo'],
  libra:       ['libra'],
  ofiuco:      ['ofiuco'],
  escorpio:    ['escorpio'],
  sagitario:   ['sagitario'],
  capricornio: ['capricornio'],
  acuario:     ['acuario'],
  piscis:      ['piscis'],
};
const KEYWORDS_SALIDA     = ['salir', 'volver', 'osos', 'inicio', 'recepción', 'recepcion'];
const KEYWORDS_SMISTERIO  = ['misterio', 'señor misterio', 'smisterio'];
const KEYWORDS_ORUMAMA    = ['orumama', 'la orumama'];
const KEYWORDS_HIERBAS    = ['hierba', 'planta', 'remedio', 'brebaje'];

function detectarTema(texto) {
  const t = norm(texto);
  for (const [tema, keys] of Object.entries(KEYWORDS_TEMAS)) {
    if (keys.some(k => t.includes(k))) return tema;
  }
  return null;
}

function detectarFecha(texto) {
  const m = texto.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})|(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  return m ? m[0] : null;
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function JaguarBanner({
  alias           = 'Ciudadano',
  origenLlegada   = 'inicial',
  onHandoffPersonaje,
  onInvokeOsos,
  iaMode          = 'off',
  isAdmin         = false,
}) {
  const [display, setDisplay]                 = useState('');
  const [cursor, setCursor]                   = useState(true);
  const [currentMsg, setCurrentMsg]           = useState('');
  const [videoActual, setVideoActual]         = useState(null);
  const [videoFading, setVideoFading]         = useState(false);
  const [mostrarAcordeon, setMostrarAcordeon] = useState(false);
  const [acordeonDisplay, setAcordeonDisplay] = useState('');
  const [acordeonTitulo, setAcordeonTitulo]   = useState('');
  const [temaEnEspera, setTemaEnEspera]       = useState(null);
  const [historiasContadas, setHistoriasContadas] = useState({});

  const charIdx     = useRef(0);
  const acordeonRef = useRef(null);
  const fadeTimer   = useRef(null);
  const origenRef   = useRef(origenLlegada);

  // ── Canal 0 ─────────────────────────────────────────────────────────
  const handleSistema = (intencion) => {
    interpretarIntencion(intencion, {
      onHandoff: (destino) => {
        if (['smisterio', 'orumama'].includes(destino)) {
          onHandoffPersonaje?.(destino);
        } else {
          onInvokeOsos?.();
        }
      },
      onBotContent: (tema, yaContadas) => {
        const data = ACORDEON_DATA[tema];
        if (data) {
          lanzarAcordeon(data.texto, tema);
          cambiarVideo(data.video);
          setHistoriasContadas(prev => ({ ...prev, [tema]: (prev[tema] || 0) + 1 }));
        }
      },
      historiasContadas,
    });
  };

  const { mensaje: iaMensaje, loading, enviar: enviarIA, iaActiva } = usePersonajeChat({
    promptFn:  promptJaguar,
    onSistema: handleSistema,
    iaMode,
    isAdmin,
  });

  useEffect(() => { if (iaMensaje) setCurrentMsg(iaMensaje); }, [iaMensaje]);

  useEffect(() => {
    const esHandoff = origenRef.current === 'handoff';
    setCurrentMsg(esHandoff ? elegir(FRASES_LLEGADA) : elegir(FRASES_BIENVENIDA));
    setVideoActual(VIDEO_DEFAULT);
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

  const cambiarVideo = (url) => {
    if (url === videoActual) return;
    setVideoFading(true);
    clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => {
      setVideoActual(url);
      setVideoFading(false);
    }, 300);
  };

  const lanzarAcordeon = (texto, titulo) => {
    setAcordeonTitulo(titulo.toUpperCase());
    setMostrarAcordeon(true);
    setAcordeonDisplay('');
    let i = 0;
    clearInterval(acordeonRef.current);
    acordeonRef.current = setInterval(() => {
      i++;
      setAcordeonDisplay(texto.slice(0, i));
      if (i >= texto.length) clearInterval(acordeonRef.current);
    }, 18);
  };

  const handleUserInput = (texto) => {
    if (!texto.trim()) return;
    const t = norm(texto);

    // 1. Keywords de salida/handoff
    if (KEYWORDS_SALIDA.some(k => t.includes(k))) {
      setCurrentMsg(elegir(FRASES_HANDOFF_OSOS));
      setTimeout(() => onInvokeOsos?.(), 1200);
      return;
    }

    if (KEYWORDS_SMISTERIO.some(k => t.includes(k))) {
      setCurrentMsg(elegir(FRASES_HANDOFF_SMISTERIO));
      setTimeout(() => onHandoffPersonaje?.('smisterio'), 1200);
      return;
    }

    if (KEYWORDS_ORUMAMA.some(k => t.includes(k)) || KEYWORDS_HIERBAS.some(k => t.includes(k))) {
      setCurrentMsg(elegir(FRASES_HANDOFF_ORUMAMA));
      setTimeout(() => onHandoffPersonaje?.('orumama'), 1200);
      return;
    }

    // 2. CONFIRMO + tema en espera
    if (t.includes('confirmo') && temaEnEspera) {
      const data = ACORDEON_DATA[temaEnEspera];
      if (data) {
        cambiarVideo(data.video);
        lanzarAcordeon(data.texto, temaEnEspera);
        setCurrentMsg('... La frecuencia está al costado. Léela con calma. 🐯');
        setTemaEnEspera(null);
      }
      return;
    }

    // 3. Fecha de nacimiento → calcular signo sideral
    const fecha = detectarFecha(texto);
    if (fecha) {
      const signo = calcularSignoSideral(fecha);
      if (signo && signo !== 'desconocido' && FRASES_CONFIRMO[signo]) {
        setTemaEnEspera(signo);
        setCurrentMsg(elegir(FRASES_FECHA)(signo));
        return;
      }
    }

    // 4. Keyword de signo → pedir CONFIRMO
    const tema = detectarTema(texto);
    if (tema) {
      setTemaEnEspera(tema);
      setCurrentMsg(FRASES_CONFIRMO[tema]);
      return;
    }

    // 5. Modo IA activo → usePersonajeChat
    if (iaActiva) {
      enviarIA(texto);
      return;
    }

    // 6. Fallback bot
    setCurrentMsg(elegir(FRASES_EXPLORAR));
  };

  return (
    <div className="absolute inset-0 z-[50] pointer-events-none">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');

        @keyframes neonPulseOraculo {
          0%, 100% { text-shadow: 0 0 8px ${slateColor}, 0 0 22px ${slateColor}, 0 0 45px ${slateColor}88; }
          50%       { text-shadow: 0 0 4px ${slateColor}, 0 0 10px ${slateColor}; }
        }
        @keyframes cascadaAcordeon {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
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
        .or-acordeon {
          position: fixed;
          right: 0; top: 0;
          width: 32%; height: 100vh;
          background: rgba(0,0,0,0.88);
          backdrop-filter: blur(12px);
          overflow-y: auto; z-index: 2;
          animation: cascadaAcordeon 1.1s cubic-bezier(0.22,1,0.36,1);
          padding: 24px 20px 24px 24px;
          pointer-events: auto;
        }
        .or-acordeon::-webkit-scrollbar { width: 4px; }
        .or-acordeon::-webkit-scrollbar-track { background: transparent; }
        .or-acordeon::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.30); border-radius: 99px; }
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

      {/* ACORDEÓN LATERAL */}
      {mostrarAcordeon && (
        <div className="or-acordeon" style={{ borderLeft: `2px solid ${BORDER_COLOR}` }}>
          <button
            onClick={() => setMostrarAcordeon(false)}
            style={{ position: 'absolute', top: 14, right: 14, color: slateColor, fontSize: 18, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            x
          </button>
          <div style={{ marginTop: 36 }}>
            <p style={{ color: slateColor, fontWeight: 900, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>
              {ICONO} {NOMBRE} · {acordeonTitulo}
            </p>
            <p style={{ color: '#f1f5f9', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, lineHeight: 2.1, whiteSpace: 'pre-wrap', fontStyle: 'italic', letterSpacing: '0.01em' }}>
              {acordeonDisplay}
            </p>
          </div>
        </div>
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
