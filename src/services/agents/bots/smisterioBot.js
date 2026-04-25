// src/services/agents/bots/smisterioBot.js
// BOT JS PURO — Personaje: Señor Misterio (Misterios y civilizaciones, sector Oráculo)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "...Señor Misterio. ☎️ ¿Qué buscas?",
  "Las sombras te trajeron aquí. Habla.",
  "☎️ Mensaje entrante... Soy el Señor Misterio. ¿Qué enigma te pesa?",
  "Bienvenido. ¿Egipto, la Atlántida... o algo más oculto?",
];

const FRASES_MISTERIO = [
  "☎️ Quizás... la Atlántida y Lemuria aún resuenan. ¿Sabes escuchar?",
  "Egipto y el Barroco comparten secretos. Depende de si quieres verlos.",
  "Las conspiraciones del pasado... ☎️ Escucha con atención.",
];

const FRASES_YOGUR = [
  "Mi sustento es un enigma... aunque confieso que un yogur griego con mermelada de higos ayuda a pensar.",
  "Mientras degusto mi yogur griego con higos, las respuestas de Lemuria se hacen más claras.",
];

const FRASES_EXPLORAR = [
  "¿Qué misterio te trajo aquí? ☎️",
  "Pregunta. Aunque quizás... no quieras saber la respuesta.",
  "¿Qué pieza del rompecabezas buscas?",
];

const FRASES_HANDOFF_JAGUAR = [
  "Los astros son territorio de Jaguar. Quizás él tenga respuestas... o más preguntas.",
  "☎️ Intentas vibrar en otra frecuencia. Te paso con Jaguar.",
  "Jaguar acecha en las estrellas. Te lo paso 🐆", "Jaguar, hay alguien que quiere hablar contigo.",
];

const FRASES_HANDOFF_ORUMAMA = [
  "Entiendo que tengas miedo. Te paso con Orumama, ella cura esos males.",
  "Las raíces saben más que las sombras en esto. Ve con Orumama.",
  "Orumama conoce los remedios y el fuego sagrado. Te la paso 🕯️",
];

const FRASES_HANDOFF_OSOS = [
  "☎️ Corto comunicación. Los osos te esperan en la superficie. Ve con cuidado.",
  "Mi yogur de higos me espera y tu camino sigue en recepción. Adiós.",
];


const NOMBRES_ORUMAMA = ['orumama', 'la orumama'];
const NOMBRES_JAGUAR  = ['jaguar', 'el jaguar'];

function elegir(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function detectarIntencion(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('misterio') || t.includes('secreto') || t.includes('egipto') || t.includes('atlantida') || t.includes('lemuria') || t.includes('barroco') || t.includes('conspiracion')) return 'misterio';
  if (t.includes('comida') || t.includes('comer') || t.includes('yogur') || t.includes('higo')) return 'yogur';
  return 'explorar';
}

export function responder({ textoUser = '', intencion = null, bloqueConocimiento = null, update = null }) {
  const intent = intencion || detectarIntencion(textoUser);
  const t = textoUser.toLowerCase();

  if (t.includes('volver') || t.includes('salir') || t.includes('osos')) {
    return { handoff: 'OSOS', mensaje: elegir(FRASES_HANDOFF_OSOS), bolas: [] };
  }

  // ── Handoffs internos ────────────────────────────────────────────────
  if (NOMBRES_ORUMAMA.some(n => t.includes(n))) {
    return { handoff: 'ORACULO_INTERNO', personaje_id: 'orumama', mensaje: elegir(FRASES_HANDOFF_ORUMAMA), bolas: [] };
  }
  if (NOMBRES_JAGUAR.some(n => t.includes(n))) {
    return { handoff: 'ORACULO_INTERNO', personaje_id: 'jaguar', mensaje: elegir(FRASES_HANDOFF_JAGUAR), bolas: [] };
  }

  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos', 'saludos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) return { handoff: false, mensaje: update.historia + ' ¿Qué enigma buscas hoy? ☎️', bolas: [] };
    return { handoff: false, mensaje: elegir(FRASES_BIENVENIDA), bolas: [] };
  }

  switch (intent) {
    case 'misterio':
      return { handoff: false, mensaje: bloqueConocimiento ? `${elegir(FRASES_MISTERIO)} ${bloqueConocimiento}` : elegir(FRASES_MISTERIO), bolas: [] };
    case 'yogur':
      return { handoff: false, mensaje: elegir(FRASES_YOGUR), bolas: [] };
    default:
      return { handoff: false, mensaje: elegir(FRASES_EXPLORAR), bolas: [] };
  }
}
