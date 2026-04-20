// src/services/agents/bots/reinosUtils.js
// Detección temprana para sector Reinos — Rumores.
// Sin handoffs internos — solo detección de salida a OSOS.

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS DE SALIDA → OSOS
// ─────────────────────────────────────────────────────────────────────

const KEYWORDS_SALIDA = [
  // Explícito
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  // Sectores ajenos
  'producto', 'productos', 'tienda', 'shop', 'nova', 'broshop',
  'servicio', 'servicios', 'isabella', 'profesor', 'prmaestro',
  'aviso', 'avisos', 'anuncio', 'anuncios', 'evelyn', 'larry',
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'juego', 'juegos', 'games',
];

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS DE INTENCIÓN
// ─────────────────────────────────────────────────────────────────────

const INTENT_KEYWORDS = {
  listar:    ['lista', 'todos', 'ver todo', 'que hay', 'qué hay', 'directorio'],
  novedades: ['novedad', 'nuevo', 'última', 'ultima', 'reciente', 'update'],
  detalle:   ['que es', 'qué es', 'cuentame', 'cuéntame', 'info', 'dime'],
};

// ─────────────────────────────────────────────────────────────────────
// FRASES DE SALIDA
// ─────────────────────────────────────────────────────────────────────

const FRASES_SALIDA = [
  'Espera, que te paso con los Osos. 🎬',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Yo vuelvo a mis notas.',
  'Te paso con los Osos. Los Reinos siguen aquí.',
];

// ─────────────────────────────────────────────────────────────────────
// NORMALIZAR
// ─────────────────────────────────────────────────────────────────────

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ─────────────────────────────────────────────────────────────────────
// DETECTAR SALIDA → OSOS
// Retorna { salida: true, mensaje } o null
// ─────────────────────────────────────────────────────────────────────

export const detectarSalidaReinos = (texto) => {
  const t = norm(texto);
  const quiereSalir = KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)));
  if (!quiereSalir) return null;
  return {
    salida:  true,
    mensaje: FRASES_SALIDA[Math.floor(Math.random() * FRASES_SALIDA.length)],
  };
};

// ─────────────────────────────────────────────────────────────────────
// DETECTAR INTENCIÓN
// Retorna string con la intención o 'explorar' como fallback
// ─────────────────────────────────────────────────────────────────────

export const detectarIntencionReinos = (texto) => {
  const t = norm(texto);
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(kw => t.includes(norm(kw)))) return intent;
  }
  return 'explorar';
};