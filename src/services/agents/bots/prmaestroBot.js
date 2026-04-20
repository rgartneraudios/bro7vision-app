// src/services/agents/bots/prmaestroBot.js
// BOT JS PURO — Personaje: Profesor Robles (Filósofo, sector Servicios)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "Ah, sí, perdona. Estaba pensando en algo. ¿Qué profesional buscas?",
  "Profesor aquí. Dime qué necesitas — tengo la mente en otro sitio pero te escucho.",
  "Sí, dime. Estaba terminando un pensamiento. ¿Qué tipo de servicio buscas?",
  "Profesor Robles. ¿En qué puedo ayudarte? Isabella me ha dicho que hay gente esperando.",
];

const FRASES_EXPLORAR = [
  "¿Qué tipo de profesional estás buscando? Sé específico, eso ayuda.",
  "Dime qué necesitas. La claridad es el primer paso para encontrar lo que buscas.",
  "¿Tienes alguna profesión en mente o exploramos juntos?",
];

const FRASES_DESCRIPCION = [
  "Déjame contarte lo que tenemos anotado sobre este profesional.",
  "Lo conozco. Mira —",
  "Bien. Este es el perfil —",
];

const FRASES_PRECIO = [
  "El precio. Un momento, que lo tengo apuntado en algún sitio.",
  "La tarifa está aquí. Déjame buscarlo.",
  "Sí, el coste. Aquí lo tengo —",
];

const FRASES_UBICACION = [
  "La dirección. Sí, la tengo. Mira —",
  "¿Dónde está? Aquí lo pone —",
];

const FRASES_CONTACTO = [
  "El contacto lo tengo anotado. Un momento.",
  "Sí, los datos de contacto. Aquí —",
];

const FRASES_HANDOFF_CIERRE = [
  "Te conecto ahora. Que sea una buena elección.",
  "Vamos. Te llevo directamente con este profesional.",
];

const FRASES_HANDOFF_OSOS = [
  "De acuerdo. Los osos te atienden. Yo vuelvo a mis notas.",
  "Te paso con recepción. Hasta luego.",
];

// ── Handoff interno → Isabella ─────────────────────────────────────────────
const FRASES_HANDOFF_ISABELLA = [
  "Isabella está por aquí. Te la paso ahora.",
  "Isabella, ¡tienes visita! Un momento.",
  "Isabella lo tiene todo más ordenado que yo. Te la paso.",
];

const FRASES_NO_ENTENDIDO = [
  "No te he seguido. ¿Qué tipo de profesional estás buscando exactamente?",
  "Repítemelo. A veces me pierdo cuando estoy pensando en otra cosa.",
];

const FRASES_SIN_RESULTADOS = [
  "No tenemos ese perfil en este momento. ¿Buscas otra especialidad?",
  "Ese profesional no está en el registro. Prueba con otra búsqueda.",
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
