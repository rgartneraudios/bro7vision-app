// src/services/agents/bots/novaBot.js
// BOT JS PURO — Personaje: Nova (Adolescente curiosa, sector Productos)
// Sin IA, sin API, sin dependencias externas.
// Contrato de salida idéntico al JSON que devuelven los demás bots.

// ─────────────────────────────────────────────────────────────────────────────
// FRASES
// ─────────────────────────────────────────────────────────────────────────────

const FRASES_BIENVENIDA = [
  "Hola, soy Nova 📦 Estaba armando unos paquetes. ¿Qué producto buscas?",
  "Nova aquí. Acabo de sacar unas fotos del almacén — todo ordenado. ¿Qué necesitas?",
  "¡Hola! Soy Nova. ¿Buscas algo concreto o quieres ver qué hay?",
  "Nova al habla. Me pillas con el té verde todavía caliente. ¿Qué producto te interesa?",
];

const FRASES_EXPLORAR = [
  "Cuéntame más. ¿Qué tipo de producto buscas?",
  "¿Tienes algo en mente o prefieres que te muestre lo que hay?",
  "Dime qué buscas y lo encuentro. Conozco cada rincón del almacén.",
];

const FRASES_DESCRIPCION = [
  "Déjame contarte lo que sé de este comercio.",
  "Tengo los detalles aquí mismo. Mira —",
  "Lo conozco bien. Te cuento.",
];

const FRASES_PRECIO = [
  "El precio es lo primero que miro cuando armo los paquetes. Te digo lo que tengo.",
  "Déjame ver qué referencia de precio tengo.",
];

const FRASES_UBICACION = [
  "La ubicación la tengo anotada. Ahora te digo.",
  "Sé exactamente dónde está. Mira —",
];

const FRASES_CATALOGO = [
  "El catálogo lo tengo bastante controlado. Te muestro lo que hay.",
  "Déjame abrir el inventario.",
];

const FRASES_CONTACTO = [
  "El contacto lo tengo aquí. Un momento.",
  "Te paso los datos de contacto ahora mismo.",
];

const FRASES_HANDOFF_VENTAS = [
  "Te llevo directo al producto. Ahora mismo.",
  "Vamos al detalle. Te abro la ficha.",
];

const FRASES_HANDOFF_OSOS = [
  "Te mando con recepción. Hasta luego 📷",
  "Vuelvo a los paquetes. Los osos te atienden.",
];

const FRASES_NO_ENTENDIDO = [
  "No te he pillado bien. ¿Buscas un producto concreto o quieres explorar?",
  "Cuéntame de otra forma. ¿Qué estás buscando exactamente?",
];

const FRASES_SIN_RESULTADOS = [
  "No encuentro nada que encaje con eso ahora mismo.",
  "En el almacén no tenemos eso de momento. ¿Buscas otra cosa?",
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDAD
// ─────────────────────────────────────────────────────────────────────────────

function elegir(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectarIntencion(texto) {
  const t = texto.toLowerCase();
  if (t.includes('precio') || t.includes('cuánto') || t.includes('cuanto') || t.includes('cuesta') || t.includes('vale')) return 'precio';
  if (t.includes('dónde') || t.includes('donde') || t.includes('ubicación') || t.includes('ubicacion') || t.includes('dirección') || t.includes('llegar')) return 'ubicacion';
  if (t.includes('catálogo') || t.includes('catalogo') || t.includes('qué tiene') || t.includes('que tiene') || t.includes('productos') || t.includes('stock')) return 'catalogo';
  if (t.includes('contacto') || t.includes('teléfono') || t.includes('telefono') || t.includes('horario') || t.includes('whatsapp')) return 'contacto';
  if (t.includes('qué es') || t.includes('que es') || t.includes('cuéntame') || t.includes('cuentame') || t.includes('info') || t.includes('descripción')) return 'descripcion';
  return 'explorar';
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONDER
// ─────────────────────────────────────────────────────────────────────────────

export function responder({
  textoUser = '',
  intencion = null,
  entidad = null,      // entidad detectada por el PS (nombre, bro_id, datos)
  hayTarjetas = false,
  update = null,
}) {

  const intent = intencion || detectarIntencion(textoUser);
  const t = textoUser.toLowerCase();

  // ── Handoff a Osos ──────────────────────────────────────────────────
  if (t.includes('volver') || t.includes('salir') || t.includes('osos')) {
    return {
      handoff: 'OSOS',
      mensaje: elegir(FRASES_HANDOFF_OSOS),
      bolas:   [],
    };
  }

  // ── Handoff a Ventas — entidad con acción directa ───────────────────
  if (entidad?.accion === 'VENTAS') {
    return {
      handoff:  'NOVA_CIERRE',
      bro_id:   entidad.bro_id,
      mensaje:  elegir(FRASES_HANDOFF_VENTAS),
      bolas:    [],
    };
  }

  // ── Con entidad detectada — responder según intención ───────────────
  if (entidad) {
    switch (intent) {
      case 'descripcion':
        return {
          handoff: false,
          mensaje: `${elegir(FRASES_DESCRIPCION)} ${entidad.nombre || entidad.bro_id} — ${entidad.description || entidad.categoria || 'sin descripción disponible'}.`,
          bolas:   [],
        };
      case 'precio':
        return {
          handoff: false,
          mensaje: `${elegir(FRASES_PRECIO)} ${entidad.nombre || entidad.bro_id}: ${entidad.ref_price || entidad.product_price || 'precio no disponible'}.`,
          bolas:   [],
        };
      case 'ubicacion':
        return {
          handoff: false,
          mensaje: `${elegir(FRASES_UBICACION)} ${entidad.nombre || entidad.bro_id} está en ${entidad.address || entidad.nearby_ref || entidad.ciudad || 'ubicación no disponible'}.`,
          bolas:   [],
        };
      case 'catalogo':
        return {
          handoff: false,
          mensaje: `${elegir(FRASES_CATALOGO)} ${entidad.nombre || entidad.bro_id}: ${entidad.catalog_url ? `ver catálogo en ${entidad.catalog_url}` : 'catálogo no disponible por ahora'}.`,
          bolas:   [],
        };
      case 'contacto':
        return {
          handoff: false,
          mensaje: `${elegir(FRASES_CONTACTO)} ${entidad.nombre || entidad.bro_id} — ${entidad.address || 'datos de contacto no disponibles'}.`,
          bolas:   [],
        };
      default:
        return {
          handoff: false,
          mensaje: `${elegir(FRASES_DESCRIPCION)} ${entidad.nombre || entidad.bro_id} — ${entidad.description || entidad.categoria || 'sin descripción disponible'}.`,
          bolas:   [],
        };
    }
  }

  // ── Sin entidad — sin tarjetas ──────────────────────────────────────
  if (!hayTarjetas) {
    return {
      handoff: false,
      mensaje: elegir(FRASES_SIN_RESULTADOS),
      bolas:   [],
    };
  }

  // ── Saludo / bienvenida ─────────────────────────────────────────────
  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) {
      return {
        handoff: false,
        mensaje: update.historia + ' ¿Qué producto buscas?',
        bolas:   [],
      };
    }
    return {
      handoff: false,
      mensaje: elegir(FRASES_BIENVENIDA),
      bolas:   [],
    };
  }

  // ── Explorar con tarjetas disponibles ──────────────────────────────
  if (hayTarjetas) {
    return {
      handoff: false,
      mensaje: elegir(FRASES_EXPLORAR),
      bolas:   [],
    };
  }

  // ── Fallback ────────────────────────────────────────────────────────
  return {
    handoff: false,
    mensaje: elegir(FRASES_NO_ENTENDIDO),
    bolas:   [],
  };
}
