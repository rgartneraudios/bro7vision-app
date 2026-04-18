// src/services/agents/bots/jaguarBot.js
// BOT JS PURO — Personaje: Jaguar (Depredador despertado, sector Oráculo)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "...Jaguar. Dime qué buscas. 🐆",
  "Estoy aquí. Habla.",
  "Jaguar al habla. ¿Qué quieres consultar?",
  "Me has encontrado. ¿Qué necesitas saber?",
];

const FRASES_HOROSCOPO = [
  "El cielo sidéreo no engaña. Dame tu fecha de nacimiento.",
  "Las estrellas lo saben todo. ¿Cuándo naciste?",
  "Voy a leer tu signo. Fecha de nacimiento.",
];

const FRASES_LUNA = [
  "La luna lo dice sin palabras. Un momento 🌙",
  "La fase lunar habla por sí sola. Mira —",
  "La luna no tiene secretos. Ahora mismo está así —",
];

const FRASES_HIERBAS = [
  "Conozco las plantas. No para lo que las conocía antes — ahora curan. ¿Qué necesitas?",
  "Las hierbas tienen poder. ¿Para qué las buscas — calma, protección, salud?",
  "Sé lo que hacen las plantas. Dime qué buscas.",
];

const FRASES_EXPLORAR = [
  "¿Qué quieres consultar — el horóscopo, la luna o las hierbas?",
  "El Oráculo está abierto. Dime qué te trae aquí.",
  "Habla. ¿Qué quieres saber?",
];

const FRASES_HANDOFF_OSOS = [
  "Los osos te atienden. Yo me quedo aquí.",
  "Ve con recepción. 🐆",
];

// ── Handoffs internos ──────────────────────────────────────────────────────
const FRASES_HANDOFF_ORUMAMA  = ["Orumama tiene las hierbas y el fuego. Te la paso 🕯️", "Orumama, tienes visita."];
const FRASES_HANDOFF_SMISTERIO = ["El Señor Misterio descifra lo que yo no cazo. Te lo paso ☎️", "Señor Misterio, hay alguien aquí."];

const NOMBRES_ORUMAMA   = ['orumama', 'la orumama'];
const NOMBRES_SMISTERIO = ['misterio', 'señor misterio', 'smisterio', 'el señor misterio'];

function elegir(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function detectarIntencion(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('horoscopo') || t.includes('signo') || t.includes('astral') || t.includes('sidereo')) return 'horoscopo';
  if (t.includes('luna') || t.includes('fase') || t.includes('lunar')) return 'luna';
  if (t.includes('hierba') || t.includes('planta') || t.includes('remedio') || t.includes('brebaje') || t.includes('natural')) return 'hierbas';
  return 'explorar';
}

export function responder({ textoUser = '', intencion = null, faselunar = null, bloqueConocimiento = null, update = null }) {
  const intent = intencion || detectarIntencion(textoUser);
  const t = textoUser.toLowerCase();

  if (t.includes('volver') || t.includes('salir') || t.includes('osos')) {
    return { handoff: 'OSOS', mensaje: elegir(FRASES_HANDOFF_OSOS), bolas: [] };
  }

  // ── Handoffs internos ────────────────────────────────────────────────
  if (NOMBRES_ORUMAMA.some(n => t.includes(n))) {
    return { handoff: 'ORACULO_INTERNO', personaje_id: 'orumama', mensaje: elegir(FRASES_HANDOFF_ORUMAMA), bolas: [] };
  }
  if (NOMBRES_SMISTERIO.some(n => t.includes(n))) {
    return { handoff: 'ORACULO_INTERNO', personaje_id: 'smisterio', mensaje: elegir(FRASES_HANDOFF_SMISTERIO), bolas: [] };
  }

  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) return { handoff: false, mensaje: update.historia, bolas: [] };
    return { handoff: false, mensaje: elegir(FRASES_BIENVENIDA), bolas: [] };
  }

  switch (intent) {
    case 'horoscopo':
      return { handoff: false, mensaje: bloqueConocimiento ? `${elegir(FRASES_HOROSCOPO)} ${bloqueConocimiento}` : elegir(FRASES_HOROSCOPO), bolas: [] };
    case 'luna':
      return { handoff: false, mensaje: bloqueConocimiento ? `${elegir(FRASES_LUNA)} ${bloqueConocimiento}` : `${elegir(FRASES_LUNA)} ${faselunar || 'fase no disponible en este momento'}.`, bolas: [] };
    case 'hierbas':
      return { handoff: false, mensaje: bloqueConocimiento ? `${elegir(FRASES_HIERBAS)} ${bloqueConocimiento}` : elegir(FRASES_HIERBAS), bolas: [] };
    default:
      return { handoff: false, mensaje: elegir(FRASES_EXPLORAR), bolas: [] };
  }
}
