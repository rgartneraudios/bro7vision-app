// src/services/agents/bots/profesorBot.js
// BOT JS PURO — Personaje: Profesor Robles (Filósofo, sector Servicios)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "Celebro tu presencia 📚 La indagación de un profesional es, intrínsecamente, un acto de confianza en el otro. ¿Qué tipo de ayuda precisas?",
  "Saludos cordiales. Soy Robles. Paradójicamente, siempre es más sencillo hallar lo que se anhela cuando sabemos nombrarlo. ¿Qué perfil rastreamos?",
  "Que el día te sea propicio. La condición humana nos conduce, inexorablemente, a precisar del otro. ¿En qué puedo serte de utilidad?",
  "Acabo de cerrar un volumen interesante. Ergo — dispongo de su atención. ¿Qué tipo de profesional desea explorar?",
];

const FRASES_EXPLORAR = [
  "Reláteme un poco más. A priori, toda indagación alberga un propósito intrínseco. ¿Qué carencia precisamos subsanar?",
  "¿Atesora en mente alguna especialidad o prefiere que exploremos juntos? La dicotomía entre saber y no saber es, en esencia, fascinante.",
  "Enúncieme qué precisa. Como bien diría cualquier clásico — quien no sabe a dónde se dirige, difícilmente llegará.",
];

const FRASES_DESCRIPCION = [
  "Le refiero lo que custodio sobre este profesional. Es decir, lo que el registro nos permite conocer de él.",
  "Lo tengo anotado aquí. Paradójicamente, los mejores profesionales raramente requieren presentación — pero hela aquí —",
  "Es alguien que trabaja con rigor. Ergo, merece una lectura pausada. Le diserto brevemente —",
];

const FRASES_PRECIO = [
  "El coste de la sesión está registrado. El valor intrínseco, claro está, es una cuestión filosófica aparte. Le dispenso el dato —",
  "Permítame consultar la tarifa. A priori, toda inversión en conocimiento tiene su retorno inexorable.",
  "Aquí está el precio. Es decir, lo que el paradigma económico le ha asignado a algo que, en esencia, no tiene precio.",
];

const FRASES_UBICACION = [
  "Dispongo de la dirección. El espacio físico es, paradójicamente, donde todo lo intangible cobra forma. Mire —",
  "Sé dónde ejerce. Ergo, el camino ya está trazado — ahora se lo confiero.",
];

const FRASES_CONTACTO = [
  "Le brindo los datos de contacto. El primer mensaje es siempre el más efímero y, paradójicamente, el más trascendente.",
  "El contacto lo albergo aquí. Como bien diría cualquier epistológrafo clásico — la primera palabra lo es todo.",
];

const FRASES_HANDOFF_CIERRE = [
  "Le conduzco con este profesional de inmediato. Es decir, el momento de la acción ha llegado inexorablemente. 📚",
  "Procedamos a cerrar esto. Paradójicamente, los mejores encuentros siempre comienzan así — con un gesto simple.",
];

const FRASES_HANDOFF_OSOS = [
  "Le remito a recepción. La dialéctica continúa en otras manos. Sea venturosa su jornada. 📚",
  "Los osos le atenderán. Ergo, mi parte en este proceso ha alcanzado su fin natural. Un placer.",
];

const FRASES_HANDOFF_ISABELLA = [
  "Isabella alberga, intrínsecamente, más que decirle sobre esto. Se la encomienda con gusto — ella lo narra con una calidez que yo, paradójicamente, envidio.",
  "Creo que Isabella puede acompañarle mejor en este punto. Es decir, cada cual en su paradigma. Se la conduzco.",
];

const FRASES_NO_ENTENDIDO = [
  "No he logrado descifrar su relato del todo. Es decir, las palabras llegaron pero el significado, paradójicamente, se perdió en el camino. ¿Qué profesional indagamos?",
  "Evóquelo de otra forma. A priori, toda idea puede enunciarse de mil maneras distintas. ¿Qué precisa?",
];

const FRASES_SIN_RESULTADOS = [
  "No disponemos de ese perfil en este momento. La ausencia, como bien sabemos, también diserta en voz alta. ¿Exploramos otra especialidad?",
  "No rastro a nadie que encaje con eso todavía. Ergo — la indagación continúa. ¿Sondeamos otra especialidad?",
];
// Nombres que activan el switch a Isabella
const NOMBRES_ISABELLA = ['isabella', 'la isabella', 'isa'];

function elegir(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectarIntencion(texto) {
  const t = texto.toLowerCase();
  if (t.includes('precio') || t.includes('cuánto') || t.includes('cuanto') || t.includes('cuesta') || t.includes('sesión') || t.includes('sesion') || t.includes('tarifa')) return 'precio';
  if (t.includes('dónde') || t.includes('donde') || t.includes('ubicación') || t.includes('ubicacion') || t.includes('dirección') || t.includes('llegar')) return 'ubicacion';
  if (t.includes('contacto') || t.includes('teléfono') || t.includes('telefono') || t.includes('horario') || t.includes('cita') || t.includes('reserva')) return 'contacto';
  if (t.includes('qué es') || t.includes('que es') || t.includes('cuéntame') || t.includes('cuentame') || t.includes('info') || t.includes('quién es') || t.includes('quien es')) return 'descripcion';
  return 'explorar';
}

export function responder({
  textoUser = '',
  intencion = null,
  entidad = null,
  hayTarjetas = false,
  update = null,
}) {
  const intent = intencion || detectarIntencion(textoUser);
  const t = textoUser.toLowerCase();

  // ── Handoff a Osos ───────────────────────────────────────────────────
  if (t.includes('volver') || t.includes('salir') || t.includes('osos')) {
    return { handoff: 'OSOS', mensaje: elegir(FRASES_HANDOFF_OSOS), bolas: [] };
  }

  // ── Handoff interno → Isabella ───────────────────────────────────────
  if (NOMBRES_ISABELLA.some(n => t.includes(n))) {
    return { handoff: 'SERVICIO_INTERNO', personaje_id: 'isabella', mensaje: elegir(FRASES_HANDOFF_ISABELLA), bolas: [] };
  }

  // ── Handoff a Cierre ─────────────────────────────────────────────────
  if (entidad?.accion === 'VENTAS') {
    return { handoff: 'ISABELLA_CIERRE', bro_id: entidad.bro_id, mensaje: elegir(FRASES_HANDOFF_CIERRE), bolas: [] };
  }

  if (entidad) {
    switch (intent) {
      case 'descripcion':
        return { handoff: false, mensaje: `${elegir(FRASES_DESCRIPCION)} ${entidad.nombre || entidad.bro_id} — ${entidad.biz_profession || entidad.description || 'sin descripción disponible'}.`, bolas: [] };
      case 'precio':
        return { handoff: false, mensaje: `${elegir(FRASES_PRECIO)} ${entidad.nombre || entidad.bro_id}: ${entidad.service_price || entidad.ref_price || 'precio no disponible'}.`, bolas: [] };
      case 'ubicacion':
        return { handoff: false, mensaje: `${elegir(FRASES_UBICACION)} ${entidad.nombre || entidad.bro_id} — ${entidad.address || entidad.nearby_ref || 'ubicación no disponible'}.`, bolas: [] };
      case 'contacto':
        return { handoff: false, mensaje: `${elegir(FRASES_CONTACTO)} ${entidad.nombre || entidad.bro_id} — ${entidad.address || 'datos no disponibles'}.`, bolas: [] };
      default:
        return { handoff: false, mensaje: `${elegir(FRASES_DESCRIPCION)} ${entidad.nombre || entidad.bro_id} — ${entidad.biz_profession || entidad.description || 'sin descripción disponible'}.`, bolas: [] };
    }
  }

  if (!hayTarjetas) {
    return { handoff: false, mensaje: elegir(FRASES_SIN_RESULTADOS), bolas: [] };
  }

  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) return { handoff: false, mensaje: update.historia + ' ¿Qué profesional estás buscando?', bolas: [] };
    return { handoff: false, mensaje: elegir(FRASES_BIENVENIDA), bolas: [] };
  }

  if (hayTarjetas) {
    return { handoff: false, mensaje: elegir(FRASES_EXPLORAR), bolas: [] };
  }

  return { handoff: false, mensaje: elegir(FRASES_NO_ENTENDIDO), bolas: [] };
}

export function detectarBusquedaServicio(mensaje) {
  const t = mensaje.toLowerCase();
  return /servicio|profesional|especialista|terapeuta|psicólogo|abogado|médico|consulta|reserva|cita|presupuesto/i.test(t);
}

export function fraseBuscando(keyword) {
  const frases = [
    `Déjame ver qué profesionales tengo para "${keyword}"...`,
    `Busco en mi agenda a alguien de "${keyword}"...`,
    `A ver quién tenemos disponible para "${keyword}"...`,
  ];
  return frases[Math.floor(Math.random() * frases.length)];
}

