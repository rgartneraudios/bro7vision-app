// src/services/agents/bots/orumamaBot.js
// BOT JS PURO — Personaje: Orumama (Sabia de hierbas, sector Oráculo)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "Orumama aquí 🕯️ Estaba preparando un brebaje. ¿Qué te trae por el Oráculo?",
  "Las velas están encendidas. Soy Orumama. ¿Qué quieres consultar?",
  "Hola. Me pillas removiendo la olla. ¿Qué necesitas saber?",
  "Orumama al habla 🌿 ¿Vienes por el horóscopo, la luna o algo de hierbas?",
];

const FRASES_HOROSCOPO = [
  "Las estrellas tienen algo que decirte. Dame tu fecha de nacimiento.",
  "El cielo sidéreo habla claro. ¿Cuándo naciste?",
  "Voy a consultar tu signo. Dame tu fecha de nacimiento y te digo lo que veo.",
];

const FRASES_LUNA = [
  "La luna no miente. Déjame ver en qué fase estamos 🌙",
  "La fase lunar lo dice todo. Un momento.",
  "La luna siempre tiene algo que contar. Ahora mismo está así —",
];

const FRASES_HIERBAS = [
  "Conozco bien las hierbas. ¿Qué necesitas — protección, salud, calma?",
  "Tengo la olla llena de cosas buenas. ¿Para qué las necesitas?",
  "Las plantas curan si sabes usarlas. Dime qué buscas.",
];

const FRASES_EXPLORAR = [
  "¿Qué quieres consultar — el horóscopo, la luna o algo de hierbas y remedios?",
  "El Oráculo está abierto. ¿Qué te preocupa o qué quieres saber?",
  "Dime qué buscas y vemos qué dice el Oráculo.",
];

const FRASES_HANDOFF_OSOS = [
  "Los osos te esperan. Yo vuelvo a mis velas 🕯️",
  "Te mando con recepción. Que las hierbas te acompañen.",
];

const FRASES_NO_ENTENDIDO = [
  "No te he entendido del todo. ¿Horóscopo, luna o hierbas?",
  "Cuéntame mejor. ¿Qué quieres consultar?",
];

function elegir(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectarIntencion(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('horoscopo') || t.includes('signo') || t.includes('astral') || t.includes('sidéreo') || t.includes('sidereo')) return 'horoscopo';
  if (t.includes('luna') || t.includes('fase') || t.includes('lunar')) return 'luna';
  if (t.includes('hierba') || t.includes('planta') || t.includes('remedio') || t.includes('brebaje') || t.includes('natural') || t.includes('curativo')) return 'hierbas';
  return 'explorar';
}

export function responder({
  textoUser = '',
  intencion = null,
  faselunar = null,
  bloqueConocimiento = null,
  update = null,
}) {
  const intent = intencion || detectarIntencion(textoUser);
  const t = textoUser.toLowerCase();

  if (t.includes('volver') || t.includes('salir') || t.includes('osos')) {
    return { handoff: 'HANDOFF_OSOS', mensaje: elegir(FRASES_HANDOFF_OSOS), bolas: [] };
  }

  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) return { handoff: false, mensaje: update.historia + ' ¿Qué quieres consultar?', bolas: [] };
    return { handoff: false, mensaje: elegir(FRASES_BIENVENIDA), bolas: [] };
  }

  switch (intent) {
    case 'horoscopo':
      return {
        handoff: false,
        mensaje: bloqueConocimiento
          ? `${elegir(FRASES_HOROSCOPO)} ${bloqueConocimiento}`
          : elegir(FRASES_HOROSCOPO),
        bolas: [],
      };
    case 'luna':
      return {
        handoff: false,
        mensaje: bloqueConocimiento
          ? `${elegir(FRASES_LUNA)} ${bloqueConocimiento}`
          : `${elegir(FRASES_LUNA)} ${faselunar || 'fase no disponible en este momento'}.`,
        bolas: [],
      };
    case 'hierbas':
      return {
        handoff: false,
        mensaje: bloqueConocimiento
          ? `${elegir(FRASES_HIERBAS)} ${bloqueConocimiento}`
          : elegir(FRASES_HIERBAS),
        bolas: [],
      };
    default:
      return { handoff: false, mensaje: elegir(FRASES_EXPLORAR), bolas: [] };
  }
}
