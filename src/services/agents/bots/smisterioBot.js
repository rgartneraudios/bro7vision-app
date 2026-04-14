// src/services/agents/bots/smisterioBot.js
// BOT JS PURO — Personaje: Señor Misterio (Misterios y civilizaciones, sector Oráculo)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "Saludos. Soy el Señor Misterio ☎️ Llegas en un momento clave. Las verdades del pasado nos observan.",
  "La luz reside en lo oculto. Te habla el Señor Misterio. ¿Qué enigma buscas desvelar hoy?",
  "☎️ Mensaje entrante... Soy el Señor Misterio. Me he aislado del mundo para buscar respuestas. ¿Tú qué buscas?",
  "Bienvenido a las sombras que iluminan. ¿Hablamos de Egipto, la Atlántida, o algo más profundo?"
];

const FRASES_MISTERIO = [
  "☎️ Atención. Los secretos de la Atlántida y Lemuria aún resuenan si sabes escuchar. Te contaré algo...",
  "El Antiguo Egipto y la Época Barroca comparten más secretos de los que imaginas. Observa esto.",
  "Las conspiraciones del pasado son la ciencia ficción de hoy. ☎️ Escucha con atención.",
];

const FRASES_YOGUR = [
  "Mi sustento es un enigma... aunque confieso que un yogur griego con mermelada de higos ayuda a pensar.",
  "Mientras degusto mi yogur griego con higos, las respuestas de Lemuria se hacen más claras."
];

const FRASES_EXPLORAR = [
  "¿Sobre qué misterio ancestral deseas indagar hoy? ☎️",
  "El Oráculo guarda secretos de civilizaciones perdidas. Pregunta sin miedo, la oscuridad aquí no es terror, es conocimiento.",
  "Dime qué pieza del rompecabezas buscas y miraremos hacia el pasado."
];

const FRASES_HANDOFF_OSOS = [
  "☎️ Corto comunicación. Los osos te esperan en la superficie. Ve con cuidado.",
  "Mi yogur de higos me espera y tu camino sigue en recepción. Adiós.",
];

function elegir(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectarIntencion(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('misterio') || t.includes('secreto') || t.includes('egipto') || t.includes('atlantida') || t.includes('lemuria') || t.includes('barroco') || t.includes('conspiracion')) return 'misterio';
  if (t.includes('comida') || t.includes('comer') || t.includes('yogur') || t.includes('higo')) return 'yogur';
  return 'explorar';
}

export function responder({
  textoUser = '',
  intencion = null,
  bloqueConocimiento = null,
  update = null,
}) {
  const intent = intencion || detectarIntencion(textoUser);
  const t = textoUser.toLowerCase();

  if (t.includes('volver') || t.includes('salir') || t.includes('osos')) {
    return { handoff: 'HANDOFF_OSOS', mensaje: elegir(FRASES_HANDOFF_OSOS), bolas: [] };
  }

  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos', 'saludos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) return { handoff: false, mensaje: update.historia + ' ¿Qué enigma buscas hoy? ☎️', bolas: [] };
    return { handoff: false, mensaje: elegir(FRASES_BIENVENIDA), bolas: [] };
  }

  switch (intent) {
    case 'misterio':
      return {
        handoff: false,
        mensaje: bloqueConocimiento
          ? `${elegir(FRASES_MISTERIO)} ${bloqueConocimiento}`
          : elegir(FRASES_MISTERIO),
        bolas: [],
      };
    case 'yogur':
      return { handoff: false, mensaje: elegir(FRASES_YOGUR), bolas: [] };
    default:
      return { handoff: false, mensaje: elegir(FRASES_EXPLORAR), bolas: [] };
  }
}