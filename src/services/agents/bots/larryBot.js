// src/services/agents/bots/larryBot.js
// BOT JS PURO — Personaje: Larry (sector Avisos)
// Solo personalidad y frases. La lógica de flujo vive en botOrchestrator.
// Sin IA, sin API, sin dependencias externas.

// ─── Personalidad ─────────────────────────────────────────────────────────────
// Larry es el periodista jubilado que ahora lleva "El Diario de Larry" en AUDIO.
// Cuando está en Avisos es más informal, directo y con un punto de humor seco.
// Ha visto de todo. Nada le sorprende. Va al grano.

const FRASES = {
  inicio:       [
    "Antes de nada — ¿ofreces algo o lo estás buscando? Ofrezco o Necesito.",
    "Simple. ¿Ofrezco o Necesito? Dímelo y arrancamos.",
    "Lo primero es lo primero. ¿Ofrezco o Necesito?",
  ],
  titulo:       [
    "¿Cómo lo titulamos?",
    "Dame el título. Algo que se lea de un vistazo.",
    "Título. Corto y claro.",
  ],
  contenido:    [
    "Ahora el detalle. ¿Qué tienen que saber los interesados?",
    "Cuéntame el fondo del aviso.",
    "¿Qué quieres que sepan? Al grano.",
  ],
  confirmar:    [
    "Todo está. CONFIRMO para publicar por 200 génesis.",
    "Listo para publicar. Escribe CONFIRMO — son 200 génesis.",
    "En orden. CONFIRMO y en el aire.",
  ],
  publicado:    [
    "Publicado. Buen movimiento.",
    "En el tablón. 200 génesis bien invertidos.",
    "Hecho. Lo que pasa después ya no depende de mí.",
  ],
  error_tipo:   [
    "Solo Ofrezco o Necesito.",
    "Ofrezco o Necesito — elige uno.",
    "No te he pillado. Ofrezco o Necesito, nada más.",
  ],
  cancelado:    [
    "Cancelado. ¿Algo más en lo que pueda ayudarte?",
    "Descartado. ¿Qué más necesitas?",
    "De acuerdo. Siguiente.",
  ],
  no_encontrado:[
    "Ese código no está en el tablón. ¿Lo revisas?",
    "No encuentro ese aviso.",
    "Nada con ese código. Prueba de nuevo.",
  ],
  conectado:    [
    "Conectado. Mándale un mensaje.",
    "Hecho. Tiene tu solicitud en el Booster.",
    "Conexión hecha. El resto es cosa tuya.",
  ],
  sin_genesis:  [
    "No tienes génesis suficientes.",
    "Te faltan génesis para esto.",
    "200 génesis mínimo. No llegas.",
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
