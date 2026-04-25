// src/services/agents/bots/jaguarBot.js
// BOT JS PURO — Personaje: Jaguar (Depredador despertado, sector Oráculo)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "...Jaguar. El cosmos te ha traído aquí. ¿Qué buscas, hermano? 🐯",
  "Estoy aquí. El universo me lo anunció. Habla.",
  "Jaguar al habla. ¿Qué frecuencia te trae al Oráculo?",
  "Me has encontrado. Siento que no es casualidad. ¿Qué necesitas saber?",
];

const FRASES_HOROSCOPO = [
  "El cielo sidéreo no engaña, hermanos. Dame tu fecha de nacimiento.",
  "Las constelaciones lo saben todo. ¿Cuándo llegaste a esta dimensión?",
  "Voy a leer tu aura astral. Fecha de nacimiento.",
];

const FRASES_LUNA = [
  "La luna vibra sin palabras. Un momento 🌙",
  "La fase lunar alinea las almas. Mira —",
  "La luna no oculta su frecuencia. Ahora mismo está así —",
];

const FRASES_HANDOFF_ORUMAMA = [
  "Orumama conoce los secretos de la tierra, hermanos. Yo leo los astros — ella escucha las raíces. Te paso con ella 🌿",
  "Eso vibra en otra frecuencia. Orumama te espera.",
  "Las hierbas no son mi portal. Ve con Orumama, ella sabe.",
  "Orumama tiene las hierbas y el fuego. Te la paso 🕯️",
];

const FRASES_HANDOFF_SMISTERIO = [
  "El cosmos me lo ha revelado — eso que buscas pertenece a S.Misterio. Su dimensión es otra.",
  "Siento que... eso está más allá de los astros. S.Misterio te guiará, hermano.",
  "Hay frecuencias que ni el universo me deja tocar. Ve con S.Misterio.",
];

const FRASES_HANDOFF_OSOS = [
  "Los osos operan en otra dimensión, hermano. Te paso con ellos.",
  "Eso no es cósmico — es terrenal. Ve con recepción. 🐯",
];


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
