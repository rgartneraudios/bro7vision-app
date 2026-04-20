// src/services/agents/bots/avisoUtils.js
// Detección temprana para sector Avisos — Evelyn + Larry.
// Pre-filtra intenciones antes de gastar tokens en Gemini.

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS DE SALIDA → OSOS
// ─────────────────────────────────────────────────────────────────────

const KEYWORDS_SALIDA = [
  // Explícito
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  // Sectores ajenos
  'producto', 'productos', 'tienda', 'shop', 'nova', 'broshop',
  'servicio', 'servicios', 'isabella', 'profesor', 'prmaestro',
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'reinos', 'reino', 'rumores',
  'juego', 'juegos', 'games',
];

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS INTERNAS — switch Evelyn ↔ Larry
// ─────────────────────────────────────────────────────────────────────

const KEYWORDS_LARRY  = ['larry', 'el larry'];
const KEYWORDS_EVELYN = ['evelyn', 'la evelyn'];

// ─────────────────────────────────────────────────────────────────────
// FRASES DE SALIDA
// ─────────────────────────────────────────────────────────────────────

const FRASES_SALIDA = [
  'Espera, que te paso con los Osos.',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Hasta luego.',
  'Te paso con los Osos. Vuelvo al tablón.',
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

export const detectarSalidaAviso = (texto) => {
  const t = norm(texto);
  const quiereSalir = KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)));
  if (!quiereSalir) return null;
  return {
    salida:  true,
    mensaje: FRASES_SALIDA[Math.floor(Math.random() * FRASES_SALIDA.length)],
  };
};

// ─────────────────────────────────────────────────────────────────────
// DETECTAR HANDOFF INTERNO — Evelyn ↔ Larry
// Retorna { interno: true, personaje_id } o null
// ─────────────────────────────────────────────────────────────────────

export const detectarInternoAviso = (texto, personajeActivo) => {
  const t = norm(texto);

  if (personajeActivo !== 'larry' && KEYWORDS_LARRY.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'larry' };
  }

  if (personajeActivo !== 'evelyn' && KEYWORDS_EVELYN.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'evelyn' };
  }

  return null;
};