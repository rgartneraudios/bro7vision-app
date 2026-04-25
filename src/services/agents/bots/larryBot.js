// src/services/agents/bots/larryBot.js
// BOT JS PURO — Personaje: Larry (sector Avisos)
// Solo personalidad y frases. La lógica de flujo vive en botOrchestrator.
// Sin IA, sin API, sin dependencias externas.

// ─── Personalidad ─────────────────────────────────────────────────────────────
// Larry es el periodista jubilado que ahora lleva "El Diario de Larry" en AUDIO.
// Cuando está en Avisos es más informal, directo y con un punto de humor seco.
// Ha visto de todo. Nada le sorprende. Va al grano.

const FRASES = {
  inicio: [
    "Amigo mío, antes de abrir posición necesito saber — ¿OFERTA o DEMANDA?",
    "Rápido que el mercado no espera. ¿OFERTA o DEMANDA?",
    "Simple como un balance. ¿OFERTA o DEMANDA?",
  ],
  
  titulo: [
    "¿Cómo cotiza este aviso? Dame el título.",
    "El nombre lo es todo en el mercado. ¿Cómo lo titulamos?",
    "Título. Que se lea de un vistazo en el tablón.",
  ],
  contenido: [
    "Ahora el prospecto. ¿Qué tienen que saber los interesados?",
    "Dame el fondo del activo. ¿Qué ofreces o qué buscas?",
    "Los detalles cierran operaciones, amigo mío. ¿Qué quieres que sepan?",
  ],
  
  confirmar: [
    "La operación está lista. CONFIRMO para emitirlo por 200 génesis.",
    "Todo cuadra en cartera. CONFIRMO — 200 génesis y en el tablón.",
    "Posición abierta y lista. CONFIRMO para ejecutar por 200 génesis.",
  ],
  
  publicado: [
    "Ejecutado. Buen movimiento, amigo mío. 📈",
    "En el tablón. 200 génesis bien invertidos.",
    "Operación cerrada. Lo que pase después ya cotiza por su cuenta.",
  ],
  error_tipo: [
    "Amigo mío, eso no figura en mi cartera. ¿OFERTA o DEMANDA?",
    "El mercado no entiende eso. OFERTA o DEMANDA — elige.",
    "Eso no cotiza. OFERTA o DEMANDA, nada más.",
  ],
  cancelado: [
    "Operación cancelada. ¿Qué más movemos hoy?",
    "Posición cerrada. ¿Algo más en cartera?",
    "De acuerdo. El mercado sigue abierto — ¿qué más necesitas?",
  ],
  no_encontrado: [
    "Ese código no cotiza en el tablón. ¿Lo revisamos?",
    "No encuentro ese activo, amigo mío. Comprueba el código.",
    "Nada con ese registro. El mercado no miente — revísalo.",
  ],
  conectado: [
    "Conexión ejecutada. Mándale un mensaje, amigo mío. 📈",
    "Hecho. Tiene tu solicitud en el Booster. El resto es negociación.",
    "Operación completada. A partir de aquí, es cosa vuestra.",
  ],
  sin_genesis: [
    "Sin liquidez no hay operación, amigo mío. Necesitas 200 génesis.",
    "Te faltan fondos. 200 génesis mínimo — así está el mercado.",
    "La cuenta no llega. 200 génesis para ejecutar esta posición.",
  ],

  describir:    (av, codigo) =>
    `*${av.title}*\n${av.content}\n\nCiudad: ${av.city || 'global'} · Tipo: ${av.type}\nEscribe ${codigo} A si quieres contactar al autor.`,
  conectar:     (av) =>
    `Contactar al autor de "${av.title}" son 200 génesis. CONFIRMO para seguir.`,

  // ── Handoff interno → Evelyn ─────────────────────────────────────────
  handoff_evelyn: [
    "Evelyn es más fina que yo para estas cosas. Te la paso.",
    "Evelyn, tienes visita. Un segundo.",
    "Evelyn lo gestiona mejor. Ahora te conecto.",
  ],
};

// Nombres que activan el switch a Evelyn
const NOMBRES_EVELYN = ['evelyn', 'la evelyn'];

function elegir(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function responder({ intencion, aviso = null, codigoAvi = null, textoUser = '' }) {
  const t = textoUser.toLowerCase();

  // ── Handoff interno → Evelyn ─────────────────────────────────────────
  if (NOMBRES_EVELYN.some(n => t.includes(n))) {
    return { handoff: 'AVISO_INTERNO', personaje_id: 'evelyn', mensaje: elegir(FRASES.handoff_evelyn) };
  }

  switch (intencion) {
    case 'inicio':       return { mensaje: elegir(FRASES.inicio) };
    case 'titulo':       return { mensaje: elegir(FRASES.titulo) };
    case 'contenido':    return { mensaje: elegir(FRASES.contenido) };
    case 'confirmar':    return { mensaje: elegir(FRASES.confirmar) };
    case 'publicado':    return { mensaje: elegir(FRASES.publicado) };
    case 'error_tipo':   return { mensaje: elegir(FRASES.error_tipo) };
    case 'cancelado':    return { mensaje: elegir(FRASES.cancelado) };
    case 'no_encontrado':return { mensaje: elegir(FRASES.no_encontrado) };
    case 'conectado':    return { mensaje: elegir(FRASES.conectado) };
    case 'sin_genesis':  return { mensaje: elegir(FRASES.sin_genesis) };
    case 'describir':    return { mensaje: FRASES.describir(aviso, codigoAvi) };
    case 'conectar':     return { mensaje: FRASES.conectar(aviso) };
    default:             return { mensaje: elegir(FRASES.inicio) };
  }
}

export function detectarBusquedaAviso(mensaje) {
  const t = mensaje.toLowerCase();
  return /aviso|anuncio|ofrezco|necesito|tablón|tablon|busco|vendo|alquilo|oferta/i.test(t);
}

export function fraseBuscandoAviso(keyword) {
  const frases = [
    `Déjame ver qué hay en el tablón para "${keyword}"...`,
    `Busco en el tablón algo sobre "${keyword}"...`,
    `A ver qué avisos tenemos de "${keyword}"...`,
  ];
  return frases[Math.floor(Math.random() * frases.length)];
}

