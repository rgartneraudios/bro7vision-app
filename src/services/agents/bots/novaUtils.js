// src/services/agents/novaUtils.js
// Detección temprana para Nova — sector productos.
// Pre-filtra intenciones antes de gastar tokens en Gemini.
// Mismo patrón que ososPS.js pero enfocado en el contexto de Nova.

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS DE SALIDA — cualquier sector ajeno → OSOS
// ─────────────────────────────────────────────────────────────────────

const KEYWORDS_SALIDA = [
  // Explícito
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  // Sectores ajenos
  'servicio', 'servicios', 'isabella', 'profesor', 'prmaestro',
  'aviso', 'avisos', 'anuncio', 'anuncios', 'evelyn', 'larry',
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'reinos', 'reino', 'rumores',
  'juego', 'juegos', 'games',
];

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS DE INTENCIÓN — para pre-filtrar sin Gemini
// ─────────────────────────────────────────────────────────────────────

const INTENT_KEYWORDS = {
  precio:    ['precio', 'cuánto', 'cuanto', 'cuesta', 'vale', 'coste', 'costo', 'tarifa'],
  ubicacion: ['dónde', 'donde', 'ubicación', 'ubicacion', 'dirección', 'direccion', 'llegar', 'sitio', 'lugar'],
  catalogo:  ['catálogo', 'catalogo', 'productos', 'stock', 'qué tiene', 'que tiene', 'qué hay', 'que hay', 'inventario'],
  contacto:  ['contacto', 'teléfono', 'telefono', 'whatsapp', 'horario', 'email', 'correo'],
  descripcion: ['qué es', 'que es', 'cuéntame', 'cuentame', 'info', 'descripción', 'descripcion', 'detalles'],
};

// ─────────────────────────────────────────────────────────────────────
// FRASES DE SALIDA — Nova despide sin gastar tokens
// ─────────────────────────────────────────────────────────────────────

const FRASES_SALIDA = [
  'Espera, que te paso con los Osos. 📷',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Vuelvo al almacén.',
  'Te paso con los Osos. Suerte por ahí.',
];

const fraseSalida = () =>
  FRASES_SALIDA[Math.floor(Math.random() * FRASES_SALIDA.length)];

// ─────────────────────────────────────────────────────────────────────
// NORMALIZAR
// ─────────────────────────────────────────────────────────────────────

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ─────────────────────────────────────────────────────────────────────
// DETECTAR SALIDA — ¿quiere irse Nova?
// Retorna { salida: true, mensaje } o null
// ─────────────────────────────────────────────────────────────────────

export const detectarSalidaNova = (texto) => {
  const t = norm(texto);
  const quiereSalir = KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)));
  if (!quiereSalir) return null;
  return {
    salida:  true,
    mensaje: fraseSalida(),
  };
};

// ─────────────────────────────────────────────────────────────────────
// DETECTAR INTENCIÓN — precio, ubicación, catálogo, etc.
// Retorna string con la intención o 'explorar' como fallback
// ─────────────────────────────────────────────────────────────────────

export const detectarIntencionNova = (texto) => {
  const t = norm(texto);
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(kw => t.includes(norm(kw)))) return intent;
  }
  return 'explorar';
};