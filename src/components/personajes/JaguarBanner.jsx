// src/components/personajes/JaguarBanner.jsx

import React, { useState, useEffect, useRef } from 'react'; 
import OraculoAcordeon from '../OraculoAcordeon';
import AgentChatInput from '../AgentChatInput';
import { useJaguarChat } from '../../hooks/useJaguarChat';
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

const FRASES_CONFIRMO = {
  aries:       `🐯Aries sideral — entre 19 abr y 13 may. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
  tauro:       `🐯 Tauro sideral — entre 14 may y 19 jun. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
  geminis:     `🐯 Géminis sideral — entre 20 jun y 20 jul. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
  cancer:      `🐯 Cáncer sideral — entre 21 jul y 9 ago. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
  leo:         `🐯 Leo sideral — entre 10 ago y 15 sep. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
  virgo:       `🐯 Virgo sideral — entre 16 sep y 30 oct. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
  libra:       `🐯 Libra sideral — entre 31 oct y 22 nov. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
  escorpio:    `🐯 Escorpio sideral — entre 23 nov y 29 nov. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
  ofiuco:      `🐯 Ofiuco sideral — entre 30 nov y 17 dic. El signo trece. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
  sagitario:   `🐯 Sagitario sideral — entre 18 dic y 18 ene. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
  capricornio: `🐯 Capricornio sideral — entre 19 ene y 15 feb. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
  acuario:     `🐯 Acuario sideral — entre 16 feb y 11 mar. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
  piscis:      `🐯 Piscis sideral — entre 12 mar y 18 abr. Escribe CONFIRMO y revelo la frecuencia aquí al costado. En modo móvil lo tendrás en la pestaña mando.`,
};

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

const VIDEO_DEFAULT = 'https://media.bro7vision.com/jaguarDefaults.mp4';
const BORDER_COLOR  = 'rgba(255,100,200,0.40)';
const ICONO         = '🐯';
const NOMBRE        = 'JAGUAR SIDÉREO';
const slateColor    = '#94a3b8';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const KEYWORDS_TEMAS = {
  // mitos y amazonas PRIMERO: 'aries mito' contiene 'aries' como substring
  aries_mito:       ['aries mito'],
  tauro_mito:       ['tauro mito'],
  geminis_mito:     ['geminis mito', 'géminis mito'],
  cancer_mito:      ['cancer mito', 'cáncer mito'],
  leo_mito:         ['leo mito'],
  virgo_mito:       ['virgo mito'],
  libra_mito:       ['libra mito'],
  escorpio_mito:    ['escorpio mito'],
  ofiuco_mito:      ['ofiuco mito'],
  sagitario_mito:   ['sagitario mito'],
  capricornio_mito: ['capricornio mito'],
  acuario_mito:     ['acuario mito'],
  piscis_mito:      ['piscis mito'],
  amazonas:         ['cuentos del amazonas', 'amazonas'],
  // signos
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
  isMobile        = false,
  onMensaje,
  onEnviarRef,
  mostrarAcordeon: mostrarAcordeonExterno = true,
}) {
  const [display, setDisplay]                 = useState('');
  const [cursor, setCursor]                   = useState(true);
  const [currentMsg, setCurrentMsg]           = useState('');
  const [videoActual, setVideoActual]         = useState(null);
  const [videoFading, setVideoFading]         = useState(false);
  const [mostrarAcordeon, setMostrarAcordeon] = useState(false);
  const [acordeonData, setAcordeonData]       = useState({ titulo: '', texto: '' });
  const charIdx     = useRef(0);
  const fadeTimer   = useRef(null);
  const origenRef   = useRef(origenLlegada);

  const { mensaje: iaMensaje, loading, enviar: enviarHook, iaActiva } = useJaguarChat({
    iaMode,
    isAdmin,
    onBotContent: (tema) => {
      const data = ACORDEON_DATA[tema];
      if (data) {
        setAcordeonData({ titulo: tema, texto: data.texto });
        setMostrarAcordeon(true);
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
    onEnviarRef.current = (texto) => {
      enviarHook(texto, {
        calcularSignoSideral: JD.calcularSignoSideral,
        FRASES_CONFIRMO,
        FRASES_HANDOFF: {
          smisterio: FRASES_HANDOFF_SMISTERIO,
          orumama:   FRASES_HANDOFF_ORUMAMA,
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

  const lanzarAcordeon = (texto, titulo) => {
    // Método eliminado: OraculoAcordeon maneja internamente la animación.
  };

  const handleUserInput = (texto) => {
    if (!texto.trim()) return;
    enviarHook(texto, {
      calcularSignoSideral: JD.calcularSignoSideral,
      FRASES_CONFIRMO,
      FRASES_HANDOFF: {
        smisterio: FRASES_HANDOFF_SMISTERIO,
        orumama:   FRASES_HANDOFF_ORUMAMA,
        osos:      FRASES_HANDOFF_OSOS,
      },
      setCurrentMsg,
      elegir,
    });
  };

  if (isMobile) {
    return (
      <>
        {mostrarAcordeonExterno && mostrarAcordeon && (
          <OraculoAcordeon
            titulo={acordeonData.titulo}
            texto={acordeonData.texto}
            onClose={() => setMostrarAcordeon(false)}
            isMobile={true}
            borderColor={BORDER_COLOR}
            icono={ICONO}
            nombre={NOMBRE}
          />
        )}
      </>
    );
  }

  return (
    <div className="absolute inset-0 z-[50] pointer-events-none">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');

        @keyframes neonPulseOraculo {
          0%, 100% { text-shadow: none; }
          50%       { text-shadow: none; }
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
        <OraculoAcordeon
          titulo={acordeonData.titulo}
          texto={acordeonData.texto}
          onClose={() => setMostrarAcordeon(false)}
          isMobile={isMobile}
          borderColor={BORDER_COLOR}
          icono={ICONO}
          nombre={NOMBRE}
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
