// src/components/personajes/OrumamaBanner.jsx

import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from '../AgentChatInput';
import { usePersonajeChat }     from '../../hooks/usePersonajeChat';
import { promptOrumama }        from '../../services/agents/prompts/promptOrumama';
import { interpretarIntencion } from '../../services/agents/SystemBus';

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const FRASES_BIENVENIDA = [
  "Aquí Orumama 🕯️ Estaba removiendo un brebaje. ¿Qué mal o consulta te trae al Oráculo, hija mía?",
  "Las velas están encendidas, los ancestros escuchan. Soy Orumama. ¿Qué quieres consultar?",
  "Pasa, pasa. Me pillaste con la olla al fuego. ¿Qué necesitas saber?",
  "Orumama al habla 🌿 ¿Vienes por hierbas, remedios, o algo que te pesa?",
];

const FRASES_LLEGADA = [
  "Orumama aquí. ¿Qué te trae, hija mía? 🕯️",
  "...Orumama al habla. Cuéntame. 🌿",
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

const BOTS_HIERBAS = {
  manzanilla: "🌼 Manzanilla — Mi infusión madre.\nTres cucharadas de flores secas por litro. Dejarla reposar tapada diez minutos. No la hiervas, que pierdes todo lo bueno.\nPara la digestión, para calmar el estómago revuelto, para dormir sin que la cabeza te dé vueltas. Té de manzanilla por la noche y el cuerpo te lo agradece por años.\nAviso de abuela: el conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo 🌿",
  lavanda:    "💜 Lavanda — La hierba de los nervios rotos.\nPara el insomnio, la ansiedad, el corazón acelerado sin motivo. Almohada de lavanda seca o infusión suave antes de dormir.\nUnas gotitas de aceite esencial en la muñeca si la noche se pone larga. La naturaleza nunca apaga la luz de golpe — la va bajando poco a poco.\nAviso de abuela: el conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo 🌿",
  jengibre:   "🌱 Jengibre — Calor y defensa.\nRaíz fresca en rodajas, hervida diez minutos con limón y miel. Para resfriados, náuseas, frío de huesos y digestión pesada.\nLos marineros lo masticaban para no marearse. Yo lo añado a los guisos cuando el invierno aprieta.\nAviso de abuela: el conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo 🌿",
  romero:     "🌿 Romero — Memoria y circulación.\nNo lo infusiones mucho — basta con una ramita en agua caliente dos minutos. Para la cabeza cargada, para activar la sangre, para los días grises en que el cerebro no arranca.\nTambién frotado en las sienes en aceite. Lo tengo plantado en el alféizar porque la vista de él ya es un remedio.\nAviso de abuela: el conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo 🌿",
  menta:      "🍃 Menta — Energía y claridad.\nInfusión fría en verano, caliente en invierno. Para la congestión, el cansancio, los dolores de cabeza que vienen del frío.\nUnas hojas frescas en agua y limón — eso es todo. La naturaleza no necesita complicaciones.\nAviso de abuela: el conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo 🌿",
  oregano:    "🌿 Orégano — El guardián antibacteriano.\nInfusión de orégano seco para la tos persistente y el pecho cargado. También en vapores — tazón con agua muy caliente, orégano, cabeza tapada con toalla, respirar profundo.\nEn la cocina es remedio y condimento al mismo tiempo. Mis guisos siempre llevan orégano.\nAviso de abuela: el conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo 🌿",
  tomillo:    "🌱 Tomillo — Protector de bronquios y defensas.\nInfusión de tomillo con miel para la tos seca. Lo usaban los monjes medievales — algo sabían.\nTambién en gargarismos para la garganta. Y en el baño caliente si el cuerpo pide ayuda con el frío.\nAviso de abuela: el conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo 🌿",
  albahaca:   "🌿 Albahaca — Estrés y digestión.\nInfusión suave para calmar el estómago nervioso. Para los días en que el estómago recibe todo el peso de la mente.\nFresca en ensaladas, como remedio y como alimento. La naturaleza no separa las dos cosas.\nAviso de abuela: el conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo 🌿",
  melisa:     "🌸 Melisa — Para el corazón acelerado.\nLa hierba de los nervios y las palpitaciones sin causa. Infusión suave, nunca concentrada. Para los días de angustia, para las noches que no terminan.\nLos antiguos la llamaban hierba de la alegría. Yo la llamo hierba de la calma.\nAviso de abuela: el conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo 🌿",
  salvia:     "🌿 Salvia — La hierba de la garganta.\nInfusión para gargarismos, también bebida templada. Para la voz ronca, la garganta irritada, la sudoración excesiva.\nTiene fuerza, esta hierba. No la des a embarazadas. El conocimiento de la abuela siempre viene con su aviso.\nAviso de abuela: el conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo 🌿",
  ruda:       "🌱 Ruda — Dolores y energía. Solo uso externo.\nFrotada en aceite para dolores musculares y articulaciones que piden calor. Nunca ingerida — este es el aviso que más repito.\nEn muchas culturas es hierba de protección. Yo la respeto y la uso con cuidado.\nAviso de abuela: el conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo 🌿",
  romaza:     "🌿 Romaza — Hígado y depuración.\nInfusión de hojas secas. Para limpiar el hígado en primavera y otoño, para la piel que pide depuración desde adentro.\nLa naturaleza tiene su ritmo de limpieza. La romaza ayuda a escucharlo.\nAviso de abuela: el conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo 🌿",
  hierbas:    "RECETARIO DE ORUMAMA (Bienestar Natural) 🌿\n\n- Manzanilla: Digestión y calma.\n- Lavanda: Ansiedad e insomnio.\n- Jengibre: Resfriados y náuseas.\n- Romero: Memoria y circulación.\n- Menta: Energía y congestión.\n- Orégano: Antibacteriano y tos.\n- Tomillo: Bronquios y defensas.\n- Albahaca: Estrés y digestión.\n- Melisa: Nervios y palpitaciones.\n- Salvia: Garganta y sudoración.\n- Ruda: Dolores y energía (Uso externo).\n- Romaza: Hígado y depuración.\n\nEscribe el nombre de cualquier hierba para saber más.\n\nAviso: El conocimiento de la abuela no sustituye al médico. Siempre consultar con un facultativo.",
  guisos:     "Mis guisos son un misterio de ingredientes, hija mía 🕯️\n\nLo que puedo revelar: todo buen guiso empieza con paciencia y fuego lento. Las hierbas no se añaden al azar — cada una tiene su momento.\n\nEl romero va al principio, con el aceite. El tomillo a mitad de cocción. La albahaca, fresca, al final.\n\nUna pizca de lo que no se puede nombrar — eso es el secreto de toda abuela digna.\n\nSi el Señor Misterio pregunta por mis guisos... le digo lo mismo. Algunos misterios no se revelan.",
};

const ACORDEON_DATA = Object.fromEntries(
  Object.entries(BOTS_HIERBAS).map(([key, texto]) => [
    key,
    { texto, video: key === 'guisos' ? 'https://media.bro7vision.com/oruguisos.mp4' : 'https://media.bro7vision.com/oruhierbas.mp4' },
  ])
);

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

const VIDEO_DEFAULT = 'https://media.bro7vision.com/oruhierbas.mp4';
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
  hierbas:    ['hierba', 'hierbas', 'planta', 'plantas', 'remedio', 'remedios', 'recetario', 'natural'],
  guisos:     ['guiso', 'guisos', 'cocina', 'receta', 'recetas', 'olla'],
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
        if (['jaguar', 'smisterio'].includes(destino)) {
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
    promptFn:  promptOrumama,
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

    if (KEYWORDS_JAGUAR.some(k => t.includes(k))) {
      setCurrentMsg(elegir(FRASES_HANDOFF_JAGUAR));
      setTimeout(() => onHandoffPersonaje?.('jaguar'), 1200);
      return;
    }

    if (KEYWORDS_SMISTERIO.some(k => t.includes(k))) {
      setCurrentMsg(elegir(FRASES_HANDOFF_SMISTERIO));
      setTimeout(() => onHandoffPersonaje?.('smisterio'), 1200);
      return;
    }

    // 2. CONFIRMO + tema en espera
    if (t.includes('confirmo') && temaEnEspera) {
      const data = ACORDEON_DATA[temaEnEspera];
      if (data) {
        cambiarVideo(data.video);
        lanzarAcordeon(data.texto, temaEnEspera);
        setCurrentMsg('... Aquí al costado lo tienes todo. Lee con calma, hija mía 🕯️');
        setTemaEnEspera(null);
      }
      return;
    }

    // 3. Detectar tema → pedir CONFIRMO
    const tema = detectarTema(texto);
    if (tema) {
      setTemaEnEspera(tema);
      setCurrentMsg(FRASES_CONFIRMO[tema]);
      return;
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
