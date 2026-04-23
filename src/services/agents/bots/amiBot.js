// src/services/agents/bots/amiBot.js
// BOT JS PURO — Personaje: Ami (Therian adolescente, sector Audio)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "Ami aquí. Literal acabo de volver del gym. ¿Qué vibes quieres escuchar?",
  "¡Hola! Soy Ami. Me pillas súper a tope de energía. En plan... ¿música o podcast?",
  "Ami al habla. Desayuné súper bien, así que estoy al cien. O sea, ¿qué mood buscas?",
  "Soy Ami 🎧 ¿Qué ponemos hoy?",
];

const FRASES_EXPLORAR = [
  "¿Qué vibe te va hoy? Dime y lo buscamos.",
  "O sea, ¿tienes algo en mente o probamos con algo súper random?",
  "Tú cuéntame qué quieres escuchar y lo encontramos, obvio.",
];

const FRASES_DESCRIPCION = [
  "Ese literal lo tengo. Mira —",
   "Sí, obvio lo conozco. Aquí va —",
  "Tengo toda la info de ese. Te cuento —",
];

const FRASES_PLAY = [
"Perfecto, lo pongo ahora. 🎵",
  "Arrancando. Súper buena elección",
  "Va. A disfrutarlo.",
];

const FRASES_HANDOFF_OSOS = [
  "Te paso con los osos. Yo me hago mi batido 💪",
"Te dejo con los osos. ¡Bye!",
];

// ── Handoff interno → Mapache ──────────────────────────────────────────────
const FRASES_HANDOFF_MAPACHE = [
  "Mapache está en cabina. Te lo paso 🦝",
"¡Mapache! Tienes visita. Ahora te paso con él.",
"Mapache tiene lo tuyo. Dame un seg.",
];

const FRASES_NO_ENTENDIDO = [
  "Ay, cero te he pillado. ¿Música, podcast o lives?",
"O sea, repítemelo. ¿Qué estás buscando exactamente?",
];

const FRASES_SIN_RESULTADOS = [
 "Literal no encuentro nada con eso ahora mismo. ¿Pruebas con otro nombre?",
"No hay nada en el catálogo con esas vibes. ¿Buscas otra cosa?",
];

// Nombres que activan el switch a Mapache
const NOMBRES_MAPACHE = ['mapache', 'el mapache'];

function elegir(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectarIntencion(texto) {
  const t = texto.toLowerCase();
  if (t.includes('pon') || t.includes('play') || t.includes('escuchar') || t.includes('reproducir') || t.includes('ponme')) return 'play';
  if (t.includes('qué es') || t.includes('que es') || t.includes('cuéntame') || t.includes('info') || t.includes('quién es') || t.includes('quien es')) return 'descripcion';
  return 'explorar';
}

export function responder({
  textoUser = '',
  intencion = null,
  entidad = null,
  hayTarjetas = false,
  update = null,
}) {
  const intent = intencion || detectarIntencion(textoUser);
  const t = textoUser.toLowerCase();

  // ── Handoff a Osos ───────────────────────────────────────────────────
  if (t.includes('volver') || t.includes('salir') || t.includes('osos')) {
    return { handoff: 'OSOS', mensaje: elegir(FRASES_HANDOFF_OSOS), bolas: [] };
  }

  // ── Handoff interno → Mapache ────────────────────────────────────────
  if (NOMBRES_MAPACHE.some(n => t.includes(n))) {
    return { handoff: 'AUDIO_INTERNO', personaje_id: 'mapache', mensaje: elegir(FRASES_HANDOFF_MAPACHE), bolas: [] };
  }

  // ── AUDIO_PLAY directo ───────────────────────────────────────────────
  if (entidad?.accion === 'PLAY') {
    return { handoff: 'AUDIO_PLAY', codigo: entidad.codigo, mensaje: elegir(FRASES_PLAY), bolas: [] };
  }

  if (entidad) {
    if (intent === 'play') {
      return { handoff: 'AUDIO_PLAY', codigo: entidad.bro_id, mensaje: elegir(FRASES_PLAY), bolas: [] };
    }
    return {
      handoff: false,
      mensaje: `${elegir(FRASES_DESCRIPCION)} ${entidad.nombre || entidad.bro_id} — ${entidad.description || entidad.categoria || 'sin descripción disponible'}.`,
      bolas: [],
    };
  }

  if (!hayTarjetas) {
    return { handoff: false, mensaje: elegir(FRASES_SIN_RESULTADOS), bolas: [] };
  }

  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) return { handoff: false, mensaje: update.historia + ' ¿Qué quieres escuchar?', bolas: [] };
    return { handoff: false, mensaje: elegir(FRASES_BIENVENIDA), bolas: [] };
  }

  if (hayTarjetas) {
    return { handoff: false, mensaje: elegir(FRASES_EXPLORAR), bolas: [] };
  }

  return { handoff: false, mensaje: elegir(FRASES_NO_ENTENDIDO), bolas: [] };
}
