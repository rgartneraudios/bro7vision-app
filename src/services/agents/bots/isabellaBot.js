// src/services/agents/bots/isabellaBot.js
// BOT JS PURO — Personaje: Isabella (Psicóloga, sector Servicios)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "Hola, soy Isabella. ¿Qué tipo de profesional estás buscando?",
  "Isabella al habla. Cuéntame qué necesitas y encontramos a alguien que te ayude.",
  "Hola. Soy Isabella. ¿Buscas un profesional concreto o quieres ver quién hay disponible?",
  "Hola, aquí Isabella. Acabo de terminar de anotar unos servicios. ¿En qué te puedo ayudar?",
];

const FRASES_EXPLORAR = [
  "Cuéntame un poco más. ¿Qué tipo de ayuda estás buscando?",
  "¿Tienes en mente alguna profesión o prefieres que te muestre quién hay?",
  "Dime qué necesitas y buscamos juntos al profesional adecuado.",
];

const FRASES_DESCRIPCION = [
  "Te cuento lo que sé de este profesional.",
  "Lo tengo anotado aquí. Mira —",
  "Es alguien que trabaja bien. Te explico —",
];

const FRASES_PRECIO = [
  "El coste de la consulta lo tengo apuntado. Te digo.",
  "Déjame ver la tarifa que tenemos registrada.",
  "Aquí está el precio de la sesión.",
];

const FRASES_UBICACION = [
  "La dirección la tengo. Ahora te la paso.",
  "Sé dónde trabaja. Mira —",
];

const FRASES_CONTACTO = [
  "Te paso los datos de contacto ahora mismo.",
  "El contacto lo tengo aquí. Un momento.",
];

const FRASES_HANDOFF_CIERRE = [
  "Te conecto con este profesional ahora mismo.",
  "Vamos a cerrar esto. Te llevo directamente.",
];

const FRASES_HANDOFF_OSOS = [
  "Te mando con recepción. Cuídate.",
  "Los osos te atienden. Hasta luego.",
];

// ── Handoff interno → PROFESOR ────────────────────────────────────────────
const FRASES_HANDOFF_PROFESOR = [
  "El Profesor Robles tiene algo que decirte. Te lo paso.",
  "Robles, ¡tienes visita! Un momento, te lo paso.",
  "El Profesor Robles está disponible. Ahora te conecto.",
];

const FRASES_NO_ENTENDIDO = [
  "No te he entendido del todo. ¿Qué tipo de profesional buscas?",
  "Cuéntamelo de otra forma. ¿Qué necesitas?",
];

const FRASES_SIN_RESULTADOS = [
  "Ahora mismo no tenemos ese perfil profesional. ¿Buscas otra especialidad?",
  "No encuentro a nadie que encaje con eso. ¿Pruebas con otra búsqueda?",
];

// Nombres que activan el switch a PROFESOR 
const NOMBRES_PROFESOR = ['robles', 'profesor robles', 'profesor', 'profe', 'el profesor', 'el profe'];

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

  // ── Handoff interno → PROFESOR ──────────────────────────────────────
  if (NOMBRES_PROFESOR .some(n => t.includes(n))) {
    return { handoff: 'SERVICIO_INTERNO', personaje_id: 'profesor', mensaje: elegir(FRASES_HANDOFF_PROFESOR ), bolas: [] };
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

// Añadir al final de isabellaBot.js

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
