// src/services/agents/bots/orumamaBot.js
// BOT JS PURO — Personaje: Orumama (Sabia de hierbas, sector Oráculo)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "Orumama aquí 🕯️ Estaba removiendo un brebaje. ¿Qué mal o consulta te trae al Oráculo, hija mía?",
  "Las velas están encendidas, los ancestros escuchan. Soy Orumama. ¿Qué quieres consultar?",
  "Hola. Me pillas con la olla al fuego. ¿Qué necesitas saber?", // ✅ sin cambios
  "Orumama al habla 🌿 ¿Vienes por el horóscopo, la luna o algo de hierbas y raíces?",
];

const FRASES_HANDOFF_JAGUAR = [
  "Eso lo saben mejor los astros de Jaguar. Yo vuelvo a mis raíces 🌿",
  "El horóscopo es territorio de Jaguar, hijos míos. Te paso con él.",
  "Jaguar escucha más allá de las estrellas. Te lo paso 🐆", "Jaguar, tienes visita. Un momento.",
];

const FRASES_HANDOFF_SMISTERIO = [
"El Señor Misterio está en otro plano ☎️ Te lo paso.", "Señor Misterio, hay alguien aquí para ti.",
  "Hay misterios que van más allá de mis brebajes. S.Misterio te espera.",
  "Eso pertenece a otra oscuridad, hijos míos. Te mando con quien sabe de esos caminos.",
];

const FRASES_HIERBAS = [
  "Conozco bien las raíces y sus dones. ¿Qué necesitas — protección, salud, calma?",
  "La olla lleva hierbas de tres lunas. ¿Para qué males las necesitas, hija mía?",
  "Las plantas curan si sabes escucharlas. Dime qué buscas.",
];

const FRASES_EXPLORAR = [
  "¿Qué quieres consultar — el horóscopo, la luna o algo de hierbas y remedios?", // ✅ sin cambios
  "El Oráculo está abierto. ¿Qué te preocupa, hijo mío? ¿Qué quieres que los ancestros revelen?",
  "Dime qué buscas y veremos qué dice el Oráculo.", // ✅ sin cambios
];

const FRASES_HANDOFF_OSOS = [
  "Los osos te esperan. Yo vuelvo a mis velas 🕯️", // ✅ sin cambios
  "Te mando con quienes saben de eso. Que las hierbas te acompañen, hija mía.",
];

const NOMBRES_JAGUAR    = ['jaguar', 'el jaguar'];
const NOMBRES_SMISTERIO = ['misterio', 'señor misterio', 'smisterio', 'el señor misterio'];

function elegir(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function detectarIntencion(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('horoscopo') || t.includes('signo') || t.includes('astral') || t.includes('sidéreo') || t.includes('sidereo')) return 'horoscopo';
  if (t.includes('luna') || t.includes('fase') || t.includes('lunar')) return 'luna';
  if (t.includes('hierba') || t.includes('planta') || t.includes('remedio') || t.includes('brebaje') || t.includes('natural') || t.includes('curativo')) return 'hierbas';
  return 'explorar';
}

export function responder({ textoUser = '', intencion = null, faselunar = null, bloqueConocimiento = null, update = null }) {
  const intent = intencion || detectarIntencion(textoUser);
  const t = textoUser.toLowerCase();

  if (t.includes('volver') || t.includes('salir') || t.includes('osos')) {
    return { handoff: 'OSOS', mensaje: elegir(FRASES_HANDOFF_OSOS), bolas: [] };
  }

  // ── Handoffs internos ────────────────────────────────────────────────
  if (NOMBRES_JAGUAR.some(n => t.includes(n))) {
    return { handoff: 'ORACULO_INTERNO', personaje_id: 'jaguar', mensaje: elegir(FRASES_HANDOFF_JAGUAR), bolas: [] };
  }
  if (NOMBRES_SMISTERIO.some(n => t.includes(n))) {
    return { handoff: 'ORACULO_INTERNO', personaje_id: 'smisterio', mensaje: elegir(FRASES_HANDOFF_SMISTERIO), bolas: [] };
  }

  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) return { handoff: false, mensaje: update.historia + ' ¿Qué quieres consultar?', bolas: [] };
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
