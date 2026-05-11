// src/components/personajes/SmisterioBanner.jsx

import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from '../AgentChatInput';
import { usePersonajeChat }     from '../../hooks/usePersonajeChat';
import { promptSmisterio }      from '../../services/agents/prompts/promptSmisterio';
import { interpretarIntencion } from '../../services/agents/SystemBus';

// Bot path — texto .bot para el acordeón tras CONFIRMO
import { antartidabot } from '../../data/smisterio/antartida/AntartidaBot';
import { bucegi1 }      from '../../data/smisterio/bucegi/Bucegi1';
import { egipto1 }      from '../../data/smisterio/egipto/Egipto1';
import { tartaria1 }    from '../../data/smisterio/tartaria/Tartaria1';

// IA path — 4 episodios por tema, campos .titulo y .texto
import { laOperacionHighjump }         from '../../data/smisterio/antartida/LaOperacionHighjump';
import { elLagoVostok }                from '../../data/smisterio/antartida/ElLagoVostok';
import { elPlanoSinFin }               from '../../data/smisterio/antartida/ElPlanoSinFin';
import { lasCivilizacionesCongeladas } from '../../data/smisterio/antartida/LasCivilizacionesCongeladas';

import { elBosqueDeDracula } from '../../data/smisterio/bucegi/ElBosqueDeDracula';
import { rumboBucegi }       from '../../data/smisterio/bucegi/RumboBucegi';
import { elPasadizoSecreto } from '../../data/smisterio/bucegi/ElPasadizoSecreto';
import { laTeoriaStargate }  from '../../data/smisterio/bucegi/LaTeoriaStargate';

import { elTeDeLMercader }        from '../../data/smisterio/egipto/ElTeDeLMercader';
import { lanocheEnLaPiramide }    from '../../data/smisterio/egipto/LanocheEnLaPiramide';
import { losSecretosDelDesierto } from '../../data/smisterio/egipto/LosSecretosDelDesierto';
import { memphisYElMisissipi }    from '../../data/smisterio/egipto/MemphisYElMisissipi';

import { elImperioPerdido }      from '../../data/smisterio/tartaria/ElImperioPerdido';
import { lasCatedralosHundidas } from '../../data/smisterio/tartaria/LasCatedralosHundidas';
import { artePerdido }           from '../../data/smisterio/tartaria/ArtePerdido';
import { elTransiberiano }       from '../../data/smisterio/tartaria/ElTransiberiano';

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

const FRASES_CONFIRMO = {
  antartida: "☎️ La Antártida guarda secretos que no aparecen en los mapas. Escribe CONFIRMO y te los revelo.",
  egipto:    "☎️ Egipto. Miles de años de verdades ocultas. Escribe CONFIRMO y empezamos.",
  bucegi:    "☎️ Bucegi. Rumanía esconde más de lo que parece. Escribe CONFIRMO si quieres saber.",
  tartaria:  "☎️ Tartaria. El imperio que borraron de la historia. Escribe CONFIRMO para conocerlo.",
};

// Bot path — campo .bot
const ACORDEON_DATA = {
  antartida: { texto: antartidabot.bot, video: 'https://media.bro7vision.com/smantartidas.mp4' },
  egipto:    { texto: egipto1.bot,      video: 'https://media.bro7vision.com/smegipto.mp4'   },
  bucegi:    { texto: bucegi1.bot,      video: 'https://media.bro7vision.com/smbucegi.mp4'   },
  tartaria:  { texto: tartaria1.bot,    video: 'https://media.bro7vision.com/smtartaria.mp4' },
};

// IA path — 4 episodios secuenciales por tema, campos .titulo y .texto
const ACORDEON_DATA_IA = {
  antartida: [laOperacionHighjump, elLagoVostok, elPlanoSinFin, lasCivilizacionesCongeladas],
  bucegi:    [elBosqueDeDracula, rumboBucegi, elPasadizoSecreto, laTeoriaStargate],
  egipto:    [elTeDeLMercader, lanocheEnLaPiramide, losSecretosDelDesierto, memphisYElMisissipi],
  tartaria:  [elImperioPerdido, lasCatedralosHundidas, artePerdido, elTransiberiano],
};

const FRASES_EXPLORAR = [
  "¿Qué misterio te trajo aquí? ☎️",
  "Pregunta. Aunque quizás... no quieras saber la respuesta.",
  "¿Qué pieza del rompecabezas buscas?",
];

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

const KEYWORDS_TEMAS = {
  antartida: ['antartida', 'antártida', 'polo sur', 'highjump'],
  egipto:    ['egipto', 'pirámide', 'piramide', 'faraón', 'faraon'],
  bucegi:    ['bucegi', 'rumanía', 'rumania'],
  tartaria:  ['tartaria', 'imperio perdido', 'barroco'],
};
const KEYWORDS_SALIDA  = ['salir', 'volver', 'osos', 'inicio', 'recepción', 'recepcion'];
const KEYWORDS_JAGUAR  = ['jaguar', 'el jaguar'];
const KEYWORDS_ORUMAMA = ['orumama', 'la orumama'];

function detectarTema(texto) {
  const t = norm(texto);
  for (const [tema, keys] of Object.entries(KEYWORDS_TEMAS)) {
    if (keys.some(k => t.includes(k))) return tema;
  }
  return null;
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function SmisterioBanner({
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

  const historiasContadasRef = useRef({});

  const charIdx     = useRef(0);
  const acordeonRef = useRef(null);
  const fadeTimer   = useRef(null);
  const origenRef   = useRef(origenLlegada);

  // ── Canal 0 — interpreta lo que la IA reporta al sistema ────────────
  const handleSistema = (intencion) => {
    interpretarIntencion(intencion, {
      onHandoff: (destino) => {
        if (['jaguar', 'orumama'].includes(destino)) {
          onHandoffPersonaje?.(destino);
        } else {
          onInvokeOsos?.();
        }
      },
      onBotContent: (tema) => {
        const yaContadas = historiasContadasRef.current[tema] || 0;
        const historias  = ACORDEON_DATA_IA[tema];
        if (historias) {
          const indice = Math.min(yaContadas, historias.length - 1);
          lanzarAcordeon(historias[indice].texto, historias[indice].titulo);
          cambiarVideo(ACORDEON_DATA[tema].video);
          historiasContadasRef.current = {
            ...historiasContadasRef.current,
            [tema]: yaContadas + 1,
          };
        }
      },
    });
  };

  const { mensaje: iaMensaje, loading, enviar: enviarIA, iaActiva } = usePersonajeChat({
    promptFn:  promptSmisterio,
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

    // 1. Salida → Osos (siempre, IA o bot)
    if (KEYWORDS_SALIDA.some(k => t.includes(k))) {
      setCurrentMsg(elegir(FRASES_HANDOFF_OSOS));
      setTimeout(() => onInvokeOsos?.(), 2500);
      return;
    }

    // 2 y 3. Handoff interno — solo en modo bot
    // En modo IA lo gestiona la IA via Canal 0 con delay en SystemBus
    if (!iaActiva) {
      if (KEYWORDS_JAGUAR.some(k => t.includes(k))) {
        setCurrentMsg(elegir(FRASES_HANDOFF_JAGUAR));
        setTimeout(() => onHandoffPersonaje?.('jaguar'), 2500);
        return;
      }
      if (KEYWORDS_ORUMAMA.some(k => t.includes(k))) {
        setCurrentMsg(elegir(FRASES_HANDOFF_ORUMAMA));
        setTimeout(() => onHandoffPersonaje?.('orumama'), 2500);
        return;
      }
    }

    // 2. CONFIRMO + tema en espera — bot lanza acordeón con .bot
    if (t.includes('confirmo') && temaEnEspera) {
      const data = ACORDEON_DATA[temaEnEspera];
      if (data) {
        cambiarVideo(data.video);
        lanzarAcordeon(data.texto, temaEnEspera);
        setCurrentMsg('... Aquí al costado te revelo lo que sé. Léelo con calma. ☎️');
        setTemaEnEspera(null);
      }
      return;
    }

    // 3. Detectar tema → pedir CONFIRMO (solo bot, no cuando IA activa)
    if (!iaActiva) {
      const tema = detectarTema(texto);
      if (tema) {
        setTemaEnEspera(tema);
        setCurrentMsg(FRASES_CONFIRMO[tema]);
        return;
      }
    }

    // 4. Modo IA activo → usePersonajeChat
    if (iaActiva) {
      enviarIA(texto);
      return;
    }

    // 5. Fallback bot
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
          right: 0; top: 0;
          width: 32%; height: 100vh;
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
