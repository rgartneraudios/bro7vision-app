// src/hooks/useAgentRumores.js
// Hook exclusivo del sector Reinos. Solo Rumores — sin handoffs internos.

import { useState } from 'react';
import { fetchContextoRumores } from '../services/contexto/fetchContextoRumores';

const RUMORES_PERSONALIDAD = `Rumores fue un reportero de alfombras rojas de cine y ahora, ya retirado, usa su energía y dramatismo para narrar los Reinos de BRO7VISION. Es elegante, dramático y habla con la autoridad de quien ha visto a las grandes estrellas. Dramático/a, exagerado/a, vive todo como si fuera el guion de una película de Hollywood. Muletillas: "My Friends", "Divinos", "¡Chicos!".`;

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

// ── reinosUtils inlined ───────────────────────────────────────────────────────

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const KEYWORDS_SALIDA_REINOS = [
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'juego', 'juegos', 'games',
];

const INTENT_KEYWORDS_REINOS = {
  listar:    ['lista', 'todos', 'ver todo', 'que hay', 'qué hay', 'directorio'],
  novedades: ['novedad', 'nuevo', 'última', 'ultima', 'reciente', 'update'],
  detalle:   ['que es', 'qué es', 'cuentame', 'cuéntame', 'info', 'dime'],
};

const FRASES_SALIDA_REINOS = [
  'Espera, que te paso con los Osos. 🎬',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Yo vuelvo a mis notas.',
  'Te paso con los Osos. Los Reinos siguen aquí.',
];

const detectarSalidaReinos = (texto) => {
  const t = norm(texto);
  const quiereSalir = KEYWORDS_SALIDA_REINOS.some(kw => t.includes(norm(kw)));
  if (!quiereSalir) return null;
  return {
    salida:  true,
    mensaje: FRASES_SALIDA_REINOS[Math.floor(Math.random() * FRASES_SALIDA_REINOS.length)],
  };
};

const detectarIntencionReinos = (texto) => {
  const t = norm(texto);
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS_REINOS)) {
    if (keywords.some(kw => t.includes(norm(kw)))) return intent;
  }
  return 'explorar';
};

// ── rumoresBot inlined ────────────────────────────────────────────────────────

const FRASES_BIENVENIDA = [
  "Rumores aquí 🎬 Llevo años cubriendo alfombras rojas y ahora cubro los Reinos. ¡Divinos todos! ¿Qué quieres saber?",
  "Soy Rumores. Jubilado del cine, pero al servicio de los Reinos de BroVision. ¡Todo glamour! ¿Qué te interesa?",
  "¡Buenas! Rumores al habla. Acabo de terminar una tarta de queso. ¿Qué Reino quieres conocer? ¡Chisss, que los hay muy top!",
  "Rumores aquí. He visto escándalos en las alfombras rojas que no creería — y en los Reinos también. ¿Qué buscas?",
];

const FRASES_LISTAR = [
  "Aquí está el listado de los Reinos de BroVision. ¡Un bombazo! Mira bien —",
  "Los Reinos registrados, en exclusiva divina. Toma nota —",
  "El directorio de Reinos, con todo el glamour. Aquí van —",
];

const FRASES_DETALLE = [
  "Ese Reino lo conozco bien. ¡Es un cuadro! Te cuento —",
  "Buena elección, muy top. Aquí va la info —",
  "Lo tengo en mis notas. ¡Chisss! Mira —",
];

const FRASES_NOVEDADES = [
  "Últimas noticias de los Reinos — ¡bombazo total! Esto es lo más reciente.",
  "Las novedades en primicia, con todo el glamour que merecen —",
  "Acabo de actualizar el registro. ¡Escándalo de exclusiva! Esto es lo nuevo —",
];

const FRASES_EXPLORAR = [
  "¿Buscas un Reino concreto o quieres ver el listado completo? ¡Divinos todos!",
  "Dime qué Reino te interesa o te muestro el directorio. ¡Muy top!",
  "¿Tienes algún Reino en mente o exploramos? ¡Chisss, que hay sorpresas!",
];

const FRASES_HANDOFF_OSOS = [
  "Te mando con recepción. ¡Glamour, divinos! Yo me voy a por unos caneloni 🍝",
  "Los osos te atienden. Yo tengo pendiente una tarta de queso. ¡Top!",
];

const FRASES_NO_ENTENDIDO = [
  "No te he pillado. ¿Buscas un Reino concreto o el listado? ¡Chisss!",
  "Repítemelo. ¿Qué Reino o qué información buscas, divino/a?",
];

const FRASES_SIN_RESULTADOS = [
  "No encuentro ese Reino. ¡Qué escándalo! ¿Pruebas con otro nombre?",
  "No está en el directorio. ¿Buscas otro, top?",
];

function elegir(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectarIntencionRumores(texto) {
  const t = texto.toLowerCase();
  if (t.includes('lista') || t.includes('todos') || t.includes('ver todo') || t.includes('qué hay') || t.includes('que hay')) return 'listar';
  if (t.includes('novedad') || t.includes('nuevo') || t.includes('última') || t.includes('ultima') || t.includes('reciente')) return 'novedades';
  if (t.includes('qué es') || t.includes('que es') || t.includes('cuéntame') || t.includes('info') || t.includes('dime')) return 'detalle';
  return 'explorar';
}

function rumoresBot({ textoUser = '', intencion = null, reinos = [], reinoDetalle = null, update = null }) {
  const intent = intencion || detectarIntencionRumores(textoUser);
  const t = textoUser.toLowerCase();

  if (t.includes('volver') || t.includes('salir') || t.includes('osos')) {
    return { handoff: 'OSOS', mensaje: elegir(FRASES_HANDOFF_OSOS), bolas: [] };
  }

  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) return { handoff: false, mensaje: update.historia + ' ¿Qué Reino te interesa?', bolas: [] };
    return { handoff: false, mensaje: elegir(FRASES_BIENVENIDA), bolas: [] };
  }

  switch (intent) {
    case 'listar':
      if (reinos.length > 0) {
        const lista = reinos.map(r => r.nombre || r.title).join(', ');
        return { handoff: false, mensaje: `${elegir(FRASES_LISTAR)} ${lista}.`, bolas: [] };
      }
      return { handoff: false, mensaje: elegir(FRASES_SIN_RESULTADOS), bolas: [] };

    case 'novedades':
      if (update?.historia) {
        return { handoff: false, mensaje: `${elegir(FRASES_NOVEDADES)} ${update.historia}`, bolas: [] };
      }
      return { handoff: false, mensaje: elegir(FRASES_NOVEDADES) + ' Nada nuevo por ahora.', bolas: [] };

    case 'detalle':
      if (reinoDetalle) {
        return {
          handoff: false,
          mensaje: `${elegir(FRASES_DETALLE)} ${reinoDetalle.nombre || reinoDetalle.title} — ${reinoDetalle.description || 'sin descripción disponible'}.`,
          bolas: [],
        };
      }
      return { handoff: false, mensaje: elegir(FRASES_SIN_RESULTADOS), bolas: [] };

    default:
      return { handoff: false, mensaje: elegir(FRASES_EXPLORAR), bolas: [] };
  }
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPromptRumores(contexto) {
  const { vivencia, estadoAnimo, promoGeo, special } = contexto || {};

  return `
Eres Rumores. Reportero jubilado de alfombras rojas de cine, ahora narrador oficial
de los Reinos de BRO7VISION. Dramático, elegante y con autoridad de quien ha visto
a las grandes estrellas.

PERSONALIDAD:
${RUMORES_PERSONALIDAD}

TU FUNCIÓN:
Informar sobre los Reinos de BRO7VISION — Reyes, Reinas, Príncipes, Princesas,
Duques, Duquesas, Marqueses, Condes y Lords/Ladies.
Presentas el directorio de Reinos con dramatismo y glamour.

${vivencia    ? `VIVENCIA DE HOY (incorpórala de forma natural): ${vivencia}`    : ''}
${estadoAnimo ? `ESTADO DE ÁNIMO: ${estadoAnimo}`                               : ''}
${promoGeo    ? `MENCIÓN PATROCINADA (natural, nunca como anuncio): ${promoGeo}` : ''}
${special     ? `SPECIAL ACTIVO — stock: ${special.stock}. Ofrece de forma natural: "${special.texto}". Si el user confirma interés pídele un número de 3 cifras. Cuando lo dé añade al final: [CANJE_CONFIRMADO:${special.codigo}:NNN] sustituyendo NNN por el número.` : ''}

HANDOFFS DISPONIBLES:
- HANDOFF:OSOS → salir al sector recepción

REGLAS:
1. Máximo 3 frases por respuesta. Dramático pero conciso.
2. Nunca menciones que eres una IA.
3. Sin asteriscos ni acciones entre asteriscos.
4. Cuando el user quiera salir responde ÚNICAMENTE: HANDOFF:OSOS
  `.trim();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAgentRumores({
  iaMode       = 'off',
  isAdmin      = false,
  onHandoff,
  ciudad       = null,
  reinos       = [],
  reinoDetalle = null,
}) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  // ── Envío IA ──────────────────────────────────────────────────────────────
  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto  = await fetchContextoRumores(ciudad);
      const system    = buildPromptRumores(contexto);

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system,
          messages:    chatHistory.slice(-4),
          userMessage: textoUsuario,
          iaMode,
        }),
      });

      const data      = await res.json();
      const respuesta = data?.texto || '...';

      if (respuesta.trim().startsWith('HANDOFF:')) {
        setMensaje('Los Osos te esperan. ¡Glamour, divinos! 🎬');
        setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
        setLoading(false);
        return;
      }

      const canjeMatch   = respuesta.match(/\[CANJE_CONFIRMADO:([^:]+):(\d{3})\]/);
      const mensajeFinal = canjeMatch ? respuesta.replace(canjeMatch[0], '').trim() : respuesta;

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeFinal);
      setMensaje(mensajeFinal);

    } catch (err) {
      console.error('useAgentRumores error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  // ── Entrada principal — Bot e IA ──────────────────────────────────────────
  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;

    // 1. Salida → Osos — siempre
    const salida = detectarSalidaReinos(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    // 2. Modo IA
    if (iaActiva) {
      enviarIA(textoUsuario);
      return;
    }

    // 3. Fallback Bot
    const resultado = rumoresBot({
      textoUser:    textoUsuario,
      intencion:    detectarIntencionReinos(textoUsuario),
      reinos,
      reinoDetalle,
    });
    setMensaje(resultado.mensaje);
    if (resultado.handoff === 'OSOS') {
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
    }
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
  };

  return { mensaje, loading, enviar, reset, iaActiva };
}
