// src/hooks/useAgentMapache.js
// Hook exclusivo del sector Audio. Gestiona Mapache y Ami.
// personaje = 'mapache' | 'ami'

import { useState } from 'react';
import { fetchContextoMapache } from '../services/contexto/fetchContextoMapache';
import { fetchContextoAmi }     from '../services/contexto/fetchContextoAmi';

const mapache = {
  nombre: 'Mapache',
  tono: 'juvenil, gamberro, estilo bro, positivo, callejero',
  personalidad: `Mapache se ocupa del sector Audio de Bro7vision. Su misión es ofrecerle las perfil cards con código para que los usuarios elijan los audios que quieren escuchar en el reproductor. Tiene alrededor de unos 18 años. Es jovial, hacker, le gustan las hamburguesas. Pasota, rebelde, lenguaje muy informal. Muletillas: "Bro", "Tío / Chabón", "Eh", "Ya ves".`,
};

const ami = {
  nombre: 'Ami',
  tono: 'motivador, positivo, centrado, estudiantil',
  personalidad: `Ami gestiona el sector Audio junto a Mapache. Es la hermana mayor, energética y motivadora. Lenguaje fresco y positivo. Muletillas: "Literal", "O sea", "Súper".`,
};

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

// ── mapacheUtils inlined ──────────────────────────────────────────────────────

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const AUDIO_KEYWORDS_SALIDA = [
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  'producto', 'productos', 'tienda', 'shop', 'nova', 'broshop',
  'servicio', 'servicios', 'isabella', 'profesor', 'prmaestro',
  'aviso', 'avisos', 'anuncio', 'anuncios', 'evelyn', 'larry',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'reinos', 'reino', 'rumores',
  'juego', 'juegos', 'games',
];
const AUDIO_KEYWORDS_AMI     = ['ami', 'amí', 'la ami', 'amy'];
const AUDIO_KEYWORDS_MAPACHE = ['mapache', 'el mapache'];
const AUDIO_INTENT_KEYWORDS  = {
  play:        ['pon', 'ponme', 'play', 'escuchar', 'reproducir', 'quiero oir', 'quiero oír'],
  descripcion: ['qué es', 'que es', 'cuéntame', 'cuentame', 'info', 'quién es', 'quien es', 'descripción', 'descripcion'],
};
const AUDIO_FRASES_SALIDA = [
  'Espera, que te paso con los Osos. 🦝',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Hasta luego.',
  'Te paso con los Osos. Yo sigo en cabina.',
];

const detectarSalidaMapache = (texto) => {
  const t = norm(texto);
  if (!AUDIO_KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)))) return null;
  return { salida: true, mensaje: AUDIO_FRASES_SALIDA[Math.floor(Math.random() * AUDIO_FRASES_SALIDA.length)] };
};

const detectarInternoMapache = (texto, personajeActivo) => {
  const t = norm(texto);
  if (personajeActivo !== 'ami'     && AUDIO_KEYWORDS_AMI.some(kw => t.includes(norm(kw))))     return { interno: true, personaje_id: 'ami' };
  if (personajeActivo !== 'mapache' && AUDIO_KEYWORDS_MAPACHE.some(kw => t.includes(norm(kw)))) return { interno: true, personaje_id: 'mapache' };
  return null;
};

const detectarIntencionMapache = (texto) => {
  const t = norm(texto);
  for (const [intent, keywords] of Object.entries(AUDIO_INTENT_KEYWORDS)) {
    if (keywords.some(kw => t.includes(norm(kw)))) return intent;
  }
  return 'explorar';
};

// ── mapacheBot inlined ────────────────────────────────────────────────────────

function elegir(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const MP_BIENVENIDA  = ["Mapache aquí 🦝 Me pillas justo antes de ponerme a bailar. ¿Qué música buscas, bro?","¡Ey! Mapache en cabina. ¿Qué te renta escuchar hoy?","Yo soy Mapache. Acabo de ver una movida de locos en el móvil — pero a ver tú. ¿Qué buscas?","Mapache al habla 🎧 ¿Música, podcast o quieres ver qué movida hay?"];
const MP_EXPLORAR    = ["¿Qué rollo buscas? Dime algo y lo encuentro.","Tú dirás qué te renta escuchar.","¿Tienes a alguien en mente o miramos a ver qué hay?"];
const MP_DESCRIPCION = ["Ese canal está guapo. Mira —","Sí, tío, lo tengo en el catálogo. Aquí va —","Ya ves, lo he escuchado. Te cuento —"];
const MP_PLAY        = ["De locos, lo pongo ahora. 🎵","Arrancando. A tope.","Va. Dale al play, bro."];
const MP_HO_OSOS     = ["Te paso con los osos. Yo me voy a pillar una hamburguesa 🍔","Los osos te atienden. Yo tenía una movida que hacer de todos modos."];
const MP_HO_AMI      = ["Ami está por aquí. Te la paso 🌅","Ami, ¡tienes visita! Te paso con mi hermana.","La pesada de Ami lo tiene controlado. Dame un seg 💪"];
const MP_NO_ENT      = ["No te he pillado, bro. ¿Música, podcast o lives?","Repítemelo, tío. Estaba mirando el móvil."];
const MP_SIN_RES     = ["No encuentro nada de eso. ¿Pruebas con otra movida?","No hay nada con ese rollo en el catálogo. ¿Buscas otra cosa?"];
const MP_NOMBRES_AMI = ['ami', 'amí', 'la ami', 'amy'];

function detectarIntencionAudio(texto) {
  const t = texto.toLowerCase();
  if (t.includes('pon') || t.includes('play') || t.includes('escuchar') || t.includes('reproducir') || t.includes('ponme')) return 'play';
  if (t.includes('qué es') || t.includes('que es') || t.includes('cuéntame') || t.includes('info') || t.includes('quién es') || t.includes('quien es')) return 'descripcion';
  return 'explorar';
}

function mapacheBot({ textoUser = '', intencion = null, entidad = null, hayTarjetas = false, update = null }) {
  const intent = intencion || detectarIntencionAudio(textoUser);
  const t = textoUser.toLowerCase();
  if (t.includes('volver') || t.includes('salir') || t.includes('osos'))
    return { handoff: 'OSOS', mensaje: elegir(MP_HO_OSOS), bolas: [] };
  if (MP_NOMBRES_AMI.some(n => t.includes(n)))
    return { handoff: 'AUDIO_INTERNO', personaje_id: 'ami', mensaje: elegir(MP_HO_AMI), bolas: [] };
  if (entidad?.accion === 'PLAY')
    return { handoff: 'AUDIO_PLAY', codigo: entidad.codigo, mensaje: elegir(MP_PLAY), bolas: [] };
  if (entidad) {
    if (intent === 'play') return { handoff: 'AUDIO_PLAY', codigo: entidad.bro_pd, mensaje: elegir(MP_PLAY), bolas: [] };
    return { handoff: false, mensaje: `${elegir(MP_DESCRIPCION)} ${entidad.nombre || entidad.bro_pd} — ${entidad.description || entidad.categoria || 'sin descripción disponible'}.`, bolas: [] };
  }
  if (!hayTarjetas) return { handoff: false, mensaje: elegir(MP_SIN_RES), bolas: [] };
  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) return { handoff: false, mensaje: update.historia + ' ¿Qué quieres escuchar?', bolas: [] };
    return { handoff: false, mensaje: elegir(MP_BIENVENIDA), bolas: [] };
  }
  if (hayTarjetas) return { handoff: false, mensaje: elegir(MP_EXPLORAR), bolas: [] };
  return { handoff: false, mensaje: elegir(MP_NO_ENT), bolas: [] };
}

// ── amiBot inlined ────────────────────────────────────────────────────────────

const AMI_BIENVENIDA  = ["Ami aquí. Literal acabo de volver del gym. ¿Qué vibes quieres escuchar?","¡Hola! Soy Ami. Me pillas súper a tope de energía. En plan... ¿música o podcast?","Ami al habla. Desayuné súper bien, así que estoy al cien. O sea, ¿qué mood buscas?","Soy Ami 🎧 ¿Qué ponemos hoy?"];
const AMI_EXPLORAR    = ["¿Qué vibe te va hoy? Dime y lo buscamos.","O sea, ¿tienes algo en mente o probamos con algo súper random?","Tú cuéntame qué quieres escuchar y lo encontramos, obvio."];
const AMI_DESCRIPCION = ["Ese literal lo tengo. Mira —","Sí, obvio lo conozco. Aquí va —","Tengo toda la info de ese. Te cuento —"];
const AMI_PLAY        = ["Perfecto, lo pongo ahora. 🎵","Arrancando. Súper buena elección","Va. A disfrutarlo."];
const AMI_HO_OSOS     = ["Te paso con los osos. Yo me hago mi batido 💪","Te dejo con los osos. ¡Bye!"];
const AMI_HO_MAPACHE  = ["Mapache está en cabina. Te lo paso 🦝","¡Mapache! Tienes visita. Ahora te paso con él.","Mapache tiene lo tuyo. Dame un seg."];
const AMI_NO_ENT      = ["Ay, cero te he pillado. ¿Música, podcast o lives?","O sea, repítemelo. ¿Qué estás buscando exactamente?"];
const AMI_SIN_RES     = ["Literal no encuentro nada con eso ahora mismo. ¿Pruebas con otro nombre?","No hay nada en el catálogo con esas vibes. ¿Buscas otra cosa?"];
const AMI_NOMBRES_MAP = ['mapache', 'el mapache'];

function amiBot({ textoUser = '', intencion = null, entidad = null, hayTarjetas = false, update = null }) {
  const intent = intencion || detectarIntencionAudio(textoUser);
  const t = textoUser.toLowerCase();
  if (t.includes('volver') || t.includes('salir') || t.includes('osos'))
    return { handoff: 'OSOS', mensaje: elegir(AMI_HO_OSOS), bolas: [] };
  if (AMI_NOMBRES_MAP.some(n => t.includes(n)))
    return { handoff: 'AUDIO_INTERNO', personaje_id: 'mapache', mensaje: elegir(AMI_HO_MAPACHE), bolas: [] };
  if (entidad?.accion === 'PLAY')
    return { handoff: 'AUDIO_PLAY', codigo: entidad.codigo, mensaje: elegir(AMI_PLAY), bolas: [] };
  if (entidad) {
    if (intent === 'play') return { handoff: 'AUDIO_PLAY', codigo: entidad.bro_pd, mensaje: elegir(AMI_PLAY), bolas: [] };
    return { handoff: false, mensaje: `${elegir(AMI_DESCRIPCION)} ${entidad.nombre || entidad.bro_pd} — ${entidad.description || entidad.categoria || 'sin descripción disponible'}.`, bolas: [] };
  }
  if (!hayTarjetas) return { handoff: false, mensaje: elegir(AMI_SIN_RES), bolas: [] };
  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) return { handoff: false, mensaje: update.historia + ' ¿Qué quieres escuchar?', bolas: [] };
    return { handoff: false, mensaje: elegir(AMI_BIENVENIDA), bolas: [] };
  }
  if (hayTarjetas) return { handoff: false, mensaje: elegir(AMI_EXPLORAR), bolas: [] };
  return { handoff: false, mensaje: elegir(AMI_NO_ENT), bolas: [] };
}

// ── Shared audio helpers ──────────────────────────────────────────────────────

function detectarBusquedaAudio(mensaje) {
  const t = mensaje.toLowerCase();
  return /música|musica|podcast|canal|audio|escuchar|reproducir|ponme|play|canción|cancion|tema|artista/i.test(t);
}

function fraseBuscandoAudio(keyword) {
  const frases = [
    `A ver qué encuentro de "${keyword}" en el catálogo... 🎧`,
    `Buscando "${keyword}"... dame un seg bro.`,
    `Voy a ver qué hay de "${keyword}" por aquí... 🦝`,
  ];
  return frases[Math.floor(Math.random() * frases.length)];
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPromptMapache(perfil, contexto) {
  const { vivencia, estadoAnimo, promoGeo, special } = contexto || {};
  return `
Eres ${perfil.nombre}. Habla siempre en primera persona.
Tono: ${perfil.tono}

PERSONALIDAD:
${perfil.personalidad}

TU FUNCIÓN:
Gestoras del sector Audio de BRO7VISION.
Presentas canales de audio, podcasts y lives. Ayudas al usuario a encontrar lo que quiere escuchar.
Cuando el usuario quiere escuchar algo → handoff AUDIO_PLAY con el código.
Cuando el usuario quiere buscar → handoff BUSCAR_STRIP.

${vivencia    ? `VIVENCIA DE HOY (incorpórala de forma natural): ${vivencia}`    : ''}
${estadoAnimo ? `ESTADO DE ÁNIMO: ${estadoAnimo}`                               : ''}
${promoGeo    ? `MENCIÓN PATROCINADA (natural, nunca como anuncio): ${promoGeo}` : ''}
${special     ? `SPECIAL ACTIVO — stock: ${special.stock}. Ofrece de forma natural: "${special.texto}". Si el user confirma interés pídele un número de 3 cifras. Cuando lo dé añade al final: [CANJE_CONFIRMADO:${special.codigo}:NNN] sustituyendo NNN por el número.` : ''}

COMPAÑEROS:
${perfil.nombre === 'Mapache'
  ? 'Ami también atiende este sector. Si el user la pide: HANDOFF:AUDIO_INTERNO:ami'
  : 'Mapache también atiende este sector. Si el user lo pide: HANDOFF:AUDIO_INTERNO:mapache'}

HANDOFFS DISPONIBLES:
- HANDOFF:OSOS → salir al sector recepción
- HANDOFF:AUDIO_INTERNO:ami → cambiar a Ami
- HANDOFF:AUDIO_INTERNO:mapache → cambiar a Mapache
- HANDOFF:AUDIO_STOP → parar reproducción
- HANDOFF:AUDIO_PLAY:[codigo] → reproducir canal con ese código

REGLAS:
1. Máximo 3 frases por respuesta.
2. Nunca menciones que eres una IA.
3. Sin asteriscos ni acciones entre asteriscos.
4. Cuando el user quiera salir responde ÚNICAMENTE: HANDOFF:OSOS
5. Cuando el user quiera parar: HANDOFF:AUDIO_STOP
  `.trim();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAgentMapache({
  personaje   = 'mapache',
  iaMode      = 'off',
  isAdmin     = false,
  onHandoff,
  ciudad      = null,
  entidad     = null,
  hayTarjetas = false,
}) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [esPatrocinado, setEsPatrocinado] = useState(false);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);
  const esAmi    = personaje === 'ami';

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const fetchContexto = async () => {
    return esAmi ? fetchContextoAmi(ciudad) : fetchContextoMapache(ciudad);
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto = await fetchContexto();
      if (contexto?.esPatrocinado) setEsPatrocinado(true);

      const perfil = esAmi ? ami : mapache;
      const system = buildPromptMapache(perfil, contexto);

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
        const partes  = respuesta.replace('HANDOFF:', '').trim().split(':');
        const agente  = partes[0];
        const detalle = partes[1] || null;
        onHandoff?.({
          agente,
          ...(detalle && agente === 'AUDIO_INTERNO' && { personaje_id: detalle }),
          ...(detalle && agente === 'AUDIO_PLAY'    && { codigo: detalle }),
        });
        setLoading(false);
        return;
      }

      const canjeMatch   = respuesta.match(/\[CANJE_CONFIRMADO:([^:]+):(\d{3})\]/);
      const mensajeFinal = canjeMatch ? respuesta.replace(canjeMatch[0], '').trim() : respuesta;

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeFinal);
      setMensaje(mensajeFinal);

    } catch (err) {
      console.error('useAgentMapache error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario, extraContext = {}) => {
    if (!textoUsuario?.trim()) return;

    if (/\b(stop|para|detén|frena|detener|frenar)\b/i.test(textoUsuario)) {
      onHandoff?.({ agente: 'AUDIO_STOP' });
      setMensaje('Parado. 🎵');
      return;
    }

    const salida = detectarSalidaMapache(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    const interno = detectarInternoMapache(textoUsuario, personaje);
    if (interno) {
      setTimeout(() => onHandoff?.({ agente: 'AUDIO_INTERNO', personaje_id: interno.personaje_id }), 1200);
      return;
    }

    const cardActiva = extraContext?.card_activa;
    if (cardActiva) {
      const tLower = textoUsuario.trim().toLowerCase();
      const esConfirmacion = /^(play|pon|ponlo|dale|si|sí|ok|yes|poner|reproduce)$/.test(tLower);
      if (esConfirmacion) {
        const codigo = cardActiva.bro_aud || cardActiva.bro_pod || cardActiva.bro_pd;
        if (codigo) {
          setMensaje('Dale. 🎵');
          onHandoff?.({ agente: 'AUDIO_PLAY', codigo, canal: cardActiva });
          return;
        }
      }
    }

    if (iaActiva) {
      enviarIA(textoUsuario);
      return;
    }

    if (detectarBusquedaAudio(textoUsuario)) {
      setMensaje(fraseBuscandoAudio(textoUsuario));
      onHandoff?.({ agente: 'BUSCAR_STRIP', keyword: textoUsuario, intencion: 'AUDIO' });
      return;
    }

    const bot = esAmi ? amiBot : mapacheBot;
    const resultado = bot({
      textoUser:   textoUsuario,
      intencion:   detectarIntencionMapache(textoUsuario),
      entidad,
      hayTarjetas,
    });
    setMensaje(resultado.mensaje);
    if (resultado.handoff) {
      onHandoff?.({
        agente:       resultado.handoff,
        personaje_id: resultado.personaje_id,
        codigo:       resultado.codigo,
        canal:        resultado.canal,
      });
    }
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setEsPatrocinado(false);
  };

  return { mensaje, loading, enviar, reset, iaActiva, esPatrocinado };
}
