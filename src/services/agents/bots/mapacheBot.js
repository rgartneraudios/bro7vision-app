// src/services/agents/bots/mapacheBot.js
// BOT JS PURO — Personaje: Mapache (Therian adolescente, sector Audio)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
"Mapache aquí 🦝 Me pillas justo antes de ponerme a bailar. ¿Qué música buscas, bro?",
"¡Ey! Mapache en cabina. ¿Qué te renta escuchar hoy?",
"Yo soy Mapache. Acabo de ver una movida de locos en el móvil — pero a ver tú. ¿Qué buscas?",
"Mapache al habla 🎧 ¿Música, podcast o quieres ver qué movida hay?",
];

const FRASES_EXPLORAR = [
"¿Qué rollo buscas? Dime algo y lo encuentro.",
"Tú dirás qué te renta escuchar.",
"¿Tienes a alguien en mente o miramos a ver qué hay?",
];

const FRASES_DESCRIPCION = [
"Ese canal está guapo. Mira —",
"Sí, tío, lo tengo en el catálogo. Aquí va —",
"Ya ves, lo he escuchado. Te cuento —",
];

const FRASES_PLAY = [
"De locos, lo pongo ahora. 🎵",
"Arrancando. A tope.",
"Va. Dale al play, bro.",
];

const FRASES_HANDOFF_OSOS = [
"Te paso con los osos. Yo me voy a pillar una hamburguesa 🍔",
"Los osos te atienden. Yo tenía una movida que hacer de todos modos.",
];

// ── Handoff interno → Ami ──────────────────────────────────────────────────
const FRASES_HANDOFF_AMI = [
"Ami está por aquí. Te la paso 🌅",
"Ami, ¡tienes visita! Te paso con mi hermana.",
"La pesada de Ami lo tiene controlado. Dame un seg 💪",
];

const FRASES_NO_ENTENDIDO = [
"No te he pillado, bro. ¿Música, podcast o lives?",
"Repítemelo, tío. Estaba mirando el móvil.",
];

const FRASES_SIN_RESULTADOS = [
"No encuentro nada de eso. ¿Pruebas con otra movida?",
"No hay nada con ese rollo en el catálogo. ¿Buscas otra cosa?",
];

// Nombres que activan el switch a Ami
const NOMBRES_AMI = ['ami', 'amí', 'la ami', 'amy'];

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

  // ── Handoff interno → Ami ────────────────────────────────────────────
  if (NOMBRES_AMI.some(n => t.includes(n))) {
    return { handoff: 'AUDIO_INTERNO', personaje_id: 'ami', mensaje: elegir(FRASES_HANDOFF_AMI), bolas: [] };
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

export function detectarBusquedaAudio(mensaje) {
  const t = mensaje.toLowerCase();
  return /música|musica|podcast|canal|audio|escuchar|reproducir|ponme|play|canción|cancion|tema|artista/i.test(t);
}

export function fraseBuscandoAudio(keyword) {
  const frases = [
    `A ver qué encuentro de "${keyword}" en el catálogo... 🎧`,
    `Buscando "${keyword}"... dame un seg bro.`,
    `Voy a ver qué hay de "${keyword}" por aquí... 🦝`,
  ];
  return frases[Math.floor(Math.random() * frases.length)];
}
