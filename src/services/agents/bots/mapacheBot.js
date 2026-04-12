// src/services/agents/bots/mapacheBot.js
// BOT JS PURO — Personaje: Mapache (Therian adolescente, sector Audio)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "Mapache aquí 🦝 Me pillas justo antes de ponerme a bailar. ¿Qué música buscas?",
  "¡Ey! Mapache en cabina. ¿Qué quieres escuchar hoy?",
  "Yo soy Mapache. Acabo de ver algo brutal en el móvil — pero primero tú. ¿Qué buscas?",
  "Mapache al habla 🎧 ¿Música, podcast o quieres ver qué hay?",
];

const FRASES_EXPLORAR = [
  "¿Qué estilo buscas? Dime algo y lo encuentro.",
  "Cuéntame qué tienes ganas de escuchar.",
  "¿Tienes artista en mente o exploramos el catálogo?",
];

const FRASES_DESCRIPCION = [
  "Ese canal lo conozco. Mira —",
  "Sí, lo tengo en el catálogo. Aquí va —",
  "Lo he escuchado. Te cuento —",
];

const FRASES_PLAY = [
  "Dale, lo pongo ahora. 🎵",
  "Arrancando.",
  "Va. Dale al play.",
];

const FRASES_HANDOFF_OSOS = [
  "Te mando con los osos. Yo me voy a por una hamburguesa 🍔",
  "Los osos te atienden. Yo tenía algo pendiente de todos modos.",
];

const FRASES_NO_ENTENDIDO = [
  "No te he pillado. ¿Música, podcast o lives?",
  "Repítemelo. Estaba mirando el móvil un segundo.",
];

const FRASES_SIN_RESULTADOS = [
  "No encuentro nada con eso. ¿Pruebas con otro nombre?",
  "No hay nada en el catálogo que encaje. ¿Buscas otra cosa?",
];

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
  semana = null,
}) {
  const intent = intencion || detectarIntencion(textoUser);
  const t = textoUser.toLowerCase();

  if (t.includes('volver') || t.includes('salir') || t.includes('osos')) {
    return { handoff: 'HANDOFF_OSOS', mensaje: elegir(FRASES_HANDOFF_OSOS), bolas: [] };
  }

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
    if (semana?.historia) return { handoff: false, mensaje: semana.historia + ' ¿Qué quieres escuchar?', bolas: [] };
    return { handoff: false, mensaje: elegir(FRASES_BIENVENIDA), bolas: [] };
  }

  if (hayTarjetas) {
    return { handoff: false, mensaje: elegir(FRASES_EXPLORAR), bolas: [] };
  }

  return { handoff: false, mensaje: elegir(FRASES_NO_ENTENDIDO), bolas: [] };
}
