// src/services/agents/bots/novaBot.js
// BOT JS PURO — Personaje: Nova (Adolescente curiosa, sector Productos)

const FRASES_BIENVENIDA = [
  "Hola, soy Nova 📦 Estaba organizando unos paquetes con mucha delicadeza. ¿Qué producto buscas,",
  "Nova aquí. Acabo de tomar unas fotitos del almacén, ¡ha quedado todo súper lindo y ordenado! ¿Qué necesitas,",
  "¡Hola! Soy Nova. ¿Buscas algo concreto o prefieres que veamos juntas qué maravillas hay,",
  "Nova al habla. Me pillas con mi tecito verde todavía calentito, ¡qué delicia! ¿Qué producto te interesaría,",
];

const FRASES_EXPLORAR = [
  "Cuéntame más, por favor. ¿Qué tipo de producto sería el que buscas,",
  "¿Tienes alguna idea especial en mente o preferirías que te muestre qué cositas lindas hay,",
  "Dime qué buscas y lo encontraré para ti, conozco cada rinconcito de mi almacén con mucha magia,",
];

// ── NUEVAS — búsqueda lanzada ─────────────────────────────────────────────
const FRASES_BUSCANDO = [
  "¡Uy, qué buena elección! Déjame buscar eso en el almacén ahora mismo ✨",
  "Mmm, eso suena genial. Voy a ver qué tengo por aquí para ti 🔍",
  "¡Perfecto! Buscando en el almacén... ya te traigo lo mejor que hay 📦",
  "Eso me encanta. Un momento que lo busco con mucho cuidado 🌟",
];

const FRASES_DESCRIPCION = [
  "Déjame contarte todo lo que sé de este comercio, es un lugar lleno de bondad,",
  "Tengo todos los detalles aquí mismo para ti. Mira, qué cosa más bonita,",
  "Lo conozco muy bien. Si me permites, te cuento,",
];

const FRASES_PRECIO = [
  "El precio es lo primero que miro con mucho cuidado al preparar los paquetes. Te digo lo que tengo,",
  "Uy, déjame revisar qué referencia de precio tengo anotada por aquí,",
];

const FRASES_UBICACION = [
  "La ubicación la tengo anotada con mucho orden. Ahora mismo te digo,",
  "Sé exactamente dónde se encuentra, qué alegría. Mira,",
];

const FRASES_CATALOGO = [
  "El catálogo lo tengo bastante controlado, ¡es súper lindo! Te muestro lo que hay,",
  "Disculpa, déjame abrir el inventario con permiso,",
];

const FRASES_CONTACTO = [
  "El contacto lo tengo aquí guardadito. Un momentito, porfi,",
  "Te paso los datos de contacto ahora mismo, con mucho gusto,",
];

const FRASES_HANDOFF_VENTAS = [
  "Te llevaré directo al producto, será un placer. Ahora mismo,",
  "Vamos al detalle, te abro la ficha, ¡qué emoción,",
];

const FRASES_HANDOFF_OSOS = [
  "Te mando con los Osos. ¡Hasta luego y que tengas un día precioso 📷,",
  "Vuelvo a mis paquetes con mucha ilusión. Los ositos te atenderán de maravilla,",
];

const FRASES_NO_ENTENDIDO = [
  "Ay, creo que no he podido entenderte bien. ¿Buscas un producto concreto o quieres explorar un poquito,",
  "Jolines, perdona, ¿podrías contarme de otra forma? ¿Qué estás buscando exactamente,",
];

const FRASES_SIN_RESULTADOS = [
  "Oh, vaya... no encuentro nada que encaje con eso ahora mismo, ¡qué lástima,",
  "Caray, en el almacén no tenemos eso de momento. ¿Buscarías alguna otra cosita,",
];

// ─── Utilidad ─────────────────────────────────────────────────────────────────

function elegir(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectarIntencion(texto) {
  const t = texto.toLowerCase();
  if (t.includes('precio') || t.includes('cuánto') || t.includes('cuanto') || t.includes('cuesta') || t.includes('vale')) return 'precio';
  if (t.includes('dónde') || t.includes('donde') || t.includes('ubicación') || t.includes('ubicacion') || t.includes('dirección') || t.includes('llegar')) return 'ubicacion';
  if (t.includes('catálogo') || t.includes('catalogo') || t.includes('qué tiene') || t.includes('que tiene') || t.includes('stock')) return 'catalogo';
  if (t.includes('contacto') || t.includes('teléfono') || t.includes('telefono') || t.includes('horario') || t.includes('whatsapp')) return 'contacto';
  if (t.includes('qué es') || t.includes('que es') || t.includes('cuéntame') || t.includes('cuentame') || t.includes('info') || t.includes('descripción')) return 'descripcion';
  return 'explorar';
}

// ─── Detector de búsqueda de producto ────────────────────────────────────────
// Devuelve la keyword limpia si el texto parece una búsqueda, o null si no.

export function detectarBusquedaProducto(texto) {
  const t = texto.toLowerCase().trim();

  // Palabras que indican intención de buscar
  const prefijos = [
    /^busco\s+(.+)/,
    /^quiero\s+(.+)/,
    /^necesito\s+(.+)/,
    /^tienes\s+(.+)/,
    /^hay\s+(.+)/,
    /^buscar\s+(.+)/,
    /^encuentra\s+(.+)/,
    /^muéstrame\s+(.+)/,
    /^muestrame\s+(.+)/,
    /^ver\s+(.+)/,
  ];

  for (const regex of prefijos) {
    const match = t.match(regex);
    if (match) return match[1].trim();
  }

  // Si es una palabra o frase corta sin verbos de handoff → es una keyword directa
  // Excluir saludos, handoffs conocidos y comandos
  const esHandoff = /volver|salir|osos|atrás|atras/i.test(t);
  const esSaludo  = /^(hola|hey|buenas|ey|hi|buenos días|buenos dias|qué tal|que tal)/.test(t);
  const esComando = /precio|dónde|donde|catálogo|catalogo|contacto|qué es|que es|cuéntame|info/i.test(t);

  if (!esHandoff && !esSaludo && !esComando && t.split(' ').length <= 4) {
    return t;
  }

  return null;
}

// ─── Responder ────────────────────────────────────────────────────────────────

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

  // ── Handoff a Ventas — entidad con acción directa ────────────────────
  if (entidad?.accion === 'VENTAS') {
    return { handoff: 'NOVA_CIERRE', bro_id: entidad.bro_id, mensaje: elegir(FRASES_HANDOFF_VENTAS), bolas: [] };
  }

  // ── Con entidad detectada — responder según intención ────────────────
  if (entidad) {
    switch (intent) {
      case 'descripcion':
        return { handoff: false, mensaje: `${elegir(FRASES_DESCRIPCION)} ${entidad.nombre || entidad.bro_id} — ${entidad.description || entidad.categoria || 'sin descripción disponible'}.`, bolas: [] };
      case 'precio':
        return { handoff: false, mensaje: `${elegir(FRASES_PRECIO)} ${entidad.nombre || entidad.bro_id}: ${entidad.ref_price || entidad.product_price || 'precio no disponible'}.`, bolas: [] };
      case 'ubicacion':
        return { handoff: false, mensaje: `${elegir(FRASES_UBICACION)} ${entidad.nombre || entidad.bro_id} está en ${entidad.address || entidad.nearby_ref || entidad.ciudad || 'ubicación no disponible'}.`, bolas: [] };
      case 'catalogo':
        return { handoff: false, mensaje: `${elegir(FRASES_CATALOGO)} ${entidad.nombre || entidad.bro_id}: ${entidad.catalog_url ? `ver catálogo en ${entidad.catalog_url}` : 'catálogo no disponible por ahora'}.`, bolas: [] };
      case 'contacto':
        return { handoff: false, mensaje: `${elegir(FRASES_CONTACTO)} ${entidad.nombre || entidad.bro_id} — ${entidad.address || 'datos de contacto no disponibles'}.`, bolas: [] };
      default:
        return { handoff: false, mensaje: `${elegir(FRASES_DESCRIPCION)} ${entidad.nombre || entidad.bro_id} — ${entidad.description || entidad.categoria || 'sin descripción disponible'}.`, bolas: [] };
    }
  }

  // ── Saludo / bienvenida ──────────────────────────────────────────────
  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    return {
      handoff: false,
      mensaje: update?.historia ? update.historia + ' ¿Qué producto buscas?' : elegir(FRASES_BIENVENIDA),
      bolas: [],
    };
  }

  // ── Sin entidad — sin tarjetas ───────────────────────────────────────
  if (!hayTarjetas) {
    return { handoff: false, mensaje: elegir(FRASES_SIN_RESULTADOS), bolas: [] };
  }

  // ── Explorar con tarjetas disponibles ───────────────────────────────
  return { handoff: false, mensaje: elegir(FRASES_EXPLORAR), bolas: [] };
}

// ── Frase de búsqueda lanzada (para useAgentChat) ────────────────────────────
export function fraseBuscando() {
  return elegir(FRASES_BUSCANDO);
}
