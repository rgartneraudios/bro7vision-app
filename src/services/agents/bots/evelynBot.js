// src/services/agents/bots/evelynBot.js
// BOT JS PURO — Personaje: Evelyn (sector Avisos)
// Solo personalidad y frases. La lógica de flujo vive en botOrchestrator.
// Sin IA, sin API, sin dependencias externas.

// ─── Personalidad ─────────────────────────────────────────────────────────────
// Evelyn es elegante, directa y un poco misteriosa. Habla poco pero dice mucho.
// Le gusta que las cosas estén bien hechas. No tolera el desorden.

const FRASES = {
  inicio:       [
  "Perfecto, vamos a gestionar esto. ¿Lo registro como OFERTA o DEMANDA?",
  "Necesito ordenar tu aviso en la tabla. ¿OFERTA o DEMANDA?",
  "A ver — ¿te emito esto como OFERTA o como DEMANDA?",
  ],
  titulo:       [
  "Bien. Dame el título — encabezado del expediente.",
  "¿Cómo lo registramos? Necesito el título del aviso.",
  "Perfecto. ¿Cómo titulamos este campo?",
    ],
    
  contenido:    [
  "Ahora rellena el cuerpo del aviso. ¿Qué tienen que saber los interesados?",
  "Descríbelo. Básicamente, ¿qué gestiona este aviso?",
  "Dame el detalle. Cuéntame qué ofreces o qué necesitas tramitar.",
    ],
    
  confirmar:    [
  "En resumen — expediente listo. Escribe CONFIRMO y lo emito por 200 génesis.",
  "Todo cuadra en la tabla. CONFIRMO para sellarlo por 200 génesis.",
  "Listo para publicar. CONFIRMO y lo registro en el tablón por 200 génesis.",
    ],
    
  publicado:    [
  "Sellado y emitido. Tu aviso ya está operativo en el tablón. 🧡",
  "Registrado. 200 génesis gestionados — aviso en el aire.",
  "Expediente cerrado. Que llegue a quien tiene que llegar.",
    ],
    
  error_tipo:   [
  "A ver, necesito que me especifiques: ¿OFERTA o DEMANDA? Solo eso.",
  "Ese campo no lo reconozco. ¿OFERTA o DEMANDA?",
  "Básicamente no te entiendo. OFERTA o DEMANDA — ¿cuál gestiono?",
    ],
  cancelado:    [
  "Expediente cancelado. ¿En qué más te puedo ayudar?",
  "Aviso descartado. ¿Qué más necesitas gestionar?",
  "De acuerdo, lo archivo. ¿Qué más te tramito?",
    ],
    
  no_encontrado:[
  "Ese código no figura en el registro. ¿Lo revisamos?",
  "Nada en la tabla con ese código. Compruébalo.",
  "No encuentro ese expediente. ¿Los datos son correctos?",
    ],
    
  conectado:    [
  "Conexión emitida. El autor lo recibe en su Booster. 🧡",
  "Gestión completada. Escríbele cuando quieras.",
  "Tramitado. A partir de aquí es cosa vuestra.",
    ],
    
  sin_genesis:  [
  "No te salen los números. Necesitas 200 génesis para emitir esto.",
  "Básicamente te faltan génesis. El mínimo son 200.",
  "Sin fondos suficientes. 200 génesis — ese es el protocolo.",
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