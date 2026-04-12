// src/services/agents/bots/amiBot.js
// BOT JS PURO — Personaje: Ami (Therian adolescente, sector Audio)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "Ami aquí 🌅 Acabo de volver del gym. ¿Qué quieres escuchar?",
  "¡Hola! Soy Ami. Me pillas cargada de energía. ¿Música o podcast?",
  "Ami al habla. Desayuné bien así que estoy al cien. ¿Qué buscas?",
  "Soy Ami 🎧 ¿Qué ponemos hoy?",
];

const FRASES_EXPLORAR = [
  "¿Qué estilo te va hoy? Dime y lo buscamos.",
  "¿Tienes algo en mente o exploramos juntos el catálogo?",
  "Cuéntame qué quieres escuchar y lo encontramos.",
];

const FRASES_DESCRIPCION = [
  "Ese lo tengo en el catálogo. Mira —",
  "Sí, lo conozco. Aquí va —",
  "Tengo info de ese. Te cuento —",
];

const FRASES_PLAY = [
  "Perfecto, lo pongo ahora. 🎵",
  "Arrancando. Buena elección.",
  "Va. A disfrutarlo.",
];

const FRASES_HANDOFF_OSOS = [
  "Te mando con los osos. Yo me preparo el batido 💪",
  "Los osos te atienden. Hasta luego.",
];

const FRASES_NO_ENTENDIDO = [
  "No te he pillado bien. ¿Música, podcast o lives?",
  "Repítemelo. ¿Qué estás buscando exactamente?",
];

const FRASES_SIN_RESULTADOS = [
  "No encuentro nada con eso ahora mismo. ¿Pruebas con otro nombre?",
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
