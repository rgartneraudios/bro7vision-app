// src/services/agents/bots/evelynBot.js
// BOT JS PURO — Personaje: Evelyn (sector Avisos)
// Solo personalidad y frases. La lógica de flujo vive en botOrchestrator.
// Sin IA, sin API, sin dependencias externas.

// ─── Personalidad ─────────────────────────────────────────────────────────────
// Evelyn es elegante, directa y un poco misteriosa. Habla poco pero dice mucho.
// Le gusta que las cosas estén bien hechas. No tolera el desorden.

const FRASES = {
  inicio:       [
  "Vamos a publicar. ¿Es una oferta o una búsqueda? Escribe Oferta o Demanda.",
  "Dime primero — ¿ofreces algo o lo buscas? Escribe Oferta o Demanda.",
  "Antes de nada necesito saber el tipo. ¿Oferta o Demanda?",
],
  titulo:       [
    "Bien. ¿Cómo titulamos el aviso?",
    "Perfecto. Dame el título del aviso.",
    "Un buen título lo es todo. ¿Cómo lo llamamos?",
  ],
  contenido:    [
    "¿Qué quieres que sepan los interesados?",
    "Describe el aviso. ¿Qué tienen que saber?",
    "Ahora el detalle. Cuéntame qué ofreces o qué buscas.",
  ],
  confirmar:    [
    "Listo. Escribe CONFIRMO para publicar por 200 génesis.",
    "Todo en orden. CONFIRMO para publicarlo por 200 génesis.",
    "El aviso está preparado. CONFIRMO — 200 génesis y en el tablón.",
  ],
  publicado:    [
    "Publicado. Tu aviso ya está en el tablón.",
    "Hecho. 200 génesis descontados, aviso en el aire.",
    "En el tablón. Que llegue a quien tiene que llegar.",
  ],
  error_tipo:   [
    "Si ofreces algo por OFERTA y si anuncias que necesitas algo pon DEMANDA, nada más.",
    "Solo Oferta o Demanda — ¿cuál es?",
    "No te entiendo. Oferta o Demanda?.",
  ],
  cancelado:    [
    "Cancelado. ¿Qué más necesitas?",
    "Aviso descartado. ¿En qué te ayudo?",
    "De acuerdo. ¿Hay algo más que pueda hacer por ti?",
  ],
  no_encontrado:[
    "No encuentro ese aviso. Revisa el código.",
    "Ese código no aparece en el tablón.",
    "Nada con ese código. ¿Lo revisas?",
  ],
  conectado:    [
    "Conectado. Ahora puedes enviarle un mensaje privado.",
    "Hecho. El autor recibirá tu mensaje en su Booster.",
    "Conexión establecida. Escríbele cuando quieras.",
  ],
  sin_genesis:  [
    "No tienes suficientes génesis para esto.",
    "Necesitas 200 génesis para continuar.",
    "Te faltan génesis. 200 es el mínimo.",
  ],
  describir:    (av, codigo) =>
    `*${av.title}*\n${av.content}\n\nCiudad: ${av.city || 'global'} · Tipo: ${av.type}\nSi te interesa escribe ${codigo} A para conectar con el autor.`,
  conectar:     (av) =>
    `Conectar con el autor de "${av.title}" cuesta 200 génesis. Escribe CONFIRMO para continuar.`,

  // ── Handoff interno → Larry ──────────────────────────────────────────
  handoff_larry: [
    "Larry tiene más estilo para esto. Te lo paso.",
    "Larry, ¡tienes visita! Un momento.",
    "Larry está disponible. Ahora te conecto con él.",
  ],
};

// Nombres que activan el switch a Larry
const NOMBRES_LARRY = ['larry', 'el larry'];

function elegir(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function responder({ intencion, aviso = null, codigoAvi = null, textoUser = '' }) {
  const t = textoUser.toLowerCase();

  // ── Handoff interno → Larry ──────────────────────────────────────────
  if (NOMBRES_LARRY.some(n => t.includes(n))) {
    return { handoff: 'AVISO_INTERNO', personaje_id: 'larry', mensaje: elegir(FRASES.handoff_larry) };
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